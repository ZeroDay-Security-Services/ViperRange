#!/usr/bin/env python3
"""ViperRange — artifact forge.

Generates deterministic challenge files for the offline labs whose mechanics are
reproducible with the standard library, and records a manifest with SHA-256
digests. Every artifact written here is consumed by `verify_artifacts.py`, which
independently solves the lab and asserts the recovered flag matches the value the
platform expects (the same flag `prisma/seed.js` hashes into the database).

Labs whose intended analysis needs native toolchains that are not part of this
repo's build (gcc + gdb + libc offsets, PHP, tshark, steghide/audacity) are not
forged here; `verify_artifacts.py` prints them as PENDING with the reason.

Usage:
    python scripts/labforge/build_artifacts.py
"""

import io
import json
import math
import os
import re
import struct
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import common
from common import (
    ARTIFACT_ROOT,
    ROOT,
    ensure_dir,
    gradient_pixels,
    lab_dir,
    lsb_embed,
    rng_for,
    write_artifact,
    write_png,
    xor_bytes,
)

SEED_PATH = os.path.join(ROOT, "prisma", "seed.js")
V2_PATH = os.path.join(ROOT, "prisma", "labs-v2.js")


# ---------------------------------------------------------------------------
# Flag extraction — the seed is the single source of truth for expected flags.
# ---------------------------------------------------------------------------
def seed_flags():
    text = open(SEED_PATH, encoding="utf-8").read()
    text += "\n" + open(V2_PATH, encoding="utf-8").read()
    flags = {}
    for m in re.finditer(r'slug:\s*"([a-z0-9-]+)"', text):
        slug = m.group(1)
        window = text[m.end(): m.end() + 4000]
        fm = re.search(r'flag:\s*[`"\']?(VR\{[^}`"\']+\})', window)
        if fm:
            flags[slug] = fm.group(1)
    return flags


def flag_for(flags, slug):
    if slug not in flags:
        raise SystemExit(f"no flag found for {slug} in the seed")
    return flags[slug]


# ---------------------------------------------------------------------------
# Individual builders. Each returns a list of manifest entries.
# ---------------------------------------------------------------------------
def build_masked_xor(flag):
    """Repeating-key XOR with a decoy byte inserted at a fixed stride."""
    key = b"VIPERKEY"
    ct = xor_bytes(flag.encode(), key)
    out = bytearray()
    for i, b in enumerate(ct):
        out.append(b)
        if (i + 1) % 7 == 0:
            out.append(ord("@"))  # decoy
    body = (
        "# Intercepted fragment\n"
        "# Repeating-key XOR. A decoy '@' was inserted after every 7 ciphertext bytes.\n"
        "# Recover the key (hint: it is the codename in the brief), drop the decoys, XOR back.\n"
        + out.hex()
        + "\n"
    )
    return [write_artifact("masked-xor", "intercept.txt", body.encode())]


def _is_probable_prime(n):
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p
    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2
        r += 1
    for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(r - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def _next_prime(rng, bits):
    while True:
        cand = rng.getrandbits(bits) | (1 << (bits - 1)) | 1
        if _is_probable_prime(cand):
            return cand


def _egcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x, y = _egcd(b, a % b)
    return g, y, x - (a // b) * y


def _modinv(a, m):
    g, x, _ = _egcd(a % m, m)
    if g != 1:
        raise ValueError("not invertible")
    return x % m


def build_narrow_key(flag):
    """RSA with a deliberately small private exponent (Wiener-vulnerable)."""
    rng = rng_for("narrow-key")
    # Search for (p, q, e, d) with d < N^0.25/3, the Wiener condition.
    while True:
        p = _next_prime(rng, 256)
        q = _next_prime(rng, 256)
        if p == q:
            continue
        n = p * q
        phi = (p - 1) * (q - 1)
        d = _next_prime(rng, 120)  # small d (~2^120), below n^0.25/3
        if d >= n ** 0.25 / 3:
            continue
        if math.gcd(d, phi) != 1:
            continue
        try:
            e = _modinv(d, phi)
        except ValueError:
            continue
        if e == 1:
            continue
        break
    m = int.from_bytes(flag.encode(), "big")
    if m >= n:
        raise SystemExit("narrow-key: modulus too small for this flag")
    c = pow(m, e, n)
    body = json.dumps(
        {
            "scheme": "RSA",
            "note": "Private exponent was chosen small for 'performance'.",
            "n": n,
            "e": e,
            "c": c,
            "message_encoding": "utf-8 bytes as a big-endian integer",
        },
        indent=2,
    )
    return [write_artifact("narrow-key", "intercept.json", (body + "\n").encode())]


def _iroot(x, k):
    if x < 0:
        raise ValueError("negative")
    lo, hi = 0, 1 << ((x.bit_length() + k - 1) // k + 1)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid ** k <= x:
            lo = mid
        else:
            hi = mid - 1
    return lo


def build_chinese_broadcast(flag):
    """Same message, e=3, three different moduli (Hastad broadcast)."""
    rng = rng_for("chinese-broadcast")
    e = 3
    m = int.from_bytes(flag.encode(), "big")
    data = {"scheme": "RSA", "e": e, "note": "Same plaintext, three recipients.", "ciphertexts": []}
    while len(data["ciphertexts"]) < 3:
        p = _next_prime(rng, 512)
        q = _next_prime(rng, 512)
        if p == q:
            continue
        n = p * q
        if m >= n:
            continue
        if any(entry["n"] == n for entry in data["ciphertexts"]):
            continue
        data["ciphertexts"].append({"n": n, "c": pow(m, e, n)})
    body = json.dumps(data, indent=2)
    return [write_artifact("chinese-broadcast", "broadcast.json", (body + "\n").encode())]


def build_binary_carve(flag):
    """A PNG with a zip archive appended after IEND."""
    rng = rng_for("binary-carve")
    w, h = 96, 96
    pixels = gradient_pixels(w, h, rng)
    d = lab_dir("binary-carve")
    png_path = os.path.join(d, "exhibit.png")
    write_png(png_path, w, h, pixels)
    png_bytes = open(png_path, "rb").read()

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("recovered/flag.txt", flag + "\n")
        zf.writestr("recovered/README.txt", "Carved from appended data after the PNG IEND marker.\n")
    carved = png_bytes + buf.getvalue()
    os.remove(png_path)
    return [write_artifact("binary-carve", "exhibit.png", carved)]


BRAILLE = {
    "a": 0x01, "b": 0x03, "c": 0x09, "d": 0x19, "e": 0x11, "f": 0x0B, "g": 0x1B,
    "h": 0x13, "i": 0x0A, "j": 0x1A, "k": 0x05, "l": 0x07, "m": 0x0D, "n": 0x1D,
    "o": 0x15, "p": 0x0F, "q": 0x1F, "r": 0x17, "s": 0x0E, "t": 0x1E, "u": 0x25,
    "v": 0x27, "w": 0x3A, "x": 0x2D, "y": 0x3D, "z": 0x35,
    "_": 0x2B, "-": 0x24, "0": 0x34, "1": 0x02, "2": 0x06, "3": 0x12, "4": 0x32,
    "5": 0x22, "6": 0x2A, "7": 0x3E, "8": 0x36, "9": 0x16,
}
BRAILLE_BY_CODE = {v: k for k, v in BRAILLE.items()}


def encode_braille(text):
    cells = []
    for ch in text.lower():
        if ch not in BRAILLE:
            raise SystemExit(f"braille: no cell for {ch!r}")
        cells.append(BRAILLE[ch])
    return cells


def build_braille_cipher(flag):
    """LSB payload of six-bit Braille cells."""
    rng = rng_for("braille-cipher")
    w, h = 128, 128
    # Braille ASCII has no cell for '{' / '}', so the payload carries the flag
    # body; the solver re-wraps it.
    cells = encode_braille(flag[3:-1])
    payload = bytes([len(cells)]) + bytes(cells)
    payload += b"\x00" * (16 - (len(payload) % 16))
    pixels = lsb_embed(gradient_pixels(w, h, rng), payload)
    d = lab_dir("braille-cipher")
    write_png(os.path.join(d, "plate.png"), w, h, pixels)
    data = open(os.path.join(d, "plate.png"), "rb").read()
    return [write_artifact("braille-cipher", "plate.png", data)]


def build_hex_delta(flag):
    """Two near-identical images inside a zip; the delta encodes the flag."""
    rng = rng_for("hex-delta")
    w, h = 64, 64
    base = gradient_pixels(w, h, rng)
    modified = [[list(px) for px in row] for row in base]

    payload = flag.encode()
    idx = 0
    for y in range(h):
        for x in range(w):
            if idx >= len(payload):
                break
            modified[y][x][2] = payload[idx]  # overwrite blue channel with ASCII
            idx += 1

    d = lab_dir("hex-delta")
    a_path = os.path.join(d, "before.png")
    b_path = os.path.join(d, "after.png")
    write_png(a_path, w, h, base)
    write_png(b_path, w, h, [[tuple(px) for px in row] for row in modified])
    a_bytes = open(a_path, "rb").read()
    b_bytes = open(b_path, "rb").read()

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("before.png", a_bytes)
        zf.writestr("after.png", b_bytes)
        zf.writestr("note.txt", "Same dimensions, same palette. Only a few bytes differ.\n")
    os.remove(a_path)
    os.remove(b_path)
    return [write_artifact("hex-delta", "plates.zip", buf.getvalue())]


def build_deep_grep(flag):
    """A directory of hundreds of near-identical files; one differs."""
    rng = rng_for("deep-grep")
    template = (
        "session {i:05d}\n"
        "host: lab-{node:03d}\n"
        "result: OK\n"
        "checksum: {cs}\n"
    )
    files = []
    target = 37
    for i in range(120):
        node = i % 17
        cs = common.sha256_bytes(f"session-{i}".encode())[:12]
        text = template.format(i=i, node=node, cs=cs)
        if i == target:
            text += f"note: {flag}\n"
        files.append((f"logs/session-{i:05d}.log", text.encode()))

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, data in files:
            zf.writestr(name, data)
        zf.writestr("README.txt", "One session log carries an extra line. Everything else is noise.\n")
    return [write_artifact("deep-grep", "sessions.zip", buf.getvalue())]


def build_multi_layer(flag):
    """Caesar shift -> XOR keystream -> two fixed transpositions."""
    rng = rng_for("multi-layer")
    shift = 7
    keystream = bytes(rng.randrange(1, 256) for _ in range(16))
    text = flag

    def caesar(s, k):
        return "".join(chr((ord(c) - 32 + k) % 95 + 32) for c in s)

    def perm(s, order):
        return "".join(s[i] for i in order if i < len(s))

    stage1 = caesar(text, shift)
    stage2 = xor_bytes(stage1.encode(), keystream)
    stage2s = stage2.decode("latin-1")
    stage3 = perm(stage2s, list(range(0, len(stage2s), 2)) + list(range(1, len(stage2s), 2)))
    stage4 = perm(stage3, list(range(len(stage3) - 1, -1, -1)))

    script = f'''#!/usr/bin/env python3
"""Recovered build script. Reversing the chain requires undoing each stage
in the opposite order to how it was applied here."""

SHIFT = {shift}
KEYSTREAM = {keystream!r}

def caesar(s, k):
    return "".join(chr((ord(c) - 32 + k) % 95 + 32) for c in s)

def xor(data, key):
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

def perm(s, order):
    return "".join(s[i] for i in order if i < len(s))

def encode(flag):
    s1 = caesar(flag, SHIFT)
    s2 = xor(s1.encode(), KEYSTREAM)
    s2s = s2.decode("latin-1")
    s3 = perm(s2s, list(range(0, len(s2s), 2)) + list(range(1, len(s2s), 2)))
    return perm(s3, list(range(len(s3) - 1, -1, -1)))

if __name__ == "__main__":
    print(encode("VR{{example}}").decode("latin-1"))
'''
    return [
        write_artifact("multi-layer", "encode.py", script.encode()),
        write_artifact("multi-layer", "ciphertext.txt", (stage4 + "\n").encode("latin-1")),
    ]


BUILDERS = {
    "masked-xor": build_masked_xor,
    "narrow-key": build_narrow_key,
    "chinese-broadcast": build_chinese_broadcast,
    "binary-carve": build_binary_carve,
    "braille-cipher": build_braille_cipher,
    "hex-delta": build_hex_delta,
    "deep-grep": build_deep_grep,
    "multi-layer": build_multi_layer,
}


def main():
    flags = seed_flags()
    ensure_dir(ARTIFACT_ROOT)
    manifest = {"generated": [], "labs": {}}
    for slug, builder in BUILDERS.items():
        flag = flag_for(flags, slug)
        entries = builder(flag)
        manifest["labs"][slug] = entries
        manifest["generated"].append(slug)
        total = sum(e["size"] for e in entries)
        print(f"  {slug:20s} {len(entries)} file(s), {total:>8,} bytes")

    out = os.path.join(ARTIFACT_ROOT, "manifest.json")
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, sort_keys=True)
    print(f"\nWrote {out} ({len(manifest['generated'])} labs)")


if __name__ == "__main__":
    main()
