const express = require("express");

const limiter = require("../middlewares/rateLimiter");
const controller = require("../controllers/profiles");

const router = express.Router();


router.get("/profiles", limiter, controller.getProfiles);
router.get("/profiles/search", limiter, controller.searchProfiles);

module.exports = router;
