
const db = require("../config/db");

// ==========================================
// GET EXPERT'S OWN ADVICE
// ==========================================

exports.getMyAdvice = async (req, res) => {
  try {
    const expertId = Number(req.user.id);

    const [rows] = await db.query(
      `SELECT
        ea.*,
        u.full_name AS farmer_name,
        u.phone AS farmer_phone
       FROM expert_advice ea
       LEFT JOIN users u ON u.id = ea.farmer_id
       WHERE ea.expert_id = ?
       ORDER BY ea.created_at DESC`,
      [expertId]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("GET MY ADVICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load expert advice.",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE EXPERT ADVICE
// ==========================================

exports.createAdvice = async (req, res) => {
  try {
    const expertId = Number(req.user.id);

    const {
      farmer_id,
      farmer_crop_id,
      title,
      advice_text,
    } = req.body;

    const farmerId = Number(farmer_id);
    const cropId =
      farmer_crop_id === null ||
      farmer_crop_id === undefined ||
      farmer_crop_id === ""
        ? null
        : Number(farmer_crop_id);

    if (!Number.isInteger(farmerId) || farmerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid farmer.",
      });
    }

    if (
      !title ||
      !String(title).trim() ||
      !advice_text ||
      !String(advice_text).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and advice text are required.",
      });
    }

    // Check expert account
    const [experts] = await db.query(
      `SELECT id
       FROM users
       WHERE id = ?
       AND role = 'AGRI_EXPERT'
       AND is_active = 1`,
      [expertId]
    );

    if (!experts.length) {
      return res.status(403).json({
        success: false,
        message: "Active expert account not found.",
      });
    }

    // Check farmer account
    const [farmers] = await db.query(
      `SELECT id
       FROM users
       WHERE id = ?
       AND role = 'FARMER'
       AND is_active = 1`,
      [farmerId]
    );

    if (!farmers.length) {
      return res.status(404).json({
        success: false,
        message: "Active farmer not found.",
      });
    }

    // Verify optional crop ownership
    if (cropId !== null) {
      if (!Number.isInteger(cropId) || cropId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid crop ID.",
        });
      }

      const [crops] = await db.query(
        `SELECT id
         FROM farmer_crops
         WHERE id = ?
         AND farmer_id = ?`,
        [cropId, farmerId]
      );

      if (!crops.length) {
        return res.status(400).json({
          success: false,
          message: "This crop does not belong to the selected farmer.",
        });
      }
    }

    // Save advice
    const [result] = await db.query(
      `INSERT INTO expert_advice
       (
         expert_id,
         farmer_id,
         farmer_crop_id,
         title,
         advice_text,
         status
       )
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [
        expertId,
        farmerId,
        cropId,
        String(title).trim(),
        String(advice_text).trim(),
      ]
    );

    const [saved] = await db.query(
      `SELECT *
       FROM expert_advice
       WHERE id = ?`,
      [result.insertId]
    );

    if (!saved.length) {
      throw new Error("Advice insert verification failed.");
    }

    return res.status(201).json({
      success: true,
      message: "Expert advice published successfully.",
      data: saved[0],
    });
  } catch (error) {
    console.error("CREATE ADVICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to publish advice.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE EXPERT ADVICE
// ==========================================

exports.updateAdvice = async (req, res) => {
  try {
    const expertId = Number(req.user.id);
    const adviceId = Number(req.params.id);

    const { title, advice_text } = req.body;

    if (
      !title ||
      !String(title).trim() ||
      !advice_text ||
      !String(advice_text).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and advice text are required.",
      });
    }

    const [result] = await db.query(
      `UPDATE expert_advice
       SET title = ?,
           advice_text = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       AND expert_id = ?`,
      [
        String(title).trim(),
        String(advice_text).trim(),
        adviceId,
        expertId,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Advice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Advice updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE ADVICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update advice.",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE EXPERT ADVICE
// ==========================================

exports.deleteAdvice = async (req, res) => {
  try {
    const expertId = Number(req.user.id);
    const adviceId = Number(req.params.id);

    const [result] = await db.query(
      `DELETE FROM expert_advice
       WHERE id = ?
       AND expert_id = ?`,
      [adviceId, expertId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Advice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Advice deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ADVICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete advice.",
      error: error.message,
    });
  }
};
