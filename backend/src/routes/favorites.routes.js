const express = require("express");
const router = express.Router();
const controller = require("../controllers/favorites.controller");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth); // les favoris nécessitent un compte (persistance cross-device)
router.get("/", controller.list);
router.post("/:productId", controller.add);
router.delete("/:productId", controller.remove);

module.exports = router;
