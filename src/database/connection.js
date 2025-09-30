import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'precourse',
  waitForConnections: true,
  connectionLimit: 20, //
  queueLimit: 50, // 대기열 50개
  acquireTimeout: 20000, // 연결 획득 타임아웃 20초
  timeout: 8000, // 쿼리 타임아웃 8초
  reconnect: true, // 자동 재연결
  idleTimeout: 60000, // 1분 후 유휴 연결 해제
  maxIdle: 10, // 최대 10개 유휴 연결 유지
};

const pool = mysql.createPool(dbConfig);

export default pool;
