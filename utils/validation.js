// src/utils/validation.js

function isNumber(value) {
  return value !== undefined && !isNaN(value);
}

function validateQuery(query) {
  const {
    min_age,
    max_age,
    min_gender_probability,
    min_country_probability,
    page,
    limit
  } = query;

  if (min_age && !isNumber(min_age)) return "min_age";
  if (max_age && !isNumber(max_age)) return "max_age";
  if (page && !isNumber(page)) return "page";
  if (limit && !isNumber(limit)) return "limit";

  if (min_gender_probability && !isNumber(min_gender_probability)) return "min_gender_probability";
  if (min_country_probability && !isNumber(min_country_probability)) return "min_country_probability";

  return null;
}

module.exports = { validateQuery };