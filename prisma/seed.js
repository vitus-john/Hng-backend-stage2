const fs = require("fs");
const path = require("path");

const prisma = require("../config/db_conn");
const { generateUuidV7 } = require("./uuid");

const CANDIDATE_SEED_FILES = [
  process.env.SEED_FILE,
  path.join(__dirname, "..", "data", "seed_profiles.json"),
].filter(Boolean);

function resolveDataFilePath() {
  for (const filePath of CANDIDATE_SEED_FILES) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

function loadData() {
  const dataFilePath = resolveDataFilePath();

  if (!dataFilePath) {
    throw new Error(
      "Seed file not found. Place the provided 2026 JSON dataset at data/profiles-2026.json or set SEED_FILE.",
    );
  }

  const raw = fs.readFileSync(dataFilePath, "utf8");
  const parsed = JSON.parse(raw);

  const records = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.profiles) ? parsed.profiles : null;

  if (!records) {
    throw new Error("Seed file must contain a JSON array or a { profiles: [] } object");
  }

  return records;
}

async function main() {
  const data = loadData();

  const rows = await Promise.all(
    data.map(async (item) => ({
      id: await generateUuidV7(),
      name: String(item.name).trim(),
      gender: String(item.gender).toLowerCase(),
      gender_probability: Number(item.gender_probability),
      age: Number(item.age),
      age_group: String(item.age_group).toLowerCase(),
      country_id: String(item.country_id).toUpperCase(),
      country_name: String(item.country_name),
      country_probability: Number(item.country_probability),
      created_at: item.created_at ? new Date(item.created_at) : new Date(),
    })),
  );

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