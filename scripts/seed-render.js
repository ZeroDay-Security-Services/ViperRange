// ViperRange — Render DB Direct Seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://viperrange_db_user:GJwzQI37DFHQejsuQH4zJbJJRw3twX5G@dpg-da0tvotbedkc73bjth30-a.oregon-postgres.render.com/viperrange_db?sslmode=require"
    }
  }
});

async function main() {
  console.log("🌱 Connecting to Render PostgreSQL database...");

  // 1. Seed Admin
  const adminHash = await bcrypt.hash("Admin@ZeroDay2024!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@zeroday.in" },
    update: {},
    create: {
      email: "admin@zeroday.in",
      name: "ZeroDay Security Admin",
      role: "ADMIN",
      passwordHash: adminHash,
      totalPoints: 0,
    }
  });
  console.log(`✅ Admin account confirmed: ${admin.email}`);

  // 2. Count labs
  const count = await prisma.lab.count();
  console.log(`📊 Current labs in Render DB: ${count}`);

  if (count === 0) {
    console.log("Seeding labs from seed definitions...");
    const { LABS } = require("./build-seed");
    for (const l of LABS) {
      await prisma.lab.create({
        data: {
          slug: l.slug,
          name: l.name,
          category: l.category,
          difficulty: l.difficulty,
          labType: l.labType,
          tags: l.tags,
          description: l.description,
          points: l.points,
          expectedFlagHash: l.expectedFlagHash,
          dockerImage: l.dockerImage,
          port: l.port,
          estimatedDeployTime: l.estimatedDeployTime,
          maxDuration: l.maxDuration,
          isFeatured: l.isFeatured || false,
          hints: { create: l.hints },
          walkthroughs: { create: l.walkthroughs }
        }
      });
      console.log(`  + Seeded lab: ${l.name}`);
    }
  }

  console.log("\n🎉 Render PostgreSQL database is 100% prepared and ready for production!");
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
