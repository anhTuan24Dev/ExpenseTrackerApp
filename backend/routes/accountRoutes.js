import express from "express";
import {
  addMoney,
  createAccount,
  getAccounts,
} from "../controllers/accountController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả các routes đều yêu cầu xác thực (authenticateToken middleware)
router.use(authenticateToken);

// Route tạo tài khoản mới
router.post("/create-account", createAccount);

// Route lấy danh sách tài khoản
router.get("/get-accounts", getAccounts);

// Route nạp tiền vào tài khoản
router.post("/add-money", addMoney);

export default router;
