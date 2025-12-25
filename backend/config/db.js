import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;

// Tải các biến môi trường từ file .env
dotenv.config();

// Lấy thông tin cấu hình kết nối từ biến môi trường
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// Tạo connection pool với PostgreSQL
// Pool tự động quản lý kết nối, tái sử dụng và giới hạn số lượng kết nối đồng thời
const pool = new Pool({
  connectionTimeoutMillis: 2000, // Timeout khi lấy kết nối từ pool
  database: PGDATABASE,
  host: PGHOST,
  idleTimeoutMillis: 30000, // Đóng kết nối idle sau 30 giây
  // Cấu hình pool để tối ưu hiệu suất
  max: 20, // Số kết nối tối đa trong pool
  password: PGPASSWORD,
  ssl: {
    rejectUnauthorized: false, // Cần thiết cho Neon và các dịch vụ PostgreSQL cloud
  },
  user: PGUSER,
});

// Xử lý lỗi pool
pool.on("error", (err) => {
  console.error("Lỗi không mong đợi trên client pool:", err);
  process.exit(-1);
});

// Export pool để sử dụng trong các controller
export { pool };

// Export default để tương thích với code cũ
export default pool;
