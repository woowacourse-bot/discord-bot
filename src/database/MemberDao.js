import pool from './connection.js';

const MemberDao = {
  async findByDiscordId(discordId) {
    const [rows] = await pool.query(
      'SELECT id, name, email, discord_id AS discordId, verified FROM members WHERE discord_id = ? LIMIT 1',
      [discordId],
    );
    return rows[0] || null;
  },

  async findByNameEmail(name, email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, discord_id AS discordId, verified FROM members WHERE name = ? AND email = ? LIMIT 1',
      [name, email],
    );
    return rows[0] || null;
  },

  async verifyAndBindDiscordId(memberId, discordId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [exists] = await conn.query('SELECT id FROM members WHERE id = ? FOR UPDATE', [memberId]);
      if (exists.length === 0) {
        await conn.rollback();
        return false;
      }
      await conn.query('UPDATE members SET discord_id = ?, verified = 1 WHERE id = ?', [discordId, memberId]);
      await conn.commit();
      return true;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },
};

export default MemberDao;
