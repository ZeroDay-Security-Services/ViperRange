const fs = require("fs");
const path = require("path");

const tsPath = path.join(__dirname, "..", "prisma", "seed.ts");
const jsPath = path.join(__dirname, "..", "prisma", "seed.js");

let code = fs.readFileSync(tsPath, "utf8");

// Convert ESM imports to CommonJS requires
code = code.replace(/import\s+{\s*PrismaClient\s*}\s+from\s+["']@prisma\/client["'];?/, 'const { PrismaClient } = require("@prisma/client");');
code = code.replace(/import\s+bcrypt\s+from\s+["']bcryptjs["'];?/, 'const bcrypt = require("bcryptjs");');
code = code.replace(/import\s+crypto\s+from\s+["']crypto["'];?/, 'const crypto = require("crypto");');

// Remove TypeScript interfaces
code = code.replace(/interface\s+SeedWalkthrough\s*\{[\s\S]*?\n\}/g, "");
code = code.replace(/interface\s+SeedLab\s*\{[\s\S]*?\n\}/g, "");

// Remove type annotations
code = code.replace(/function hashFlag\(flag:\s*string\):\s*string/g, "function hashFlag(flag)");
code = code.replace(/const LABS:\s*SeedLab\[\]\s*=/g, "const LABS =");

fs.writeFileSync(jsPath, code, "utf8");
console.log("Successfully generated prisma/seed.js");
