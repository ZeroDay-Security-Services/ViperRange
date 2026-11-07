"""Shared helpers for the ViperRange lab forge.

Every artifact is generated deterministically from the lab slug, so rebuilding
the repository always produces byte-identical challenge files (and therefore
stable SHA-256 integrity manifests).
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import random
import shutil
import struct
import zlib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PUBLIC = os.path.join(ROOT, "public")
ARTIFACT_ROOT = os.path.join(PUBLIC, "artifacts")
CATALOG_PATH = os.path.join(ROOT, "lib", "labs", "catalog.json")

FLAG_RE = rb"VR\{[^}]{2,120}\}"


def rng_for(slug: str) -> random.Random:
    seed = int.from_bytes(hashlib.sha256(slug.encode()).digest()[:8], "big")
    return random.Random(seed)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def ensure_dir(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return path


def lab_dir(slug: str) -> str:
    return ensure_dir(os.path.join(ARTIFACT_ROOT, slug))


def write_artifact(slug: str, name: str, data: bytes) -> dict:
    """Write a challenge file and return its public manifest entry."""
    d = lab_dir(slug)
    path = os.path.join(d, name)
    ensure_dir(os.path.dirname(path))
    with open(path, "wb") as fh:
        fh.write(data)
    rel = os.path.relpath(path, PUBLIC).replace(os.sep, "/")
    return {
        "name": name,
        "path": rel,
        "url": "/" + rel,
        "size": len(data),
        "sha256": sha256_bytes(data),
    }


def clean_slug_dir(slug: str) -> None:
    d = os.path.join(ARTIFACT_ROOT, slug)
    if os.path.isdir(d):
        shutil.rmtree(d)


# ----------------------------------------------------------------------------
# Flag sealing
# ----------------------------------------------------------------------------
# Many labs must not expose their flag to a naive `strings` / `grep`.  Those
# labs store the flag inside a container the intended analysis unlocks (an
# encrypted archive, an encrypted blob, a binary payload).  `sealed()` encodes
# the flag with a key derived from lab material so that a plaintext scan of the
# artifact directory finds nothing.


def xor_bytes(data: bytes, key: bytes) -> bytes:
    if not key:
        raise ValueError("xor key must not be empty")
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))


def sealed(flag: str, key: bytes) -> bytes:
    """Encrypt a flag so it is not recoverable by a plaintext scan.

    The construction is XOR-with-keystream plus a SHA-256 integrity tag.  It is
    intentionally simple: the security property the challenge relies on is that
    the *key* is hidden by the intended analysis path, not that the cipher is
    unbreakable.  Flags are never treated as secrets by the platform.
    """
    raw = flag.encode()
    stream = hashlib.sha256(key).digest()
    body = xor_bytes(raw, stream)
    tag = hashlib.sha256(b"vr-seal" + key + raw).digest()[:8]
    return struct.pack(">H", len(body)) + body + tag


def unsealed(blob: bytes, key: bytes) -> str:
    (n,) = struct.unpack(">H", blob[:2])
    body = blob[2 : 2 + n]
    tag = blob[2 + n : 2 + n + 8]
    raw = xor_bytes(body, hashlib.sha256(key).digest())
    if hashlib.sha256(b"vr-seal" + key + raw).digest()[:8] != tag:
        raise ValueError("integrity tag mismatch - wrong key")
    return raw.decode()


# ----------------------------------------------------------------------------
# Minimal PNG writer (no third-party dependencies)
# ----------------------------------------------------------------------------
def png_chunk(kind: bytes, payload: bytes) -> bytes:
    return (
        struct.pack(">I", len(payload))
        + kind
        + payload
        + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
    )


def write_png(path: str, width: int, height: int, pixels, extra_chunks=None) -> bytes:
    """pixels: list of rows, each row a list of (r,g,b) tuples."""
    raw = b"".join(b"\x00" + b"".join(bytes(px) for px in row) for row in pixels)
    data = b"\x89PNG\r\n\x1a\n"
    data += png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    for kind, payload in extra_chunks or []:
        data += png_chunk(kind, payload)
    data += png_chunk(b"IDAT", zlib.compress(raw, 9))
    data += png_chunk(b"IEND", b"")
    with open(path, "wb") as fh:
        fh.write(data)
    return data


def lsb_embed(pixels, payload: bytes):
    """Embed payload (with 4-byte length prefix) into the low bit of R,G,B."""
    blob = struct.pack(">I", len(payload)) + payload
    bits = []
    for byte in blob:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    out = []
    idx = 0
    for row in pixels:
        new_row = []
        for (r, g, b) in row:
            for channel in (0, 1, 2):
                if idx < len(bits):
                    if channel == 0:
                        r = (r & 0xFE) | bits[idx]
                    elif channel == 1:
                        g = (g & 0xFE) | bits[idx]
                    else:
                        b = (b & 0xFE) | bits[idx]
                    idx += 1
            new_row.append((r, g, b))
        out.append(new_row)
    if idx < len(bits):
        raise ValueError("image too small for payload")
    return out


def lsb_extract(pixels) -> bytes:
    bits = []
    for row in pixels:
        for (r, g, b) in row:
            bits.extend([r & 1, g & 1, b & 1])
    out = bytearray()
    for i in range(0, len(bits) - 7, 8):
        val = 0
        for bit in bits[i : i + 8]:
            val = (val << 1) | bit
        out.append(val)
    if len(out) < 4:
        raise ValueError("no payload")
    n = struct.unpack(">I", bytes(out[:4]))[0]
    return bytes(out[4 : 4 + n])


def gradient_pixels(width: int, height: int, rng: random.Random):
    rows = []
    for y in range(height):
        row = []
        for x in range(width):
            row.append(
                (
                    (x * 7 + y * 3 + rng.randint(0, 6)) % 256,
                    (x * 3 + y * 11 + rng.randint(0, 6)) % 256,
                    (x * 5 + y * 5 + rng.randint(0, 6)) % 256,
                )
            )
        rows.append(row)
    return rows


# ----------------------------------------------------------------------------
# Minimal PCAP writer
# ----------------------------------------------------------------------------
PCAP_MAGIC = 0xA1B2C3D4


class PcapWriter:
    """Writes a classic libpcap file with Ethernet/IPv4/TCP or UDP frames."""

    def __init__(self, rng: random.Random):
        self.rng = rng
        self.chunks: list[bytes] = []
        self.ts = 1_700_000_000.0
        self.flows: dict[tuple, int] = {}

    # -- frame plumbing ------------------------------------------------------
    def _next_ts(self) -> tuple[int, int]:
        self.ts += 0.001 + self.rng.random() * 0.02
        return int(self.ts), int((self.ts % 1) * 1_000_000)

    def _record(self, frame: bytes) -> None:
        sec, usec = self._next_ts()
        self.chunks.append(
            struct.pack("<IIII", sec, usec, len(frame), len(frame)) + frame
        )

    @staticmethod
    def _ip_bytes(addr: str) -> bytes:
        return bytes(int(p) for p in addr.split("."))

    @staticmethod
    def _checksum(data: bytes) -> int:
        if len(data) % 2:
            data += b"\x00"
        total = sum(struct.unpack(">%dH" % (len(data) // 2), data))
        while total >> 16:
            total = (total & 0xFFFF) + (total >> 16)
        return (~total) & 0xFFFF

    def _tcp_frame(self, src, dst, sport, dport, seq, ack, flags, payload=b"", mac=None, win=64240):
        eth = (mac or b"\x02\x00\x00\x00\x00\x01") + b"\x02\x00\x00\x00\x00\x02" + b"\x08\x00"
        offset_flags = (5 << 12) | flags
        tcp = struct.pack(
            ">HHIIHHHH",
            sport,
            dport,
            seq & 0xFFFFFFFF,
            ack & 0xFFFFFFFF,
            offset_flags,
            win,
            0,
            0,
        )
        pseudo = self._ip_bytes(src) + self._ip_bytes(dst) + struct.pack(">BBH", 0, 6, len(tcp) + len(payload))
        csum = self._checksum(pseudo + tcp + payload)
        tcp = tcp[:16] + struct.pack(">H", csum) + tcp[18:]
        ip = struct.pack(
            ">BBHHHBBH4s4s",
            0x45,
            0,
            20 + len(tcp) + len(payload),
            self.rng.randint(1, 65535),
            0x4000,
            64,
            6,
            0,
            self._ip_bytes(src),
            self._ip_bytes(dst),
        )
        ip = ip[:10] + struct.pack(">H", self._checksum(ip)) + ip[12:]
        self._record(eth + ip + tcp + payload)

    def _udp_frame(self, src, dst, sport, dport, payload=b""):
        eth = b"\x02\x00\x00\x00\x00\x01" + b"\x02\x00\x00\x00\x00\x02" + b"\x08\x00"
        udp = struct.pack(">HHHH", sport, dport, 8 + len(payload), 0)
        pseudo = self._ip_bytes(src) + self._ip_bytes(dst) + struct.pack(">BBH", 0, 17, len(udp) + len(payload))
        csum = self._checksum(pseudo + udp + payload) or 0xFFFF
        udp = udp[:6] + struct.pack(">H", csum)
        ip = struct.pack(
            ">BBHHHBBH4s4s", 0x45, 0, 20 + len(udp) + len(payload), self.rng.randint(1, 65535),
            0x4000, 64, 17, 0, self._ip_bytes(src), self._ip_bytes(dst),
        )
        ip = ip[:10] + struct.pack(">H", self._checksum(ip)) + ip[12:]
        self._record(eth + ip + udp + payload)

    # -- protocol helpers ---------------------------------------------------
    def tcp_stream(self, src, dst, sport, dport, client_payloads, server_payloads=None):
        """Emit a handshake, ordered client/server data, and a teardown."""
        cseq = self.rng.randint(1, 100000)
        sseq = self.rng.randint(1, 100000)
        self._tcp_frame(src, dst, sport, dport, cseq, 0, 0x02)
        self._tcp_frame(dst, src, dport, sport, sseq, cseq + 1, 0x12)
        self._tcp_frame(src, dst, sport, dport, cseq + 1, sseq + 1, 0x10)
        cseq += 1
        sseq += 1
        server_payloads = server_payloads or []
        for i in range(max(len(client_payloads), len(server_payloads))):
            if i < len(client_payloads):
                data = client_payloads[i]
                if data:
                    self._tcp_frame(src, dst, sport, dport, cseq, sseq, 0x18, data)
                    cseq += len(data)
            if i < len(server_payloads):
                data = server_payloads[i]
                if data:
                    self._tcp_frame(dst, src, dport, sport, sseq, cseq, 0x18, data)
                    sseq += len(data)
        self._tcp_frame(src, dst, sport, dport, cseq, sseq, 0x11)
        self._tcp_frame(dst, src, dport, sport, sseq, cseq + 1, 0x11)

    def udp_conversation(self, src, dst, sport, dport, messages):
        for payload in messages:
            self._udp_frame(src, dst, sport, dport, payload)

    # -- output -------------------------------------------------------------
    def write(self, path: str) -> bytes:
        header = struct.pack("<IHHiIII", PCAP_MAGIC, 2, 4, 0, 0, 65535, 1)
        data = header + b"".join(self.chunks)
        with open(path, "wb") as fh:
            fh.write(data)
        return data


def dns_name(name: str) -> bytes:
    out = b""
    for label in name.rstrip(".").split("."):
        out += bytes([len(label)]) + label.encode()
    return out + b"\x00"


def dns_query(txid: int, name: str, qtype: int = 1) -> bytes:
    return struct.pack(">HHHHHH", txid, 0x0100, 1, 0, 0, 0) + dns_name(name) + struct.pack(">HH", qtype, 1)


def dns_response(txid: int, questions: list[tuple[str, int]], answers: list[bytes]) -> bytes:
    qd = b"".join(dns_name(n) + struct.pack(">HH", t, 1) for n, t in questions)
    return (
        struct.pack(">HHHHHH", txid, 0x8580, len(questions), len(answers), 0, 0)
        + qd
        + b"".join(answers)
    )


def dns_answer(name: str, rtype: int, rdata: bytes, ttl: int = 300) -> bytes:
    return dns_name(name) + struct.pack(">HHIH", rtype, 1, ttl, len(rdata)) + rdata


def txt_answer(name: str, text: str) -> bytes:
    raw = text.encode()
    return dns_answer(name, 16, bytes([len(raw)]) + raw)


def file(name: str, data) -> dict:
    """Declare an artifact written by a builder (validated after build)."""
    return {"name": name, "data": data}
