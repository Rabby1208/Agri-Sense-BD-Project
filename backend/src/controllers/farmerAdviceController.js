
const db = require("../config/db");

// ==========================================
// GET ADVICE RECEIVED BY FARMER
// ==========================================

exports.getMyAdvice = async (req, res) => {
  try {
    const farmerId = Number(req.user.id);

    const [rows] = await db.query(
      `SELECT
        ea.id,
        ea.expert_id,
        ea.farmer_id,
        ea.farmer_crop_id,
        ea.title,
        ea.advice_text,
        ea.status,
        ea.created_at,
        ea.updated_at,
        expert.full_name AS expert_name,
        expert.phone AS expert_phone,
        ep.expertise,
        ep.qualification,
        ep.experience_years
       FROM expert_advice ea
       INNER JOIN users expert
         ON expert.id = ea.expert_id
       LEFT JOIN expert_profiles ep
         ON ep.user_id = expert.id
       WHERE ea.farmer_id = ?
       ORDER BY ea.created_at DESC`,
      [farmerId]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("FARMER ADVICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your expert advice.",
      error: error.message,
    });
  }
};
