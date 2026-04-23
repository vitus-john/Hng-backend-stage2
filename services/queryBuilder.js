// src/services/queryBuilder.service.js

function buildQuery(filters) {
  const where = {};

  if (filters.gender) {
    where.gender = filters.gender;
  }

  if (filters.age_group) {
    where.age_group = filters.age_group;
  }

  if (filters.country_id) {
    where.country_id = filters.country_id;
  }

  if (filters.min_age || filters.max_age) {
    where.age = {};
    if (filters.min_age) where.age.gte = filters.min_age;
    if (filters.max_age) where.age.lte = filters.max_age;
  }

  if (filters.min_gender_probability) {
    where.gender_probability = {
      gte: filters.min_gender_probability
    };
  }

  if (filters.min_country_probability) {
    where.country_probability = {
      gte: filters.min_country_probability
    };
  }

  return where;
}

module.exports = { buildQuery };