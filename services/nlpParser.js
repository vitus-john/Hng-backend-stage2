const countries = require("../utils/countryMap");

function parseQuery(q) {
  if (!q || typeof q !== "string") return null;

  q = q.toLowerCase();

  const filters = {};

  // Gender
  if (q.includes("male") && !q.includes("female")) {
    filters.gender = "male";
  }

  if (q.includes("female") && !q.includes("male")) {
    filters.gender = "female";
  }

  // Age keywords
  if (q.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  if (q.includes("teen")) {
    filters.age_group = "teenager";
  }

  if (q.includes("adult")) {
    filters.age_group = "adult";
  }

  if (q.includes("senior")) {
    filters.age_group = "senior";
  }

  // Regex numbers
  const above = q.match(/above (\d+)/);
  if (above) filters.min_age = parseInt(above[1]);

  const below = q.match(/below (\d+)/);
  if (below) filters.max_age = parseInt(below[1]);

  // Country
  for (let key in countries) {
    if (q.includes(key)) {
      filters.country_id = countries[key];
    }
  }

  return Object.keys(filters).length ? filters : null;
}

module.exports = { parseQuery };