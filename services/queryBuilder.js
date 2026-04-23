function buildQuery(filters) {
  const where = {};

  if (filters.gender !== undefined) {
    where.gender = filters.gender;
  }

  if (filters.age_group !== undefined) {
    where.age_group = filters.age_group;
  }

  if (filters.country_id !== undefined) {
    where.country_id = filters.country_id;
  }

  if (filters.min_age !== undefined || filters.max_age !== undefined) {
    where.age = {};
    if (filters.min_age !== undefined) where.age.gte = Number(filters.min_age);
    if (filters.max_age !== undefined) where.age.lte = Number(filters.max_age);
  }

  if (filters.min_gender_probability !== undefined) {
    where.gender_probability = {
      gte: Number(filters.min_gender_probability),
    };
  }

  if (filters.min_country_probability !== undefined) {
    where.country_probability = {
      gte: Number(filters.min_country_probability),
    };
  }

  return where;
}

module.exports = { buildQuery };