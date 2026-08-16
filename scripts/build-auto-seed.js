const fs = require("fs");
const path = require("path");

const tsPath = path.join(__dirname, "..", "prisma", "seed.ts");
const outPath = path.join(__dirname, "..", "lib", "db", "seed-data.ts");

let code = fs.readFileSync(tsPath, "utf8");

// Replace top lines
const mainIndex = code.indexOf("async function main()");
let labsArray = code.substring(0, mainIndex);

labsArray = labsArray.replace('import { PrismaClient } from "@prisma/client";', 'import { prisma } from "@/lib/db";');
labsArray = labsArray.replace('import bcrypt from "bcryptjs";', '');
labsArray = labsArray.replace('const prisma = new PrismaClient();', '');

const exportCode = labsArray + `
export async function ensureLabsSeeded() {
  try {
    const count = await prisma.lab.count();
    if (count > 0) return;

    console.log("🌱 Auto-seeding 39 ViperRange labs into database...");

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
    }
    console.log("✅ Auto-seeded 39 labs successfully.");
  } catch (err) {
    console.error("⚠️ Auto-seed warning:", err);
  }
}
`;

fs.writeFileSync(outPath, exportCode, "utf8");
console.log("Successfully created lib/db/seed-data.ts");
