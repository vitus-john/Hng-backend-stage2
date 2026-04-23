const fs = require("fs");
const path = require("path");

const prisma = require("../config/db_conn");
const { generateUuidV7 } = require("./uuid");

const DATA_FILE_PATH = process.env.SEED_FILE || path.join(__dirname, "..", "data", "profiles-2026.json");

function loadData() {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    throw new Error(
      `Seed file not found at ${DATA_FILE_PATH}. Place the provided 2026 JSON dataset there or set SEED_FILE.`,
    );
  }

  const raw = fs.readFileSync(DATA_FILE_PATH, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Seed file must contain a JSON array of profile records");
  }

  return parsed;
}

async function main() {
  const data = loadData();

  const rows = data.map((item) => ({
    id: generateUuidV7(),
    name: String(item.name).trim(),
    gender: String(item.gender).toLowerCase(),
    gender_probability: Number(item.gender_probability),
    age: Number(item.age),
    age_group: String(item.age_group).toLowerCase(),
    country_id: String(item.country_id).toUpperCase(),
    country_name: String(item.country_name),
    country_probability: Number(item.country_probability),
    created_at: item.created_at ? new Date(item.created_at) : new Date(),
  }));

  const result = await prisma.profile.createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.log(`Seeding complete. Inserted ${result.count} new profiles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });