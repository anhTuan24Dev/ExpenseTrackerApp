import { pool } from "../config/db.js";

// Thêm giao dịch (thu/chi)
export const addTransaction = async (req, res) => {
  const client = await pool.connect();

  try {
    // Kiểm tra req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        message: "Request body không hợp lệ",
        success: false,
      });
    }

    const { accountId, amount, description, type } = req.body;
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
        message: "Số tiền phải là số dương",
        success: false,
      });
    }

    if (!type || !["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({
        message: "Loại giao dịch phải là 'income' hoặc 'expense'",
        success: false,
      });
    }

    const transactionAmount = parseFloat(amount);
    const transactionType = type.toLowerCase();

    // Bắt đầu SQL Transaction
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
    const currentBalance = parseFloat(account.account_balance);

    // Kiểm tra số dư nếu là giao dịch chi tiêu (expense)
    if (transactionType === "expense") {
      if (currentBalance < 0 || currentBalance < transactionAmount) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Insufficient balance",
          success: false,
        });
      }
    }

    // Tính số dư mới
    const newBalance =
      transactionType === "income"
        ? currentBalance + transactionAmount
        : currentBalance - transactionAmount;

    // Cập nhật số dư tài khoản
    const updateResult = await client.query({
      text: `update public.tblaccount
             set account_balance = $1, "updatedAt" = current_timestamp
             where id = $2
             returning id, user_id, account_name, account_number, account_balance, "createdAt", "updatedAt"`,
      values: [newBalance, accountId],
    });

    // Thêm bản ghi giao dịch vào bảng transaction
    const transactionResult = await client.query({
      text: `insert into public.tbltransaction (user_id, description, status, source, amount, type)
             values ($1, $2, $3, $4, $5, $6)
             returning id, user_id, description, status, source, amount, type, "createdAt", "updatedAt"`,
      values: [
        userId,
        description ||
          `${transactionType === "income" ? "Thu nhập" : "Chi tiêu"} từ tài khoản ${account.account_name}`,
        "Completed",
        accountId.toString(),
        transactionAmount,
        transactionType,
      ],
    });

    // Commit transaction nếu tất cả thành công
    await client.query("COMMIT");

    // Trả về thông báo thành công
    res.status(201).json({
      data: {
        account: updateResult.rows[0],
        transaction: transactionResult.rows[0],
      },
      message: `Thêm giao dịch ${transactionType === "income" ? "thu nhập" : "chi tiêu"} thành công`,
      success: true,
    });
  } catch (error) {
    // Rollback nếu có lỗi
    await client.query("ROLLBACK");
    console.error("Lỗi khi thêm giao dịch:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi thêm giao dịch",
      success: false,
    });
  } finally {
    // Giải phóng client về pool
    client.release();
  }
};

// Chuyển tiền giữa các tài khoản
export const transferMoney = async (req, res) => {
  const client = await pool.connect();

  try {
    // Kiểm tra req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        message: "Request body không hợp lệ",
        success: false,
      });
    }

    const { fromAccountId, toAccountId, amount, description } = req.body;
    const userId = req.user?.userId;

    // Kiểm tra userId có tồn tại không
    if (!userId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Kiểm tra các trường bắt buộc
    if (!fromAccountId || !toAccountId) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ID tài khoản nguồn và tài khoản đích",
        success: false,
      });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({
        message: "Tài khoản nguồn và tài khoản đích không thể giống nhau",
        success: false,
      });
    }

    if (
      !amount ||
      Number.isNaN(parseFloat(amount)) ||
      parseFloat(amount) <= 0
    ) {
      return res.status(400).json({
        message: "Số tiền chuyển phải là số dương",
        success: false,
      });
    }

    const transferAmount = parseFloat(amount);

    // Bắt đầu SQL Transaction
    await client.query("BEGIN");

    // Kiểm tra tài khoản nguồn có tồn tại và thuộc về user không
    const fromAccountResult = await client.query({
      text: `select id, account_name, account_balance
             from public.tblaccount
             where id = $1 and user_id = $2`,
      values: [fromAccountId, userId],
    });

    if (fromAccountResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message:
          "Không tìm thấy tài khoản nguồn hoặc tài khoản không thuộc về bạn",
        success: false,
      });
    }

    // Kiểm tra tài khoản đích có tồn tại và thuộc về user không
    const toAccountResult = await client.query({
      text: `select id, account_name, account_balance
             from public.tblaccount
             where id = $1 and user_id = $2`,
      values: [toAccountId, userId],
    });

    if (toAccountResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message:
          "Không tìm thấy tài khoản đích hoặc tài khoản không thuộc về bạn",
        success: false,
      });
    }

    const fromAccount = fromAccountResult.rows[0];
    const toAccount = toAccountResult.rows[0];
    const fromAccountBalance = parseFloat(fromAccount.account_balance);

    // Kiểm tra số dư tài khoản nguồn
    if (fromAccountBalance < 0 || fromAccountBalance < transferAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Insufficient balance",
        success: false,
      });
    }

    // Tính số dư mới cho cả hai tài khoản
    const newFromBalance = fromAccountBalance - transferAmount;
    const toAccountBalance = parseFloat(toAccount.account_balance);
    const newToBalance = toAccountBalance + transferAmount;

    // Trừ tiền từ tài khoản nguồn
    const fromAccountUpdateResult = await client.query({
      text: `update public.tblaccount
             set account_balance = $1, "updatedAt" = current_timestamp
             where id = $2
             returning id, user_id, account_name, account_number, account_balance, "createdAt", "updatedAt"`,
      values: [newFromBalance, fromAccountId],
    });

    // Cộng tiền vào tài khoản đích
    const toAccountUpdateResult = await client.query({
      text: `update public.tblaccount
             set account_balance = $1, "updatedAt" = current_timestamp
             where id = $2
             returning id, user_id, account_name, account_number, account_balance, "createdAt", "updatedAt"`,
      values: [newToBalance, toAccountId],
    });

    // Ghi nhận giao dịch "Expense" cho tài khoản nguồn
    const expenseTransactionResult = await client.query({
      text: `insert into public.tbltransaction (user_id, description, status, source, amount, type)
             values ($1, $2, $3, $4, $5, $6)
             returning id, user_id, description, status, source, amount, type, "createdAt", "updatedAt"`,
      values: [
        userId,
        description || `Chuyển tiền đến tài khoản ${toAccount.account_name}`,
        "Completed",
        fromAccountId.toString(),
        transferAmount,
        "expense",
      ],
    });

    // Ghi nhận giao dịch "Income" cho tài khoản đích
    const incomeTransactionResult = await client.query({
      text: `insert into public.tbltransaction (user_id, description, status, source, amount, type)
             values ($1, $2, $3, $4, $5, $6)
             returning id, user_id, description, status, source, amount, type, "createdAt", "updatedAt"`,
      values: [
        userId,
        description || `Nhận tiền từ tài khoản ${fromAccount.account_name}`,
        "Completed",
        toAccountId.toString(),
        transferAmount,
        "income",
      ],
    });

    // Commit transaction nếu tất cả thành công
    await client.query("COMMIT");

    // Trả về thông báo thành công
    res.status(200).json({
      data: {
        expenseTransaction: expenseTransactionResult.rows[0],
        fromAccount: fromAccountUpdateResult.rows[0],
        incomeTransaction: incomeTransactionResult.rows[0],
        toAccount: toAccountUpdateResult.rows[0],
      },
      message: "Chuyển tiền thành công",
      success: true,
    });
  } catch (error) {
    // Rollback nếu có lỗi
    await client.query("ROLLBACK");
    console.error("Lỗi khi chuyển tiền:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi chuyển tiền",
      success: false,
    });
  } finally {
    // Giải phóng client về pool
    client.release();
  }
};

// Lấy dữ liệu Dashboard
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Kiểm tra userId có tồn tại không
    if (!userId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng",
        success: false,
      });
    }

    // Tính tổng thu nhập và chi tiêu bằng SUM và GROUP BY type
    const summaryResult = await pool.query({
      text: `select 
               type,
               coalesce(sum(amount), 0) as total
             from public.tbltransaction
             where user_id = $1 and status = 'Completed'
             group by type`,
      values: [userId],
    });

    // Khởi tạo tổng thu và tổng chi
    let totalIncome = 0;
    let totalExpense = 0;

    // Xử lý kết quả từ query
    summaryResult.rows.forEach((row) => {
      if (row.type === "income") {
        totalIncome = parseFloat(row.total);
      } else if (row.type === "expense") {
        totalExpense = parseFloat(row.total);
      }
    });

    // Tính số dư khả dụng (Available Balance = Tổng thu - Tổng chi)
    const availableBalance = totalIncome - totalExpense;

    // Lấy dữ liệu biểu đồ: Gom nhóm giao dịch theo tháng sử dụng EXTRACT(MONTH FROM created_at)
    const chartDataResult = await pool.query({
      text: `select 
               extract(month from "createdAt") as month,
               extract(year from "createdAt") as year,
               type,
               coalesce(sum(amount), 0) as total
             from public.tbltransaction
             where user_id = $1 and status = 'Completed'
             group by extract(month from "createdAt"), extract(year from "createdAt"), type
             order by year, month, type`,
      values: [userId],
    });

    // Xử lý dữ liệu biểu đồ theo định dạng dễ sử dụng
    const chartData = {};
    chartDataResult.rows.forEach((row) => {
      const monthKey = `${row.year}-${String(row.month).padStart(2, "0")}`;
      if (!chartData[monthKey]) {
        chartData[monthKey] = {
          expense: 0,
          income: 0,
          month: parseInt(row.month, 10),
          year: parseInt(row.year, 10),
        };
      }
      if (row.type === "income") {
        chartData[monthKey].income = parseFloat(row.total);
      } else if (row.type === "expense") {
        chartData[monthKey].expense = parseFloat(row.total);
      }
    });

    // Chuyển đổi object thành array và sắp xếp theo thời gian
    const chartDataArray = Object.values(chartData).sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month - b.month;
    });

    // Trả về dữ liệu dashboard
    res.status(200).json({
      data: {
        chartData: chartDataArray,
        summary: {
          availableBalance,
          totalExpense,
          totalIncome,
        },
      },
      message: "Lấy dữ liệu dashboard thành công",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu dashboard:", error);
    res.status(500).json({
      error: error.message,
      message: "Lỗi server khi lấy dữ liệu dashboard",
      success: false,
    });
  }
};
