
const db = require("../config/db");

// ==========================================
// GET ALL EXPERTS
// ==========================================

exports.getAllExperts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        u.id,
        u.full_name,
        u.phone,
        u.is_active,
        u.created_at,
        ep.expertise,
        ep.qualification,
        ep.experience_years,
        ep.bio,
        ep.contact_information
       FROM users u
       LEFT JOIN expert_profiles ep ON ep.user_id = u.id
       WHERE u.role = 'AGRI_EXPERT'
       ORDER BY u.id DESC`
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("ADMIN GET EXPERTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load experts.",
      error: error.message,
    });
  }
};

// ==========================================
// ACTIVATE / DEACTIVATE EXPERT
// ==========================================

exports.updateExpertStatus = async (req, res) => {
  try {
    const expertId = Number(req.params.id);
    const { is_active } = req.body;

    if (
      !Number.isInteger(expertId) ||
      expertId <= 0 ||
      ![0, 1, true, false].includes(is_active)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid expert ID and is_active value are required.",
      });
    }

    const activeValue = is_active === true || is_active === 1 ? 1 : 0;

    const [result] = await db.query(
      `UPDATE users
       SET is_active = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       AND role = 'AGRI_EXPERT'`,
      [activeValue, expertId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Expert not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: activeValue
        ? "Expert activated successfully."
        : "Expert deactivated successfully.",
      is_active: activeValue,
    });
  } catch (error) {
    console.error("ADMIN UPDATE EXPERT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expert status.",
      error: error.message,
    });
  }
};

// ==========================================
// REMOVE EXPERT (SOFT DELETE)
// ==========================================

exports.deleteExpert = async (req, res) => {
  try {
    const expertId = Number(req.params.id);

    if (!Number.isInteger(expertId) || expertId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid expert ID.",
      });
    }

    const [result] = await db.query(
      `UPDATE users
       SET is_active = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       AND role = 'AGRI_EXPERT'`,
      [expertId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Expert not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expert removed successfully. Account deactivated.",
    });
  } catch (error) {
    console.error("ADMIN DELETE EXPERT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove expert.",
      error: error.message,
    });
  }
};
