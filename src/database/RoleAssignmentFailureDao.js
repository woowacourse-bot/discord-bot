import pool from './connection.js';

const RoleAssignmentFailureDao = {
  /**
   * 역할 부여 실패 기록 저장
   * @param {object} failure - 실패 정보
   * @param {number} failure.memberId - members 테이블의 ID
   * @param {string} failure.discordId - Discord ID
   * @param {string} failure.roleId - 부여하려던 역할 ID
   * @param {string} [failure.errorMessage] - 오류 메시지
   * @returns {Promise<number>} 삽입된 ID
   */
  async create(failure) {
    const [result] = await pool.query(
      `INSERT INTO role_assignment_failures 
       (member_id, discord_id, role_id, reason) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         retry_count = retry_count + 1,
         last_retry_at = CURRENT_TIMESTAMP`,
      [failure.memberId, failure.discordId, failure.roleId, failure.errorMessage || 'Unknown error'],
    );
    return result.insertId;
  },

  /**
   * 공지되지 않은 실패 기록 조회
   * @param {number} [limit] - 조회 개수
   * @returns {Promise<Array>} 실패 기록 배열
   */
  async findUnnotified(limit = 50) {
    const [rows] = await pool.query(
      `SELECT raf.id, raf.member_id AS memberId, raf.discord_id AS discordId, 
              raf.role_id AS roleId, raf.reason, raf.retry_count AS retryCount,
              m.name, m.email, raf.created_at AS createdAt
       FROM role_assignment_failures raf
       LEFT JOIN members m ON raf.member_id = m.id
       WHERE raf.retry_count < 3
       ORDER BY raf.created_at ASC 
       LIMIT ?`,
      [limit],
    );
    return rows;
  },

  /**
   * 역할 부여 성공 시 기록 삭제
   * @param {number[]} ids - 실패 기록 ID 배열
   * @returns {Promise<boolean>}
   */
  async deleteByIds(ids) {
    if (!ids || ids.length === 0) return false;
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM role_assignment_failures WHERE id IN (${placeholders})`, ids);
    return true;
  },
};

export default RoleAssignmentFailureDao;

