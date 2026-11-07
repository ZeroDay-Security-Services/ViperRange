<div align="center">

# ⚡ VIPERRANGE
### Enterprise-Grade Ephemeral Cyber Range & CTF Training Infrastructure
**Engineered by ZeroDay Security Services**

---

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Overview

**ViperRange** is a production-ready, full-stack cyber security training and range platform designed for offensive security research, red team training, and CTF competitions. 

It provides an enterprise web platform paired with **50 original, realistic hands-on challenges** spanning Web Exploitation, API Security, Network, Cryptography, Digital Forensics, Linux Privilege Escalation, Binary Exploitation (Pwn), Reverse Engineering, Open-Source Intelligence (OSINT) and Miscellaneous — 5 labs in each of 10 domains, tiered from beginner (L1) to expert (L6).

```
┌────────────────────────────────────────────────────────────────────────┐
│                          VIPERRANGE ARCHITECTURE                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ Client Browser ]                                                   │
│           │                                                            │
│           ▼                                                            │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │ Next.js 14 Web Application (Edge / Serverless Runtime)      │      │
│   │ ├── Dashboard UI (React 18 + Tailwind CSS + Framer Motion)  │      │
│   │ ├── NextAuth.js JWT Session Gatekeeper                      │      │
│   │ ├── Constant-Time SHA-256 Flag Verification Pipeline        │      │
│   │ └── RESTful APIs (/api/labs, /api/deployments, /api/logs)   │      │
│   └──────────────────────────────┬──────────────────────────────┘      │
│                                  │                                     │
│            ┌─────────────────────┴─────────────────────┐               │
│            ▼                                           ▼               │
│   ┌─────────────────────────────┐   ┌─────────────────────────────┐    │
│   │ PostgreSQL Database         │   │ Target Range Infrastructure │    │
│   │ ├── Users & Profiles        │   │ ├── Docker Bridge Network   │    │
│   │ ├── 50 Lab Scenarios        │   │ ├── 8 Deployable Containers │    │
│   │ ├── Submissions & Flags     │   │ └── On-Demand Ephemeral Pods│    │
│   │ └── Real-time Telemetry     │   │                             │    │
│   └─────────────────────────────┘   └─────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Lab & Challenge Ecosystem (50 Modules / 10 Domains)

ViperRange features **50 unique, independently authored scenarios** — exactly 5 per domain — each carrying a `VR-###` code, an objective, tooling hints, CWE/MITRE mapping and a remediation note.

### Difficulty tiers

| Tier | Labs | Typical profile |
|---|---|---|
| **L1 — Beginner** | 8 | Single obvious flaw, one tool |
| **L2 — Beginner+** | 10 | One flaw plus a small pivot |
| **L3 — Intermediate** | 12 | Chained weakness, tool fluency expected |
| **L4 — Intermediate+** | 10 | Multi-stage exploitation, custom payloads |
| **L5 — Advanced** | 7 | Realistic constraints, bypassing controls |
| **L6 — Expert** | 3 | Full chain research, long-form analysis |

### 1. 🌐 Web Exploitation (5) + 3 Deployable Misc Targets
Deployable container labs (ports `:8081`–`:8088`) now split by technique rather than all sitting under web:
* **Web Exploitation** — File Oracle (`:8081`, LFI→RCE), Session Architect (`:8084`, cookie forging), Cipher Gate (`:8085`, client-side obfuscation), Loose Types (`:8086`, `extract()` injection), Template Engine (`:8087`, SSTI→cookie forgery).
* **Miscellaneous** — Pixel Cache (`:8082`, build-metadata disclosure), Crawler Protocol (`:8083`, `robots.txt` enumeration), Style Injector (`:8088`, CSS side-channel exfiltration), plus Eval Escape and Voice Inject.

### 2. 🛰️ API Security (5)
* **Object Vault** — broken object level authorisation across tenants.
* **Field Injection** — mass assignment to `role: instructor`.
* **Schema Whisper** — GraphQL introspection to a deprecated, unauthorised query.
* **Algorithm Confusion** — JWT RS256/HS256 confusion to forge an admin token.
* **Webhook Relay** — SSRF blocklist bypass into cloud metadata credentials.

### 3. 📡 Network (5)
* **Zone Transfer** — unauthenticated DNS AXFR zone dump.
* **Anonymous Drop** — anonymous FTP share enumeration.
* **Share Sweep** — SMB null-session enumeration to an over-permissioned share.
* **Poisoned Arp** — ARP cache poisoning with plaintext credential capture.
* **Silent Pivot** — SOCKS pivot through a dual-homed foothold.

### 4. 🔐 Cryptography (5)
* Wiener’s attack on a small private exponent, Håstad broadcast with e=3, CBC bit-flipping malleability, repeating-key XOR with decoy padding, and a partially documented Enigma configuration.

### 5. 🔍 Digital Forensics (5)
* Appended-archive carving, LSB steganography (including a Braille-encoded payload), hex delta between near-identical plates, password-protected archives, and a multi-layer LSB→audio→whitespace chain.

### 6. 🐧 Linux Privilege Escalation (5)
* Alias-shadowed restricted shell, file-tree hunting, chroot breakout, SUID PATH hijacking, and `CAP_SYS_ADMIN` mount abuse.

### 7. 💥 Binary Exploitation (5)
* Adjacent-integer overwrite, exact-length overflow, `ret2win`, format-string arbitrary write, and `strcpy` ret2libc.

### 8. ⚙ Reverse Engineering (5)
* Combinatorial validator automation, staged Caesar/XOR/permutation chains, Python bytecode reconstruction, compiled arithmetic checkers, and a five-stage expert scramble.

### 9. 🔍 OSINT (5)
* All personas are fictional and synthetic: social pivot, archival photo forensics, movement correlation, username→email-pattern pivot, and skyline geolocation.

### Deprecated in v2
`factor-hunt` (covered by Narrow Key), `hill-descent` (covered by Chinese Broadcast) and `stack-flood` (covered by Overflow Zero/One) were retired so each domain holds exactly five labs.

---

## 🛠 Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend Platform** | Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons |
| **Backend Engine** | Next.js Edge / Node.js Route Handlers, TypeScript 5.4 |
| **Authentication** | Auth.js v5 (NextAuth), Argon2 / Bcrypt password hashing, JWT |
| **Database & ORM** | PostgreSQL 16, Prisma ORM, Connection Pooling |
| **Containerization** | Docker, Docker Compose, Alpine & Debian Slim Multi-stage Builds |
| **Testing Suite** | Jest, Playwright E2E, Supertest, Unit Validation Matrix |

---

## 🚀 Quick Start & Installation

### Prerequisites
* **Node.js**: `v20.x` or later
* **Docker Engine & Docker Compose**: `v24.x` or later
* **PostgreSQL**: Local instance or cloud database

### 1. Clone Repository
```bash
git clone https://github.com/ZeroDay-Security-Services/ViperRange.git
cd ViperRange
```

### 2. Environment Setup
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/viperrange?schema=public"
AUTH_SECRET="your-32-char-random-generated-secret"
LOCAL_LABS_ENABLED="true"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### 3. Full-Stack Docker Deployment (Recommended)
Launch the entire platform (Next.js Application + PostgreSQL + 8 Vulnerable Target Labs) with a single command:

```bash
# 1. Start core platform and database
docker compose up -d --build

# 2. Synchronize database schema and seed all 50 labs
docker compose exec app npx prisma db push
docker compose exec app node prisma/seed.js

# 3. Start all 8 deployable target lab containers
docker compose -f docker-compose.labs.yml up -d --build
```

Access the live services:
- **ViperRange Platform**: `http://localhost:3001`
- **Target Labs**: Ports `8081` through `8088`

### 4. Deploying to Render (Docker runtime)

This repository ships a `Dockerfile` and a `render.yaml`. The service builds with the
Dockerfile, so **the schema is not applied automatically** — the database must be
initialised once:

```bash
# `prisma/migrations/` does not exist yet, so use db push rather than migrate deploy
DATABASE_URL="postgresql://user:pass@host:5432/viperrange?sslmode=require" npx prisma db push
DATABASE_URL="postgresql://user:pass@host:5432/viperrange?sslmode=require" npm run db:seed
```

Required environment variables:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Render **Internal** URL for a same-region service (no `sslmode`); external URLs need `?sslmode=require` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | Exact public origin, no trailing slash |
| `ADMIN_EMAILS` | Comma-separated; **the only** path to the ADMIN role |
| `LOCAL_LABS_ENABLED` | `false` on hosted platforms — Render cannot run the Docker lab targets |

Seeded accounts (change the passwords immediately on any shared deployment):

| Email | Password | Role |
|---|---|---|
| `admin@zeroday.in` | `Admin@ZeroDay2024!` | ADMIN |
| `student@demo.com` | `Student@Demo2024!` | STUDENT |

---

## 🔒 Security Model & Flag Verification Architecture

Every challenge on ViperRange implements strict security and validation standards:

1. **Zero Client-Side Leakage**: Plaintext flags are never transmitted to or stored in client bundles.
2. **Cryptographic Verification**: Flag submissions are checked server-side using **SHA-256 constant-time comparison** (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
3. **Atomic Transactions**: Successful solves record completions, award points, and log audit trails in single ACID transactions (`prisma.$transaction`).
4. **Anti-Replay**: Duplicate submissions for previously solved challenges are rejected without double-crediting points.

---

## 📂 Project Structure

```
viperrange/
├── app/                      # Next.js App Router (Pages, Layouts, API Handlers)
│   ├── (auth)/               # Authentication views (Login, Registration)
│   ├── (dashboard)/          # Authenticated user dashboard & lab views
│   └── api/                  # Secure REST API endpoints
│       ├── labs/             # Flag submissions, hint distribution, marketplace
│       └── start-lab/        # Ephemeral container orchestration
├── components/               # Modular UI components
│   ├── auth/                 # Form controllers and security inputs
│   ├── dashboard/            # Shell layouts, stats, profile & settings managers
│   └── labs/                 # Interactive lab cards, challenge modal, flags
├── labs/                     # Source definitions for deployable target containers
│   ├── file-oracle/          # Port 8081 (LFI -> RCE Target)
│   ├── pixel-cache/          # Port 8082 (Asset Token Leak)
│   ├── crawler-protocol/     # Port 8083 (Exclusion Bypass)
│   ├── session-architect/    # Port 8084 (Cookie Privilege Elevation)
│   ├── cipher-gate/          # Port 8085 (JS Obfuscation Target)
│   ├── loose-types/          # Port 8086 (PHP extract Variable Override)
│   ├── template-engine/      # Port 8087 (Tornado SSTI Engine)
│   └── style-injector/       # Port 8088 (CSS Side-Channel Exfiltration)
├── prisma/                   # Database schema definitions and seed data
├── public/                   # Static branding, favicons, and challenge assets
├── scripts/                  # Automated verification & testing harnesses
├── docker-compose.yml        # Core platform & PostgreSQL compose configuration
└── docker-compose.labs.yml   # Deployable target containers orchestration
```

---

## 🧪 Testing & Validation

```bash
# Run unit and API tests
npm test

# Type-check and production build
npm run type-check && npm run build

# Generate challenge artifacts for the offline labs, then prove each flag is
# recoverable from the published file alone (exit 0 = every solver matched)
python scripts/labforge/build_artifacts.py
python scripts/labforge/verify_artifacts.py

# Run offline labs flag validation audit
node scripts/test-offline-labs.js

# Run live deployable containers health audit
node scripts/test-online-labs.js
```

### Artifact forge & playability status

`scripts/labforge/` generates deterministic challenge files into `public/artifacts/<slug>/`
with a SHA-256 manifest, and `prisma/seed.js` attaches them to each lab as downloadable
resources. Artifacts are reproducible: the RNG is seeded from the lab slug.

| Status | Labs | Meaning |
|---|---|---|
| **Solver-verified** | 8 | `verify_artifacts.py` recovers the exact flag from the artifact alone (masked-xor, narrow-key, chinese-broadcast, binary-carve, braille-cipher, hex-delta, deep-grep, multi-layer). |
| **Pending — needs live service** | 27 | Technique is reproducible but the solve needs the lab's container/API/network target running; not claimed as verified. |
| **Pending — needs native toolchain** | 15 | Needs gcc+gdb ELF builds, PHP, tshark, steghide/john or an audio toolchain that this repo does not ship headlessly. |

`verify_artifacts.py` prints every pending lab with its blocking reason and exits non-zero
if any forged artifact fails to solve — a lab is never reported as playable on the basis
of existing.

---

## 📄 License & Legal Notice

This project is licensed under the **MIT License**.

> **Notice**: All lab environments and exploit scenarios are designed exclusively for legal, authorized security education and research. Do not execute exploit techniques against systems without explicit, written authorization.

---

<div align="center">
  <sub>© 2026 ZeroDay Security Services. All rights reserved.</sub>
</div>
