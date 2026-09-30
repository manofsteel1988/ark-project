const express = require("express");
const router = express.Router();
const controller = require("../controllers/products.controller");

router.get("/carousel", controller.carousel);
router.get("/:slug", controller.getBySlug);
router.get("/", controller.list);

module.exports = router;
