const express = require("express");
const router = express.Router();
const controller = require("../controllers/cart.controller");
const { optionalAuth } = require("../middleware/auth");

router.use(optionalAuth);
router.get("/", controller.getCart);
router.post("/items", controller.addItem);
router.patch("/items/:id", controller.updateItem);
router.delete("/items/:id", controller.removeItem);

module.exports = router;
