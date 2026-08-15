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

It provides an enterprise web platform paired with **39 original, realistic hands-on challenges** spanning Web Exploitation, Cryptography, Digital Forensics, Linux Privilege Escalation, Binary Exploitation (Pwn), Reverse Engineering, and Open-Source Intelligence (OSINT).

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
│   │ ├── Dashboard UI (React 18 + Tailwind CSS + Framer Motion) │      │
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
│   │ ├── 39 Lab Scenarios        │   │ ├── 8 Deployable Containers │    │
│   │ ├── Submissions & Flags     │   │ └── On-Demand Ephemeral Pods│    │
│   │ └── Real-time Telemetry     │   │                             │    │
│   └─────────────────────────────┘   └─────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Lab & Challenge Ecosystem (39 Modules)

ViperRange features **39 unique, independently authored scenarios** categorized into dynamic deployable containers and downloadable offline challenges:

### 1. 🌐 Web Exploitation (8 Deployable Docker Targets)
Each lab deploys into an isolated container running on designated ports:
* **File Oracle (`:8081`)** — Chained Local File Inclusion (LFI via `php://filter`) to Remote Code Execution.
* **Pixel Cache (`:8082`)** — Information disclosure via generated stylesheet build metadata.
* **Crawler Protocol (`:8083`)** — Search engine exclusion policy bypass and hidden archive traversal.
* **Session Architect (`:8084`)** — Base64-encoded cookie manipulation and privilege escalation.
* **Cipher Gate (`:8085`)** — Client-side JavaScript array rotation and string obfuscation deconstruction.
* **Loose Types (`:8086`)** — PHP `extract($_GET)` variable injection and execution override.
* **Template Engine (`:8087`)** — Python Tornado Server-Side Template Injection (SSTI) and HMAC cookie signing.
* **Style Injector (`:8088`)** — CSS attribute-selector side-channel exfiltration and prefix binary search.

### 2. 🔐 Cryptography (7 Offline Challenges)
* Wiener’s attack on small private exponent RSA.
* Bit-shifting arithmetic and substitution cipher analysis.
* AES-CBC initialization vector nonce reuse and key reconstruction.
* Discrete logarithm computation and Diffie-Hellman parameter flaws.

### 3. 🔍 Digital Forensics & Analysis (5 Offline Challenges)
* PCAP network stream packet carving and raw protocol extraction.
* Volatility memory dump analysis, process tree reconstruction, and mutex extraction.
* LSB Steganography and metadata carving across multi-layer media.

### 4. 🐧 Linux Internals & Privilege Escalation (3 Offline Challenges)
* SUID binary path hijacking and environment variable manipulation.
* Wildcard injection attacks against automated administrative cron jobs.
* Writable systemd service units and Linux permission auditing.

### 5. 💥 Binary Exploitation (6 Offline Challenges)
* Stack buffer overflow and instruction pointer control (`ret2win`).
* Format string vulnerabilities and arbitrary memory read/write primitives.
* ROP (Return-Oriented Programming) chain construction and NX bypass.

### 6. ⚙ Reverse Engineering (5 Offline Challenges)
* Keygen matrix reversing and assembly deobfuscation.
* Bytecode disassembly and anti-debugging evasion.
* Packed executable analysis and runtime binary reconstruction.

### 7. 📡 Synthetic OSINT & Misc (5 Challenges)
* Completely synthetic, privacy-safe intelligence trails and digital artifact correlation.
* Custom esoteric VM architectures and Git history vulnerability extraction.

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

# 2. Synchronize database schema and seed all 39 labs
docker compose exec app npx prisma db push
docker compose exec app node prisma/seed.js

# 3. Start all 8 deployable target lab containers
docker compose -f docker-compose.labs.yml up -d --build
```

Access the live services:
- **ViperRange Platform**: `http://localhost:3001`
- **Target Labs**: Ports `8081` through `8088`

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

Run the automated integration and validation test suites:

```bash
# Run unit and API tests
npm test

# Run offline labs flag validation audit
node scripts/test-offline-labs.js

# Run live deployable containers health audit
node scripts/test-online-labs.js
```

---

## 📄 License & Legal Notice

This project is licensed under the **MIT License**.

> **Notice**: All lab environments and exploit scenarios are designed exclusively for legal, authorized security education and research. Do not execute exploit techniques against systems without explicit, written authorization.

---

<div align="center">
  <sub>© 2026 ZeroDay Security Services. All rights reserved.</sub>
</div>
