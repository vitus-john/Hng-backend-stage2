const { errorResponse } = require("../utils/response");

function validateProfileName(req, res, next) {
  const { name } = req.body || {};

  if (name === undefined || name === null) {
    return res.status(400).json(errorResponse("Missing or empty name"));
  }

  if (typeof name !== "string" || Array.isArray(name)) {
    return res.status(422).json(errorResponse("Invalid type"));
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return res.status(400).json(errorResponse("Missing or empty name"));
  }

  req.body.name = trimmedName;
  return next();
}

module.exports = validateProfileName;
