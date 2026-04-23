const prisma = require("../config/db_conn");
const { buildQuery } = require("../services/queryBuilder");
const { parseQuery } = require("../services/nlpParser");
const { validateListQuery, validateSearchQuery } = require("../utils/validation");

exports.getProfiles = async (req, res) => {
  try {
    const validation = validateListQuery(req.query);
    if (!validation.ok) {
      return res.status(validation.status).json({
        status: "error",
        message: validation.message,
      });
    }

    const { sort_by, order, page, limit, filters } = validation.value;
    const where = buildQuery(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: { [sort_by]: order },
        skip,
        take: limit,
      }),
      prisma.profile.count({ where }),
    ]);

    return res.json({
      status: "success",
      page,
      limit,
      total,
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server failure",
    });
  }
};

exports.searchProfiles = async (req, res) => {
  try {
    const validation = validateSearchQuery(req.query);
    if (!validation.ok) {
      return res.status(validation.status).json({
        status: "error",
        message: validation.message,
      });
    }

    const { q, page, limit } = validation.value;
    const parsed = parseQuery(q);

    if (!parsed) {
      return res.status(400).json({
        status: "error",
        message: "Unable to interpret query",
      });
    }

    const where = buildQuery(parsed);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.profile.count({ where }),
    ]);

    return res.json({
      status: "success",
      page,
      limit,
      total,
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server failure",
    });
  }
};