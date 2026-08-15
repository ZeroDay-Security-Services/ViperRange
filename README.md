# ViperRange — Ephemeral Cyber Labs

> **Built by [ZeroDay Security Services](https://zeroday.in) · Siliguri, West Bengal, India**

```
╔══════════════════════════════════════════════════════╗
║  VIPERRANGE  ·  Ephemeral Cyber Labs                  ║
║  ZeroDay Security Services                            ║
╚══════════════════════════════════════════════════════╝
```

A production-grade, flag-submission cyber range platform with 39 original hands-on
labs across Web Exploitation, Cryptography, Forensics, Linux, Binary Exploitation,
Reverse Engineering, and OSINT. Deployable labs spin up isolated Docker containers
on Render in under 2 minutes; offline labs ship as downloadable challenge artifacts.
Every lab ends the same way — find the flag, submit it, earn points.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Vercel (Next.js — Frontend + API Routes)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Dashboard  │  │  Auth.js    │  │  Flag Submission │  │
│  │  (React)    │  │  (JWT)      │  │  /api/labs/*     │  │
│  └─────────────┘  └─────────────┘  └────────┬──────────┘  │
└──────────────────────────────────────────────┼────────────┘
                                                │ Render REST API v1
┌──────────────────────────────────────────────▼────────────┐
│  Render (Deployable Web Labs — 8 of 39)                    │
│  File Oracle · Pixel Cache · Crawler Protocol · ...        │
└──────────────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────┐
│  Neon PostgreSQL (free tier)               │
│  Users · Labs · Submissions · Completions  │
└─────────────────────────────────────────────┘
```

---

## The Lab Catalog

| Category | Count | Type |
|---|---|---|
| Web Exploitation | 8 | Deployable (live Docker environment per lab) |
| Cryptography | 7 | Offline (downloadable artifacts) |
| Forensics | 5 | Offline |
| Linux | 3 | Offline |
| Binary Exploitation (Pwn) | 6 | Offline |
| Reverse Engineering | 5 | Offline |
| OSINT | 3 | Offline (fully synthetic, fictional scenarios) |
| Miscellaneous | 2 | Offline |
| **Total** | **39** | |

Every lab — deployable or offline — is a genuine, independently solvable
challenge with a unique `VR{...}` flag. Flags are never exposed client-side;
submission is validated server-side against a SHA-256 hash.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| Backend | Next.js Route Handlers (serverless) |
| Auth | Auth.js v5 (NextAuth), bcrypt, JWT |
| Database | PostgreSQL via Neon (free tier) + Prisma ORM |
| Deployable Lab Hosting | Render Web Services (Docker containers) |
| Rate Limiting | Upstash Redis (free) · in-memory fallback |
| CI/CD | GitHub Actions → Vercel |
| Testing | Jest + Testing Library + Playwright |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- npm 9+
- PostgreSQL (or a [Neon](https://neon.tech) free-tier account)

### 1. Clone and install

```bash
git clone https://github.com/zeroday-security/viperrange.git
cd viperrange
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` — at minimum:

```env
DATABASE_URL="postgresql://user:pass@host/viperrange?sslmode=require"
AUTH_SECRET="run: openssl rand -base64 32"
RENDER_API_KEY=development_bypass   # Use this for local dev — no Render account needed
```

### 3. Set up the database

```bash
npm run db:migrate    # Creates tables
npm run db:seed       # Seeds all 39 labs, walkthroughs, and demo accounts
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:**
- Student: `student@demo.com` / `Student@Demo2024!`
- Admin: `admin@zeroday.in` / `Admin@ZeroDay2024!`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon recommended) |
| `AUTH_SECRET` | ✅ | 32-character random secret for JWT signing |
| `RENDER_API_KEY` | ✅ | Render API key. Use `development_bypass` for local dev |
| `RENDER_OWNER_ID` | ✅ (prod) | Your Render account owner ID |
| `LOCAL_LABS_ENABLED` | ⬜ | Set to `true` to route dev labs to local Docker containers |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin email addresses |
| `UPSTASH_REDIS_REST_URL` | ⬜ | Upstash Redis for production rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ⬜ | Upstash Redis token |
| `NEXT_PUBLIC_APP_URL` | ⬜ | Your deployment URL |

---

## Running Vulnerable Labs Locally (Docker)

To run the actual vulnerable deployable web lab containers on your local machine:

```bash
# Start all 8 deployable lab containers
npm run labs:up

# View live container logs
npm run labs:logs

# Stop all lab containers
npm run labs:down
```

When `LOCAL_LABS_ENABLED=true` is set in `.env.local`, clicking **"Start Lab"** on the dashboard will automatically connect directly to the running local container:

| Lab | Port | Vulnerability |
|---|---|---|
| File Oracle | `http://localhost:8081` | LFI to RCE |
| Pixel Cache | `http://localhost:8082` | Web Cache Deception |
| Crawler Protocol | `http://localhost:8083` | robots.txt & Path Traversal |
| Session Architect | `http://localhost:8084` | Session Token / Weak MAC |
| Cipher Gate | `http://localhost:8085` | Client-side Obfuscation / JS Cracking |
| Loose Types | `http://localhost:8086` | PHP Type Juggling & `extract()` |
| Template Engine | `http://localhost:8087` | Server-Side Template Injection (SSTI) |
| Style Injector | `http://localhost:8088` | CSS Injection / Exfiltration |

---

## Docker (Local Full Stack)

```bash
docker compose up -d --build
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

The app is served on `http://localhost:3001` (mapped from the container's internal port 3000).

---

## Building & Deploying Lab Images

Every deployable lab lives under `labs/<slug>/` with its own Dockerfile and
source. Build and push all eight images in one step:

```bash
cd labs
REGISTRY=yourorg ./build.sh --push
```

Update `dockerImage` in `prisma/seed.ts` to match your registry namespace,
then re-run `npm run db:seed`.

---

## Vercel Deployment

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Set environment variables in Vercel dashboard
4. Deploy

---

## Render Deployment

### Option A: render.yaml (recommended)

```bash
npm i -g @render.com/cli
render deploy
```

### Option B: Manual

1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Build command: `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
4. Start command: `npm start`
5. Add environment variables from the table above
6. Create a PostgreSQL database on Render and copy the connection string

---

## Database Migrations

```bash
npm run db:migrate         # Development: create and apply migration
npm run db:migrate:deploy  # Production: apply existing migrations only
npm run db:push            # Push schema without migration history (prototyping)
npm run db:studio          # Open Prisma Studio
npm run db:seed            # Reseed all 39 labs
```

---

## Testing

```bash
npm test                # Unit + integration tests
npm run test:coverage   # With coverage
npm run test:watch      # Watch mode
npm run test:e2e        # End-to-end (requires dev server running)
```

---

## API Documentation

### `POST /api/auth/register`
Register a new user account.

### `POST /api/start-lab`
Start a deployable lab. Requires authentication. Returns a deployment ID and
polls to `READY` once the container is live.

### `POST /api/stop-lab`
Stop a running deployable lab.

### `GET /api/labs`
List all labs (never includes the expected flag or Docker image name).
Supports `?category=CRYPTO`, `?labType=OFFLINE`, `?featured=true`.

### `POST /api/labs/[slug]/submit`
Submit a flag for validation.

```json
{ "flag": "VR{your_recovered_flag}" }
```

Response:
```json
{
  "success": true,
  "data": {
    "correct": true,
    "alreadyCompleted": false,
    "message": "Correct! Lab completed.",
    "pointsEarned": 150,
    "attemptCount": 3
  }
}
```

Validation happens entirely server-side against a SHA-256 hash — the plaintext
flag never leaves the database.

### `GET /api/labs/[slug]/hints?upTo=N`
Progressively reveal hints for a lab, up to hint number `N`.

### `GET /api/leaderboard`
Top 50 users ranked by total points earned.

### `GET /api/health`
Health check endpoint used by Render.

---

## Folder Structure

```
viperrange/
├── app/
│   ├── (auth)/              # Login / Register — split-panel desktop, single-column mobile
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Overview
│   │   ├── labs/            # Lab marketplace with category filters
│   │   ├── deployments/     # Deployment history
│   │   ├── logs/            # Live terminal
│   │   ├── walkthroughs/    # Step-by-step guides
│   │   ├── profile/ settings/ admin/ billing/
│   └── api/
│       ├── labs/[slug]/submit/   # Flag submission
│       ├── labs/[slug]/hints/    # Progressive hints
│       ├── leaderboard/
│       └── start-lab/ stop-lab/ lab-status/ logs/
├── components/
│   ├── auth/                # Split-panel login/register forms
│   ├── labs/                # Lab cards, challenge modal, flag submission
│   ├── dashboard/ logs/ ui/
├── labs/                    # Deployable lab source (8 labs, each self-contained)
│   ├── file-oracle/ pixel-cache/ crawler-protocol/ session-architect/
│   ├── cipher-gate/ loose-types/ template-engine/ style-injector/
│   └── build.sh
├── public/
│   ├── labs/                 # Synthetic evidence assets (SVG, fully original)
│   └── resources/            # Offline-lab downloadable artifacts
├── lib/
│   ├── auth/ api/ db/ utils/  # Flag hashing (SHA-256) lives in lib/utils
├── prisma/
│   ├── schema.prisma          # Lab, LabSubmission, LabCompletion models
│   └── seed.ts                # All 39 labs, walkthroughs, hints, flags
├── types/ __tests__/ e2e/
├── Dockerfile docker-compose.yml render.yaml vercel.json
└── .github/workflows/
```

---

## Flag Submission System

Every lab — deployable or offline — follows the same completion flow:

1. Student opens the lab (deploys a live environment, or opens the offline
   challenge modal with downloadable resources)
2. Student exploits the vulnerability / solves the puzzle / completes the
   investigation
3. Student recovers a `VR{...}` flag
4. Student submits it via the lab card or challenge modal
5. `POST /api/labs/[slug]/submit` hashes the submission and compares it
   against the stored SHA-256 hash — never the plaintext
6. On the first correct submission, a `LabCompletion` row is created,
   points are added to the student's `totalPoints`, and the UI updates
7. Every submission (right or wrong) is logged to `LabSubmission` for
   attempt tracking

Duplicate correct submissions do not award points twice.

---

## Security

- **Authentication**: bcrypt-hashed passwords (12 rounds), JWT sessions via Auth.js
- **Flag validation**: SHA-256 hash comparison via `crypto.timingSafeEqual` — resistant to timing attacks, never trusts the client
- **Rate Limiting**: Per-IP and per-user limits on auth, deployment, and flag-submission endpoints
- **Authorization**: Role-based (STUDENT / INSTRUCTOR / ADMIN) with row-level checks
- **Input Validation**: Zod schemas on all API inputs
- **SQL Injection**: Prisma parameterized queries only
- **Audit Logging**: All sensitive actions logged with IP, user agent, and metadata
- **Secrets**: Environment variables only — never committed to source; deployable-lab flags are injected via container `ENV`, never baked into a public image layer or exposed through `/api/labs`

---

## OSINT Labs — Synthetic Evidence Policy

All three OSINT labs (`digital-echo`, `shadow-agent`, `ghost-archive`) are
built entirely around fictional people, organizations, and events. No real
individual's photograph, identity, or personal data is used anywhere in the
platform. Evidence assets are original SVG graphics generated specifically
for ViperRange and depict no real person.

---

## Legal Notice

ViperRange is a security education platform. All lab environments are
intentionally vulnerable applications deployed for **authorized training
purposes only**.

- Users may **only** test their own spawned lab environments
- Attacking systems you do not own or have explicit permission to test is **illegal**
- ZeroDay Security Services is not responsible for misuse

---

## About ZeroDay Security Services

ZeroDay Security Services is a cybersecurity and intelligence technology
startup based in **Siliguri, West Bengal, India**. We operate across:

- Vulnerability Research
- Threat Intelligence
- OSINT Investigations
- AI Development
- Security Education

**ViperRange** is the practical training infrastructure for our security curriculum.

---

## License

MIT © 2026 ZeroDay Security Services 
