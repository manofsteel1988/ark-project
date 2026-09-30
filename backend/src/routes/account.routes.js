const express = require("express");
const router = express.Router();
const controller = require("../controllers/account.controller");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);
router.get("/orders", controller.orders);
router.post("/orders", controller.createOrder);
router.get("/configurations", controller.savedConfigurations);

module.exports = router;
