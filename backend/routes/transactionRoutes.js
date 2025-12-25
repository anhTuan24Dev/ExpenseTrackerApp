import express from "express";
import {
  addTransaction,
  getDashboard,
  transferMoney,
} from "../controllers/transactionController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả các routes đều yêu cầu xác thực (authenticateToken middleware)
router.use(authenticateToken);

// Route thêm giao dịch (thu/chi)
router.post("/add-transaction", addTransaction);

// Route chuyển tiền giữa các tài khoản
router.post("/transfer-money", transferMoney);

// Route lấy dữ liệu dashboard
router.get("/get-dashboard", getDashboard);

export default router;
