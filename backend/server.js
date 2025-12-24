import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import sql from "./config/db.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Hàm khởi tạo database - tạo các bảng cần thiết
async function initializeDatabase() {
  try {
    // Tạo bảng tbluser (Người dùng)
    await sql`
      create table if not exists public.tbluser (
        id bigint generated always as identity primary key,
        email varchar(120) not null unique,
        "firstName" varchar(50) not null,
        "lastName" varchar(50),
        contact varchar(15),
        accounts text[],
        password text,
        country text default 'Việt Nam',
        currency varchar(5) not null default 'VND',
        "createdAt" timestamp not null default current_timestamp,
        "updatedAt" timestamp not null default current_timestamp
      );
    `;
    console.log("Bảng tbluser đã được tạo hoặc đã tồn tại");

    // Tạo comment cho bảng tbluser
    await sql`
      comment on table public.tbluser is 'Bảng lưu thông tin người dùng của hệ thống quản lý chi tiêu';
    `;

    // Tạo bảng tblaccount (Tài khoản)
    await sql`
      create table if not exists public.tblaccount (
        id bigint generated always as identity primary key,
        user_id bigint not null references public.tbluser(id) on delete cascade,
        account_name varchar(50) not null,
        account_number varchar(50) not null,
        account_balance numeric(10, 2) not null,
        "createdAt" timestamp not null default current_timestamp,
        "updatedAt" timestamp not null default current_timestamp
      );
    `;
    console.log("Bảng tblaccount đã được tạo hoặc đã tồn tại");

    // Tạo comment cho bảng tblaccount
    await sql`
      comment on table public.tblaccount is 'Bảng lưu thông tin các tài khoản của người dùng (ví dụ: Tiền mặt, Thẻ Visa)';
    `;

    // Tạo bảng tbltransaction (Giao dịch)
    await sql`
      create table if not exists public.tbltransaction (
        id bigint generated always as identity primary key,
        user_id bigint not null references public.tbluser(id) on delete cascade,
        description text not null,
        status varchar(10) not null default 'Pending',
        source varchar(100) not null,
        amount numeric(10, 2) not null,
        type varchar(10) not null default 'income',
        "createdAt" timestamp not null default current_timestamp,
        "updatedAt" timestamp not null default current_timestamp
      );
    `;
    console.log("Bảng tbltransaction đã được tạo hoặc đã tồn tại");

    // Tạo comment cho bảng tbltransaction
    await sql`
      comment on table public.tbltransaction is 'Bảng lưu thông tin các giao dịch thu chi của người dùng';
    `;

    // Tạo index để tối ưu truy vấn
    await sql`
      create index if not exists idx_tblaccount_user_id on public.tblaccount(user_id);
    `;
    await sql`
      create index if not exists idx_tbltransaction_user_id on public.tbltransaction(user_id);
    `;
    await sql`
      create index if not exists idx_tbltransaction_type on public.tbltransaction(type);
    `;

    console.log("Database đã được khởi tạo thành công");
  } catch (error) {
    console.error("Lỗi khi khởi tạo database:", error);
    throw error;
  }
}

app.get("/", (_req, res) => {
  res.send("Xin chào");
});

const PORT = process.env.PORT || 3000;

// Khởi tạo database trước khi server bắt đầu lắng nghe
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Không thể khởi động server:", error);
    process.exit(1);
  });
