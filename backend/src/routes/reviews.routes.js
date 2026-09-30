const express = require("express");
const router = express.Router();
const controller = require("../controllers/reviews.controller");
const { optionalAuth } = require("../middleware/auth");

router.get("/", controller.list);
router.post("/", optionalAuth, controller.create);

module.exports = router;
