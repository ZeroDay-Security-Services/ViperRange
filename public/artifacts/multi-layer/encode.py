#!/usr/bin/env python3
"""Recovered build script. Reversing the chain requires undoing each stage
in the opposite order to how it was applied here."""

SHIFT = 7
KEYSTREAM = b'\rcl\xa6\xf4\x92\x99UYzhJ\x1e\x9b\x0f\xd5'

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
    print(encode("VR{example}").decode("latin-1"))
