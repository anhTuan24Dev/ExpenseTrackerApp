import jwt from "jsonwebtoken";

// Middleware xác thực JWT Token
export const authenticateToken = (req, res, next) => {
  try {
    // Lấy token từ Authorization header
    const authHeader = req.headers.authorization;

    // Kiểm tra xem có Authorization header không
    if (!authHeader) {
      return res.status(401).json({
        message: "Không tìm thấy token xác thực. Vui lòng đăng nhập.",
        success: false,
      });
    }

    // Tách lấy token từ "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Kiểm tra xem có token không
    if (!token) {
      return res.status(401).json({
        message: "Token không hợp lệ. Vui lòng đăng nhập.",
        success: false,
      });
    }

    // Xác thực token bằng jwt.verify
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    // Kiểm tra xem decoded token có đầy đủ thông tin không
    if (!decoded.userId || !decoded.email) {
      return res.status(401).json({
        message: "Token không hợp lệ. Thiếu thông tin xác thực.",
        success: false,
      });
    }

    // Gắn userId vào req.user để các bước xử lý sau có thể sử dụng
    req.user = {
      email: decoded.email,
      userId: decoded.userId,
    };

    // Chuyển sang middleware/route handler tiếp theo
    next();
  } catch (error) {
    // Xử lý các lỗi xác thực token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
        success: false,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Token không hợp lệ. Vui lòng đăng nhập lại.",
        success: false,
      });
    }

    // Lỗi khác
    console.error("Lỗi khi xác thực token:", error);
    return res.status(500).json({
      error: error.message,
      message: "Lỗi server khi xác thực token",
      success: false,
    });
  }
};
