#!/usr/bin/env python3
"""ViperRange — artifact playability verifier.

For every lab the forge generates, this script solves it from the published
artifact alone (it reads the flag from `prisma/seed.js` only to compare), then
reports PASS/FAIL. Labs that cannot be forged without a native toolchain are
reported as PENDING with the blocking reason — never as passing.

Usage:
    python scripts/labforge/verify_artifacts.py
Exit code 0 only when every generated artifact was solved.
"""

import io
import json
import math
import os
import struct
import sys
import zipfile
import zlib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common import ARTIFACT_ROOT, ROOT  # noqa: E402
from build_artifacts import BRAILLE_BY_CODE, _iroot, flag_for, seed_flags  # noqa: E402

PUBLIC = os.path.join(ROOT, "public")


def read(slug, name):
    return open(os.path.join(ARTIFACT_ROOT, slug, name), "rb").read()


# ---------------------------------------------------------------------------
# Minimal PNG decoder (8-bit RGB, filter type 0) — enough for forged plates.
# ---------------------------------------------------------------------------
def decode_png(data):
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    pos = 8
    width = height = None
    idat = b""
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos: pos + 4])
        kind = data[pos + 4: pos + 8]
        payload = data[pos + 8: pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            width, height, depth, color, _, _, interlace = struct.unpack(">IIBBBBB", payload)
            assert (depth, color, interlace) == (8, 2, 0), "unexpected PNG format"
        elif kind == b"IDAT":
            idat += payload
        elif kind == b"IEND":
            break
    raw = zlib.decompress(idat)
    stride = width * 3
    rows = []
    prev = bytearray(stride)
    p = 0
    for _ in range(height):
        ftype = raw[p]
        p += 1
        line = bytearray(raw[p: p + stride])
        p += stride
        assert ftype == 0, f"unsupported filter {ftype}"
        prev = line
        rows.append(prev)
    return width, height, rows


def pixels_of(data):
    w, h, rows = decode_png(data)
    return [[tuple(row[x * 3: x * 3 + 3]) for x in range(w)] for row in rows]


# ---------------------------------------------------------------------------
# Solvers
# ---------------------------------------------------------------------------
def solve_masked_xor(flag):
    hexed = b"".join(
        line.strip() for line in read("masked-xor", "intercept.txt").splitlines()
        if not line.strip().startswith(b"#")
    )
    raw = bytes.fromhex(hexed.decode())
    # The decoy '@' was inserted after every 7 ciphertext bytes.
    clean = bytes(b for i, b in enumerate(raw) if (i + 1) % 8 != 0)
    key = b"VIPERKEY"  # codename named in the brief
    plain = bytes(b ^ key[i % len(key)] for i, b in enumerate(clean)).decode()
    return plain


def _contfrac(n, d):
    while d:
        q = n // d
        yield q
        n, d = d, n - q * d


def _convergents(cf):
    n0, n1 = 0, 1
    d0, d1 = 1, 0
    for a in cf:
        n0, n1 = n1, a * n1 + n0
        d0, d1 = d1, a * d1 + d0
        yield n1, d1


def solve_narrow_key(flag):
    data = json.loads(read("narrow-key", "intercept.json"))
    n, e, c = data["n"], data["e"], data["c"]
    for k, d in _convergents(_contfrac(e, n)):
        if k == 0:
            continue
        phi = (e * d - 1) // k
        s = n - phi + 1
        disc = s * s - 4 * n
        if disc < 0:
            continue
        r = math.isqrt(disc)
        if r * r != disc:
            continue
        m = pow(c, d, n)
        return m.to_bytes((m.bit_length() + 7) // 8, "big").decode()
    raise AssertionError("Wiener attack failed")


def _crt(pairs):
    total = 1
    for n, _ in pairs:
        total *= n
    result = 0
    for n, r in pairs:
        partial = total // n
        result += r * partial * pow(partial, -1, n)
    return result % total


def solve_chinese_broadcast(flag):
    data = json.loads(read("chinese-broadcast", "broadcast.json"))
    e = data["e"]
    pairs = [(entry["n"], entry["c"]) for entry in data["ciphertexts"]]
    m = _crt(pairs)
    root = _iroot(m, e)
    for candidate in range(max(0, root - 2), root + 3):
        if candidate ** e == m:
            return candidate.to_bytes((candidate.bit_length() + 7) // 8, "big").decode()
    raise AssertionError("integer root not exact — CRT result was not a perfect cube")


def solve_binary_carve(flag):
    data = read("binary-carve", "exhibit.png")
    png_end = data.rfind(b"IEND") + 8
    start = data.find(b"PK\x03\x04", png_end)
    assert start != -1, "no zip signature after IEND"
    with zipfile.ZipFile(io.BytesIO(data[start:])) as zf:
        return zf.read("recovered/flag.txt").decode().strip()


def solve_braille_cipher(flag):
    cells = pixels_of(read("braille-cipher", "plate.png"))
    # Rebuild the LSB stream exactly as the image carries it.
    bits = []
    for row in cells:
        for (r, g, b) in row:
            bits.extend([r & 1, g & 1, b & 1])
    out = bytearray()
    for i in range(0, len(bits) - 7, 8):
        val = 0
        for bit in bits[i: i + 8]:
            val = (val << 1) | bit
        out.append(val)
    # lsb_embed prefixes a 4-byte length; the payload then starts with the cell count.
    count = out[4]
    body = "".join(BRAILLE_BY_CODE.get(out[5 + i], "?") for i in range(count))
    return "VR{" + body + "}"


def solve_hex_delta(flag):
    with zipfile.ZipFile(io.BytesIO(read("hex-delta", "plates.zip"))) as zf:
        before = pixels_of(zf.read("before.png"))
        after = pixels_of(zf.read("after.png"))
    chars = []
    for y in range(len(before)):
        for x in range(len(before[0])):
            if before[y][x] != after[y][x]:
                chars.append(chr(after[y][x][2]))
    text = "".join(chars).strip("\x00")
    return text.split("\x00")[0]


def solve_deep_grep(flag):
    with zipfile.ZipFile(io.BytesIO(read("deep-grep", "sessions.zip"))) as zf:
        for name in zf.namelist():
            if name in ("README.txt",):
                continue
            text = zf.read(name).decode()
            if "note: VR{" in text:
                return text.split("note: ")[1].strip()
    raise AssertionError("no differing session log")


def solve_multi_layer(flag):
    cipher = read("multi-layer", "ciphertext.txt").decode("latin-1").strip()
    src = read("multi-layer", "encode.py").decode()
    ns = {}
    exec(compile(src, "encode.py", "exec"), ns)  # noqa: S102 - solving our own artifact
    keystream = eval(src.split("KEYSTREAM = ")[1].split("\n")[0])  # noqa: S307
    shift = int(src.split("SHIFT = ")[1].split("\n")[0])

    def unperm(s, order):
        restore = [0] * len(order)
        for position, source in enumerate(order):
            if source < len(s):
                restore[source] = s[position]
        return "".join(restore)

    n = len(cipher)
    order_rev = list(range(n - 1, -1, -1))
    s3 = unperm(cipher, order_rev)
    order_split = list(range(0, len(s3), 2)) + list(range(1, len(s3), 2))
    s2 = unperm(s3, order_split).encode("latin-1")
    s1 = bytes(b ^ keystream[i % len(keystream)] for i, b in enumerate(s2)).decode("latin-1")
    return "".join(chr((ord(c) - 32 - shift) % 95 + 32) for c in s1)


SOLVERS = {
    "masked-xor": solve_masked_xor,
    "narrow-key": solve_narrow_key,
    "chinese-broadcast": solve_chinese_broadcast,
    "binary-carve": solve_binary_carve,
    "braille-cipher": solve_braille_cipher,
    "hex-delta": solve_hex_delta,
    "deep-grep": solve_deep_grep,
    "multi-layer": solve_multi_layer,
}

# Labs whose intended solve needs tooling this repo cannot run headlessly.
PENDING = {
    "invisible-script": "needs audio steganography extraction + whitespace interpreter",
    "stego-lock": "needs steghide/john against a real encrypted archive",
    "block-flip": "needs a live AES-CBC oracle endpoint",
    "rotor-maze": "needs a full Enigma implementation and the original rotor wiring",
    "overflow-zero": "needs gcc + gdb ELF build with fixed addresses",
    "overflow-one": "needs gcc + gdb ELF build with fixed addresses",
    "return-jump": "needs gcc + gdb ELF build with fixed addresses",
    "format-string": "needs gcc + gdb ELF build with fixed addresses",
    "smash-stack": "needs gcc + gdb ELF build against a specific libc",
    "pascal-decoder": "needs the original compiled binary",
    "bytecode-maze": "needs a frozen .pyc pair to disassemble",
    "math-circuit": "needs the original compiled checker binary",
    "egg-matrix": "needs the original generator script",
    "alias-prison": "needs a live restricted shell",
    "chroot-breach": "needs a live jailed SSH target",
    "linux-suid-path": "needs a live host with the SUID binary staged",
    "linux-cap-sysadmin": "needs a live host with the capability granted",
    "digital-echo": "fictional OSINT archive: reasoning task, no machine-checkable artifact",
    "ghost-archive": "fictional OSINT archive: reasoning task, no machine-checkable artifact",
    "shadow-agent": "fictional OSINT archive: reasoning task, no machine-checkable artifact",
    "osint-username-pivot": "fictional OSINT archive: reasoning task, no machine-checkable artifact",
    "osint-geolocation": "fictional OSINT archive: reasoning task, no machine-checkable artifact",
    "eval-escape": "needs a live remote eval() service",
    "voice-inject": "needs a live TTS bot service",
    "pixel-cache": "needs the deployed lab's generated stylesheet",
    "crawler-protocol": "needs the deployed lab's robots.txt",
    "style-injector": "needs a live browser session against the lab",
    "file-oracle": "deployable lab: needs its Docker target running",
    "session-architect": "deployable lab: needs its Docker target running",
    "cipher-gate": "deployable lab: needs its Docker target running",
    "loose-types": "deployable lab: needs its Docker target running",
    "template-engine": "deployable lab: needs its Docker target running",
    "api-bola-vault": "needs the API lab service running",
    "api-jwt-alg-confusion": "needs the API lab service running",
    "api-mass-assignment": "needs the API lab service running",
    "api-graphql-introspection": "needs the API lab service running",
    "api-ssrf-webhook": "needs the API lab service running",
    "net-dns-axfr": "needs a DNS server allowing AXFR",
    "net-ftp-anon": "needs an anonymous FTP service",
    "net-smb-enum": "needs an SMB server with a null session",
    "net-arp-spoof": "needs a live layer-2 segment",
    "net-port-pivot": "needs a dual-homed lab host",
}


def main():
    flags = seed_flags()
    passed, failed, missing = [], [], []

    for slug, solver in SOLVERS.items():
        try:
            got = solver(flag_for(flags, slug))
        except Exception as exc:  # noqa: BLE001 - report the failure verbatim
            failed.append((slug, f"{type(exc).__name__}: {exc}"))
            continue
        expected = flag_for(flags, slug)
        if got.strip() == expected.strip():
            passed.append(slug)
        else:
            failed.append((slug, f"recovered {got!r} but expected {expected!r}"))

    for slug in SOLVERS:
        if not os.path.isdir(os.path.join(ARTIFACT_ROOT, slug)):
            missing.append(slug)

    print(f"\nSolved from artifacts: {len(passed)}/{len(SOLVERS)}")
    for slug in passed:
        print(f"  PASS  {slug}")
    for slug, why in failed:
        print(f"  FAIL  {slug}: {why}")
    for slug in missing:
        print(f"  MISS  {slug}: no artifact directory")

    print("\nPending (no machine-checkable artifact in this build):")
    for slug in sorted(PENDING):
        print(f"  PENDING {slug:24s} {PENDING[slug]}")

    if failed or missing:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
