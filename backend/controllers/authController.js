import { pool } from "../config/db.js";
import {
  comparePassword,
  createJWT,
  hashPassword,
} from "../libs/passwordUtils.js";

// Chức năng Đăng ký (Sign-up)
export const signUp = async (req, res) => {
  try {
    // Kiểm tra req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        message: "Request body không hợp lệ",
        success: false,
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password || !firstName) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin (email, password, firstName)",
        success: false,
      });
    }

    // Kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Định dạng email không hợp lệ",
        success: false,
      });
    }

    // Kiểm tra độ dài mật khẩu (tối thiểu 6 ký tự)
    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
        success: false,
      });
    }

    // Kiểm tra email đã tồn tại trong bảng tbluser chưa
    const userExistResult = await pool.query({
      text: "SELECT EXISTS (SELECT 1 FROM public.tbluser WHERE email = $1) as exists",
      values: [email],
    });

    if (userExistResult.rows[0]?.exists) {
      return res.status(409).json({
        message: "Email đã tồn tại trong hệ thống",
        success: false,
      });
    }

    // Hash mật khẩu bằng bcrypt
    const hashedPassword = await hashPassword(password);

    // Insert người dùng mới vào database
    const newUserResult = await pool.query({
      text: `insert into public.tbluser (email, password, "firstName", "lastName")
             values ($1, $2, $3, $4)
             returning id, email, "firstName", "lastName", "createdAt"`,
      values: [email, hashedPassword, firstName, lastName || null],
    });

    // Trả về thông báo thành công (loại bỏ mật khẩu khỏi phản hồi)
    res.status(201).json({
      data: {
        user: newUserResult.rows[0],
      },
      message: "Đăng ký thành công",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi đăng ký",
      success: false,
    });
  }
};

// Chức năng Đăng nhập (Sign-in)
export const signIn = async (req, res) => {
  try {
    // Kiểm tra req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        message: "Request body không hợp lệ",
        success: false,
      });
    }

    const { email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ email và mật khẩu",
        success: false,
      });
    }

    // Tìm người dùng theo email
    const userResult = await pool.query({
      text: `select id, email, password, "firstName", "lastName"
             from public.tbluser
             where email = $1`,
      values: [email],
    });

    // Nếu không tìm thấy người dùng
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
        success: false,
      });
    }

    const user = userResult.rows[0];

    // Kiểm tra xem user có password không (trường hợp user không có password)
    if (!user.password) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
        success: false,
      });
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
    const isPasswordValid = await comparePassword(password, user.password);

    // Nếu mật khẩu không khớp
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
        success: false,
      });
    }

    // Tạo JWT Token với thời hạn 1 ngày
    const token = createJWT(user.id, user.email);

    // Trả về token và thông tin người dùng (không bao gồm mật khẩu)
    res.status(200).json({
      data: {
        token,
        user: {
          email: user.email,
          firstName: user.firstName,
          id: user.id,
          lastName: user.lastName,
        },
      },
      message: "Đăng nhập thành công",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi đăng nhập",
      success: false,
    });
  }
};
