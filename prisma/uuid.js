let uuidv7;

async function getUuidV7() {
  if (!uuidv7) {
    ({ v7: uuidv7 } = await import("uuid"));
  }
  return uuidv7;
}

async function generateUuidV7() {
  const fn = await getUuidV7();
  return fn();
}

module.exports = { generateUuidV7 };