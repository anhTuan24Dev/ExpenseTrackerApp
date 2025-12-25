import { pool } from "../config/db.js";
import { comparePassword, hashPassword } from "../libs/passwordUtils.js";

// Lấy thông tin chi tiết người dùng
export const getUser = async (req, res) => {
  try {
    // Lấy userId từ middleware (đã được gắn vào req.user)
    const userId = req.user?.userId;

    // Kiểm tra userId có tồn tại không
    if (!userId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Query lấy thông tin chi tiết người dùng từ database
    const userResult = await pool.query({
      text: `select 
               id, 
               email, 
               "firstName", 
               "lastName", 
               contact, 
               country, 
               currency, 
               "createdAt", 
               "updatedAt"
             from public.tbluser
             where id = $1`,
      values: [userId],
    });

    // Kiểm tra xem có tìm thấy người dùng không
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    res.status(200).json({
      data: {
        user: userResult.rows[0],
      },
      message: "Lấy thông tin người dùng thành công",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi lấy thông tin người dùng",
      success: false,
    });
  }
};

// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    // Kiểm tra req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        message: "Request body không hợp lệ",
        success: false,
      });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    // Kiểm tra userId có tồn tại không
    if (!userId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Kiểm tra các trường bắt buộc
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ mật khẩu cũ và mật khẩu mới",
        success: false,
      });
    }

    // Kiểm tra độ dài mật khẩu mới (tối thiểu 6 ký tự)
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        success: false,
      });
    }

    // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới không được trùng với mật khẩu cũ",
        success: false,
      });
    }

    // Lấy thông tin người dùng bao gồm mật khẩu hiện tại
    const userResult = await pool.query({
      text: `select id, password
             from public.tbluser
             where id = $1`,
      values: [userId],
    });

    // Kiểm tra xem có tìm thấy người dùng không
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    const user = userResult.rows[0];

    // Kiểm tra xem user có password không
    if (!user.password) {
      return res.status(400).json({
        message: "Người dùng chưa có mật khẩu",
        success: false,
      });
    }

    // So sánh mật khẩu cũ với mật khẩu đã hash trong database
    const isOldPasswordValid = await comparePassword(
      oldPassword,
      user.password,
    );

    // Nếu mật khẩu cũ không khớp
    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: "Mật khẩu cũ không đúng",
        success: false,
      });
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await hashPassword(newPassword);

    // Cập nhật mật khẩu mới vào database
    await pool.query({
      text: `update public.tbluser
             set password = $1, "updatedAt" = current_timestamp
             where id = $2`,
      values: [hashedNewPassword, userId],
    });

    // Trả về thông báo thành công
    res.status(200).json({
      message: "Đổi mật khẩu thành công",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi đổi mật khẩu",
      success: false,
    });
  }
};

// Cập nhật thông tin hồ sơ người dùng
export const updateUser = async (req, res) => {
  try {
    // Kiểm tra req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        message: "Request body không hợp lệ",
        success: false,
      });
    }

    const userId = req.user?.userId;

    // Kiểm tra userId có tồn tại không
    if (!userId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    const { firstName, lastName, country, currency, contact } = req.body;

    // Kiểm tra xem có ít nhất một trường để cập nhật không
    if (
      firstName === undefined &&
      lastName === undefined &&
      country === undefined &&
      currency === undefined &&
      contact === undefined
    ) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
        success: false,
      });
    }

    // Kiểm tra nếu có email trong request body thì từ chối (không cho phép đổi email)
    if (req.body.email !== undefined) {
      return res.status(400).json({
        message: "Không thể thay đổi email",
        success: false,
      });
    }

    // Xây dựng query động dựa trên các trường được cung cấp
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updateFields.push(`"firstName" = $${paramIndex}`);
      updateValues.push(firstName);
      paramIndex++;
    }

    if (lastName !== undefined) {
      updateFields.push(`"lastName" = $${paramIndex}`);
      updateValues.push(lastName);
      paramIndex++;
    }

    if (country !== undefined) {
      updateFields.push(`country = $${paramIndex}`);
      updateValues.push(country);
      paramIndex++;
    }

    if (currency !== undefined) {
      updateFields.push(`currency = $${paramIndex}`);
      updateValues.push(currency);
      paramIndex++;
    }

    if (contact !== undefined) {
      updateFields.push(`contact = $${paramIndex}`);
      updateValues.push(contact);
      paramIndex++;
    }

    // Thêm updatedAt vào query
    updateFields.push(`"updatedAt" = current_timestamp`);

    // Thêm userId vào cuối mảng values
    updateValues.push(userId);

    // Thực hiện cập nhật
    const updateQuery = `
      update public.tbluser
      set ${updateFields.join(", ")}
      where id = $${paramIndex}
      returning id, email, "firstName", "lastName", contact, country, currency, "createdAt", "updatedAt"
    `;

    const updateResult = await pool.query({
      text: updateQuery,
      values: updateValues,
    });

    // Kiểm tra xem có cập nhật được không
    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Trả về thông tin người dùng đã được cập nhật
    res.status(200).json({
      data: {
        user: updateResult.rows[0],
      },
      message: "Cập nhật thông tin người dùng thành công",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi cập nhật thông tin người dùng",
      success: false,
    });
  }
};
