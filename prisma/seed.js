const prisma = require("../config/db");
const { generateUuidV7 } = require("./uuid");
const data = require("./data.json"); // your 2026 profiles

async function main() {
  for (const item of data) {
    await prisma.profile.upsert({
      where: { name: item.name },
      update: {},
      create: {
        id: generateUuidV7(),
        name: item.name,
        gender: item.gender,
        gender_probability: item.gender_probability,
        age: item.age,
        age_group: item.age_group,
        country_id: item.country_id,
        country_name: item.country_name,
        country_probability: item.country_probability,
        created_at: new Date()
      }
    });
  }

  console.log("✅ Seeding complete");
}

main().catch(console.error);