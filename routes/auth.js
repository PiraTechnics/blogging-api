const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

/** Authentication & Authorization routes */
router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/authorized", verifyToken, authController.getUserPermissions);

module.exports = router;
