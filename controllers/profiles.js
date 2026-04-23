const prisma = require("../config/db");
const { buildQuery } = require("../services/queryBuilder.service");
const { parseQuery } = require("../services/nlpParser.service");
const { ALLOWED_SORT, ALLOWED_ORDER } = require("../utils/constants");

const { validateQuery } = require("../utils/validation");

exports.getProfiles = async (req, res) => {
  try {
    const errorField = validateQuery(req.query);
    if (errorField) {
      return res.status(422).json({
        status: "error",
        message: "Invalid parameter type"
      });
    }

    const {
      sort_by = "created_at",
      order = "desc",
      page = 1,
      limit = 10,
      ...filters
    } = req.query;

    if (!ALLOWED_SORT.includes(sort_by) || !ALLOWED_ORDER.includes(order)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid query parameters"
      });
    }

    const take = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * take;

    const where = buildQuery(filters);

    const [data, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: { [sort_by]: order },
        skip,
        take
      }),
      prisma.profile.count({ where })
    ]);

    return res.json({
      status: "success",
      page: Number(page),
      limit: take,
      total,
      data
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
};

exports.searchProfiles = async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  const parsed = parseQuery(q);

  if (!parsed) {
    return res.status(400).json({
      status: "error",
      message: "Unable to interpret query"
    });
  }

  const take = Math.min(parseInt(limit), 50);
  const skip = (page - 1) * take;

  const where = buildQuery(parsed);

  const [data, total] = await Promise.all([
    prisma.profile.findMany({ where, skip, take }),
    prisma.profile.count({ where })
  ]);

  res.json({
    status: "success",
    page: Number(page),
    limit: take,
    total,
    data
  });
};