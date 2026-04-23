const { ALLOWED_SORT, ALLOWED_ORDER, AGE_GROUPS, GENDERS } = require("./constant");

const LIST_ALLOWED_KEYS = new Set([
  "gender",
  "age_group",
  "country_id",
  "min_age",
  "max_age",
  "min_gender_probability",
  "min_country_probability",
  "sort_by",
  "order",
  "page",
  "limit",
]);

const SEARCH_ALLOWED_KEYS = new Set(["q", "page", "limit"]);

function hasUnknownKeys(query, allowedKeys) {
  return Object.keys(query).some((key) => !allowedKeys.has(key));
}

function isValueArray(value) {
  return Array.isArray(value);
}

function isNumericValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "string") {
    if (value.trim() === "") {
      return false;
    }
    return Number.isFinite(Number(value));
  }

  return false;
}

function toNumber(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  return Number(value);
}

function toTrimmedString(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  return String(value).trim();
}

function validateListQuery(query) {
  if (hasUnknownKeys(query, LIST_ALLOWED_KEYS)) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  const numericKeys = [
    "min_age",
    "max_age",
    "min_gender_probability",
    "min_country_probability",
    "page",
    "limit",
  ];

  for (const key of Object.keys(query)) {
    if (isValueArray(query[key])) {
      return { ok: false, status: 422, message: "Invalid parameter type" };
    }
  }

  for (const key of numericKeys) {
    if (query[key] !== undefined && !isNumericValue(query[key])) {
      return { ok: false, status: 422, message: "Invalid parameter type" };
    }
  }

  const gender = query.gender ? String(query.gender).toLowerCase() : undefined;
  const ageGroup = query.age_group ? String(query.age_group).toLowerCase() : undefined;
  const countryId = query.country_id ? String(query.country_id).toUpperCase() : undefined;
  const sortBy = toTrimmedString(query.sort_by, "created_at");
  const order = toTrimmedString(query.order, "desc").toLowerCase();

  const minAge = query.min_age !== undefined ? Number(query.min_age) : undefined;
  const maxAge = query.max_age !== undefined ? Number(query.max_age) : undefined;
  const minGenderProbability =
    query.min_gender_probability !== undefined ? Number(query.min_gender_probability) : undefined;
  const minCountryProbability =
    query.min_country_probability !== undefined ? Number(query.min_country_probability) : undefined;

  const page = toNumber(query.page, 1);
  const limit = Math.min(toNumber(query.limit, 10), 50);

  if (gender && !GENDERS.includes(gender)) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (ageGroup && !AGE_GROUPS.includes(ageGroup)) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (countryId && !/^[A-Z]{2}$/.test(countryId)) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (!ALLOWED_SORT.includes(sortBy) || !ALLOWED_ORDER.includes(order)) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (!Number.isInteger(page) || page < 1) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (!Number.isInteger(limit) || limit < 1) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (minAge !== undefined && (!Number.isInteger(minAge) || minAge < 0)) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (maxAge !== undefined && (!Number.isInteger(maxAge) || maxAge < 0)) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (
    minGenderProbability !== undefined &&
    (minGenderProbability < 0 || minGenderProbability > 1)
  ) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (
    minCountryProbability !== undefined &&
    (minCountryProbability < 0 || minCountryProbability > 1)
  ) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  return {
    ok: true,
    value: {
      page,
      limit,
      sort_by: sortBy,
      order,
      filters: {
        gender,
        age_group: ageGroup,
        country_id: countryId,
        min_age: minAge,
        max_age: maxAge,
        min_gender_probability: minGenderProbability,
        min_country_probability: minCountryProbability,
      },
    },
  };
}

function validateSearchQuery(query) {
  if (hasUnknownKeys(query, SEARCH_ALLOWED_KEYS)) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  if (isValueArray(query.q) || isValueArray(query.page) || isValueArray(query.limit)) {
    return { ok: false, status: 422, message: "Invalid parameter type" };
  }

  if (query.q === undefined || String(query.q).trim() === "") {
    return { ok: false, status: 400, message: "Missing or empty parameter" };
  }

  if ((query.page !== undefined && !isNumericValue(query.page)) || (query.limit !== undefined && !isNumericValue(query.limit))) {
    return { ok: false, status: 422, message: "Invalid parameter type" };
  }

  const page = toNumber(query.page, 1);
  const limit = Math.min(toNumber(query.limit, 10), 50);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }

  return {
    ok: true,
    value: {
      q: String(query.q).trim(),
      page,
      limit,
    },
  };
}

module.exports = {
  validateListQuery,
  validateSearchQuery,
};