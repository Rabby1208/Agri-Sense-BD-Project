const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const farmerController = require("../controllers/farmerController");
const farmerAdviceController = require("../controllers/farmerAdviceController");
const farmerExpertRequestController = require("../controllers/farmerExpertRequestController");

// All routes below are Farmer-only.
router.use(verifyToken, authorizeRole("FARMER"));

// Farmer Profile
router.get("/profile", farmerController.getProfile);
router.put("/profile", farmerController.updateProfile);

// Farmer Dashboard
router.get("/dashboard", farmerController.getDashboard);

// Farmer Crops
router.get("/crops", farmerController.getCrops);
router.post("/crops", farmerController.addCrop);
router.get("/my-crops", farmerController.getMyCrops);
router.put("/crops/:id", farmerController.updateCrop);
router.delete("/crops/:id", farmerController.deleteCrop);

// Existing Expert Advice
router.get("/advice", farmerAdviceController.getMyAdvice);

// Farmer-to-Expert Communication
router.post(
  "/requests",
  farmerExpertRequestController.createRequest
);

router.get(
  "/requests",
  farmerExpertRequestController.getMyRequests
);

router.get(
  "/requests/:id",
  farmerExpertRequestController.getMyRequestDetails
);

module.exports = router;