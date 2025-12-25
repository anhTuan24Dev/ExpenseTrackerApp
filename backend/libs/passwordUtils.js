import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Hash mật khẩu bằng bcrypt
 * @param {string} userValue - Mật khẩu cần hash
 * @returns {Promise<string>} - Mật khẩu đã được hash
 */
export const hashPassword = async (userValue) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userValue, salt);
  return hashedPassword;
};

/**
 * So sánh mật khẩu với mật khẩu đã hash
 * @param {string} userPassword - Mật khẩu cần kiểm tra
 * @param {string} password - Mật khẩu đã được hash
 * @returns {Promise<boolean>} - true nếu khớp, false nếu không khớp hoặc có lỗi
 */
export const comparePassword = async (userPassword, password) => {
  try {
    const isMatch = await bcrypt.compare(userPassword, password);
    return isMatch;
  } catch (error) {
    console.error("Lỗi khi so sánh mật khẩu:", error);
    return false; // Trả về false nếu có lỗi, để tránh crash
  }
};

/**
 * Tạo JWT token cho người dùng
 * @param {string|number} id - ID của người dùng
 * @param {string} [email] - Email của người dùng (tùy chọn)
 * @returns {string} - JWT token đã được tạo
 */
export const createJWT = (id, email = null) => {
  const payload = { userId: id };
  if (email) {
    payload.email = email;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
