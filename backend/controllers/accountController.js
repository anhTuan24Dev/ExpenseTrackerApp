import { pool } from "../config/db.js";

// Tạo tài khoản mới
export const createAccount = async (req, res) => {
  const client = await pool.connect();

  try {
    // Kiểm tra req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        message: "Request body không hợp lệ",
        success: false,
      });
    }

    const { accountName, initialBalance } = req.body;
    const userId = req.user?.userId;

    // Kiểm tra userId có tồn tại không
    if (!userId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Kiểm tra các trường bắt buộc
    if (!accountName || accountName.trim() === "") {
      return res.status(400).json({
        message: "Vui lòng nhập tên tài khoản",
        success: false,
      });
    }

    // Kiểm tra số dư ban đầu hợp lệ (mặc định là 0 nếu không cung cấp)
    const balance =
      initialBalance !== undefined ? parseFloat(initialBalance) : 0;

    if (Number.isNaN(balance) || balance < 0) {
      return res.status(400).json({
        message: "Số dư ban đầu phải là số không âm",
        success: false,
      });
    }

    // Bắt đầu transaction
    await client.query("BEGIN");

    // Kiểm tra xem user đã có tài khoản với tên này chưa
    const existingAccountResult = await client.query({
      text: `select id 
             from public.tblaccount 
             where user_id = $1 and account_name = $2`,
      values: [userId, accountName.trim()],
    });

    if (existingAccountResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Bạn đã có tài khoản với tên này rồi",
        success: false,
      });
    }

    // Tạo số tài khoản tự động (dựa trên timestamp và userId)
    const accountNumber = `ACC${userId}${Date.now()}`;

    // Insert tài khoản mới vào bảng tblaccount
    const accountResult = await client.query({
      text: `insert into public.tblaccount (user_id, account_name, account_number, account_balance)
             values ($1, $2, $3, $4)
             returning id, user_id, account_name, account_number, account_balance, "createdAt", "updatedAt"`,
      values: [userId, accountName.trim(), accountNumber, balance],
    });

    const newAccount = accountResult.rows[0];

    // Nếu có số dư ban đầu, tạo transaction "Initial Deposit"
    if (balance > 0) {
      await client.query({
        text: `insert into public.tbltransaction (user_id, description, status, source, amount, type)
               values ($1, $2, $3, $4, $5, $6)`,
        values: [
          userId,
          `Nạp đầu vào cho tài khoản ${accountName.trim()}`,
          "Completed",
          newAccount.id.toString(),
          balance,
          "income",
        ],
      });
    }

    // Commit transaction
    await client.query("COMMIT");

    // Trả về thông báo thành công
    res.status(201).json({
      data: {
        account: newAccount,
      },
      message: "Tạo tài khoản thành công",
      success: true,
    });
  } catch (error) {
    // Rollback nếu có lỗi
    await client.query("ROLLBACK");
    console.error("Lỗi khi tạo tài khoản:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi tạo tài khoản",
      success: false,
    });
  } finally {
    // Giải phóng client về pool
    client.release();
  }
};

// Lấy danh sách tài khoản của user
export const getAccounts = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Kiểm tra userId có tồn tại không
    if (!userId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Query lấy tất cả tài khoản thuộc về userId
    const accountsResult = await pool.query({
      text: `select 
               id, 
               user_id, 
               account_name, 
               account_number, 
               account_balance, 
               "createdAt", 
               "updatedAt"
             from public.tblaccount
             where user_id = $1
             order by "createdAt" desc`,
      values: [userId],
    });

    // Trả về danh sách tài khoản
    res.status(200).json({
      data: {
        accounts: accountsResult.rows,
        total: accountsResult.rows.length,
      },
      message: "Lấy danh sách tài khoản thành công",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi lấy danh sách tài khoản",
      success: false,
    });
  }
};

// Nạp tiền vào tài khoản
export const addMoney = async (req, res) => {
  const client = await pool.connect();

  try {
    // Kiểm tra req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        message: "Request body không hợp lệ",
        success: false,
      });
    }

    const { accountId, amount, description } = req.body;
    const userId = req.user?.userId;

    // Kiểm tra userId có tồn tại không
    if (!userId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Kiểm tra các trường bắt buộc
    if (!accountId) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ID tài khoản",
        success: false,
      });
    }

    if (
      !amount ||
      Number.isNaN(parseFloat(amount)) ||
      parseFloat(amount) <= 0
    ) {
      return res.status(400).json({
        message: "Số tiền nạp phải là số dương",
        success: false,
      });
    }

    const depositAmount = parseFloat(amount);

    // Bắt đầu transaction
    await client.query("BEGIN");

    // Kiểm tra tài khoản có tồn tại và thuộc về user không
    const accountResult = await client.query({
      text: `select id, account_name, account_balance
             from public.tblaccount
             where id = $1 and user_id = $2`,
      values: [accountId, userId],
    });

    if (accountResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Không tìm thấy tài khoản hoặc tài khoản không thuộc về bạn",
        success: false,
      });
    }

    const account = accountResult.rows[0];
    const newBalance = parseFloat(account.account_balance) + depositAmount;

    // Update số dư tài khoản
    const updateResult = await client.query({
      text: `update public.tblaccount
             set account_balance = $1, "updatedAt" = current_timestamp
             where id = $2
             returning id, user_id, account_name, account_number, account_balance, "createdAt", "updatedAt"`,
      values: [newBalance, accountId],
    });

    // Ghi lại lịch sử giao dịch
    await client.query({
      text: `insert into public.tbltransaction (user_id, description, status, source, amount, type)
             values ($1, $2, $3, $4, $5, $6)`,
      values: [
        userId,
        description || `Nạp tiền vào tài khoản ${account.account_name}`,
        "Completed",
        accountId.toString(),
        depositAmount,
        "income",
      ],
    });

    // Commit transaction
    await client.query("COMMIT");

    // Trả về thông báo thành công
    res.status(200).json({
      data: {
        account: updateResult.rows[0],
      },
      message: "Nạp tiền thành công",
      success: true,
    });
  } catch (error) {
    // Rollback nếu có lỗi
    await client.query("ROLLBACK");
    console.error("Lỗi khi nạp tiền:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi nạp tiền",
      success: false,
    });
  } finally {
    // Giải phóng client về pool
    client.release();
  }
};
