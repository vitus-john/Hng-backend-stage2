const countries = require("../utils/countryMap");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseQuery(q) {
  if (!q || typeof q !== "string") {
    return null;
  }

  q = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const filters = {};

  const hasMale = /\b(male|males|man|men|boy|boys)\b/.test(q);
  const hasFemale = /\b(female|females|woman|women|girl|girls)\b/.test(q);

  if (hasMale && !hasFemale) {
    filters.gender = "male";
  }

  if (hasFemale && !hasMale) {
    filters.gender = "female";
  }

  if (/\byoung\b/.test(q)) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  if (/\b(teen|teens|teenager|teenagers)\b/.test(q)) {
    filters.age_group = "teenager";
  }

  if (/\b(adult|adults)\b/.test(q)) {
    filters.age_group = "adult";
  }

  if (/\b(senior|seniors|elderly)\b/.test(q)) {
    filters.age_group = "senior";
  }

  if (/\b(child|children|kid|kids)\b/.test(q)) {
    filters.age_group = "child";
  }

  const above = q.match(/\b(?:above|over|older than|at least)\s+(\d{1,3})\b/);
  if (above) {
    filters.min_age = parseInt(above[1], 10);
  }

  const below = q.match(/\b(?:below|under|younger than|at most)\s+(\d{1,3})\b/);
  if (below) {
    filters.max_age = parseInt(below[1], 10);
  }

  const between = q.match(/\bbetween\s+(\d{1,3})\s+and\s+(\d{1,3})\b/);
  if (between) {
    const first = parseInt(between[1], 10);
    const second = parseInt(between[2], 10);
    filters.min_age = Math.min(first, second);
    filters.max_age = Math.max(first, second);
  }

  const entries = Object.entries(countries).sort((a, b) => b[0].length - a[0].length);
  for (const [countryName, countryCode] of entries) {
    const pattern = new RegExp(`\\b${escapeRegExp(countryName)}\\b`);
    if (pattern.test(q)) {
      filters.country_id = countryCode;
      break;
    }
  }

  if (!filters.country_id) {
    const codeMatches = q.match(/\b[a-z]{2}\b/g) || [];
    const knownCodes = new Set(Object.values(countries));
    for (const code of codeMatches) {
      const candidate = code.toUpperCase();
      if (knownCodes.has(candidate)) {
        filters.country_id = candidate;
        break;
      }
    }
  }

  return Object.keys(filters).length ? filters : null;
}

module.exports = { parseQuery };