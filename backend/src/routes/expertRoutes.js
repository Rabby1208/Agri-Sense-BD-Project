
const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const expertController = require("../controllers/expertController");
const expertAdviceController = require("../controllers/expertAdviceController");
const expertProfileController = require("../controllers/expertProfileController");
const farmerExpertRequestController = require("../controllers/farmerExpertRequestController");

// Public Expert Directory
router.get("/", expertController.getPublicExperts);

// Expert Profile
router.get(
  "/profile",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertProfileController.getMyProfile
);

router.put(
  "/profile",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertProfileController.updateMyProfile
);

// Farmer Information
router.get(
  "/farmers",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertController.getFarmers
);

router.get(
  "/farmers/:id",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertController.getFarmerDetails
);

router.get(
  "/disease-history",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertController.getDiseaseDetectionHistory
);

// Expert Advice
router.get(
  "/advice",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertAdviceController.getMyAdvice
);

router.post(
  "/advice",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertAdviceController.createAdvice
);

router.put(
  "/advice/:id",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertAdviceController.updateAdvice
);

router.delete(
  "/advice/:id",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertAdviceController.deleteAdvice
);

// Farmer-to-Expert Communication
router.get(
  "/requests",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  farmerExpertRequestController.getIncomingRequests
);

router.put(
  "/requests/:id",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  farmerExpertRequestController.updateRequest
);

module.exports = router;
