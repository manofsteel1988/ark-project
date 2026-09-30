const express = require("express");
const router = express.Router();
const controller = require("../controllers/configurator.controller");
const { optionalAuth } = require("../middleware/auth");

router.get("/pieces", controller.getPieces);
router.post("/price", controller.getPrice);
router.post("/", optionalAuth, controller.createConfiguration);
router.get("/shared/:shareToken", controller.getSharedConfiguration);
router.get("/:id", controller.getConfiguration);

module.exports = router;
