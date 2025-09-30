import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'precourse',
  waitForConnections: true,
  connectionLimit: 60, 
  queueLimit: 400, 
  connectTimeout: 10000, // 연결 타임아웃 10초
};

const pool = mysql.createPool(dbConfig);

export default pool;
