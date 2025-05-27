const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const { authenticate } = require("../middlewares/AuthUser");

// Đặt các đường dẫn cụ thể lên trước
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/all", authController.getAllUsers);
router.get("/search", authController.searchUsersByName);
router.get("/sort", authController.sortUsersByName);

// Đặt route với tham số xuống dưới cùng
router.get("/:id", authController.getUserById);

module.exports = router;
