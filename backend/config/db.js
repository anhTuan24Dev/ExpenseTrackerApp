import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Tải các biến môi trường từ file .env
dotenv.config();

// Lấy thông tin cấu hình kết nối từ biến môi trường
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// Tạo instance kết nối với PostgreSQL thông qua neondatabase
export const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`,
);

export default sql;
