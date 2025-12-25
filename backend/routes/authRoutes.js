import express from "express";
import { signIn, signUp } from "../controllers/authController.js";

const router = express.Router();

// Route đăng ký
router.post("/sign-up", signUp);

// Route đăng nhập
router.post("/sign-in", signIn);

export default router;
