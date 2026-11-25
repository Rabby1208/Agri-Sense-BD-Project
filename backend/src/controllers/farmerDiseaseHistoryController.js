
const db = require("../config/db");

exports.getMyDiseaseHistory = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const requestedOffset = Number.parseInt(req.query.offset, 10);

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 20;

    const offset =
      Number.isInteger(requestedOffset) && requestedOffset >= 0
        ? requestedOffset
        : 0;

    const [rows] = await db.query(
      `SELECT
          id,
          crop_name,
          disease_name,
          confidence,
          detection_status,
          disease_detected,
          prediction_result,
          created_at
       FROM disease_detection_history
       WHERE farmer_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [farmerId, limit, offset]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM disease_detection_history
       WHERE farmer_id = ?`,
      [farmerId]
    );

    return res.status(200).json({
      success: true,
      total: countRows[0].total,
      limit,
      offset,
      data: rows,
    });
  } catch (error) {
    console.error("Farmer Disease History Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your disease detection history.",
    });
  }
};
