import express from "express";
import {
  changePassword,
  getUser,
  updateUser,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả các routes đều yêu cầu xác thực (authenticateToken middleware)
router.use(authenticateToken);

// Route lấy thông tin người dùng
router.get("/get-user", getUser);

// Route đổi mật khẩu
router.post("/change-password", changePassword);

// Route cập nhật thông tin người dùng
router.put("/update-user", updateUser);

export default router;
