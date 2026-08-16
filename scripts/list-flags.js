const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "..", "prisma", "seed.ts"), "utf8");

// Split by lab objects
const chunks = content.split(/\{\s*slug:\s*"/g).slice(1);

const results = chunks.map((chunk, idx) => {
  const slug = chunk.match(/^([^"]+)"/)?.[1] || "";
  const name = chunk.match(/name:\s*"([^"]+)"/)?.[1] || "";
  const category = chunk.match(/category:\s*"([^"]+)"/)?.[1] || "";
  const difficulty = chunk.match(/difficulty:\s*"([^"]+)"/)?.[1] || "";
  const labType = chunk.match(/labType:\s*"([^"]+)"/)?.[1] || "";
  const points = chunk.match(/points:\s*([0-9]+)/)?.[1] || "100";
  const flag = chunk.match(/flag:\s*"([^"]+)"/)?.[1] || "";
  return { idx: idx + 1, slug, name, category, difficulty, labType, points, flag };
});

console.log(JSON.stringify(results, null, 2));
