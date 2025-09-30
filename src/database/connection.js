import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'precourse',
  waitForConnections: true,
  connectionLimit: 80, 
  queueLimit: 400, 
  connectTimeout: 5000, // 연결 타임아웃 5초
};

const pool = mysql.createPool(dbConfig);

export default pool;
