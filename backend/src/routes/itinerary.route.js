const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  createItinerary,
  createCustomItinerary,
  generatePackingList,
  getItineraryById,
  getUserItineraries,
  shareItinerary,
  getPublicItinerary,
  exportItineraryPdf,
  deleteItinerary,
} = require("../controllers/itinerary.controller");

const router = express.Router();

router.post("/generate/:documentId", authMiddleware, createItinerary);
router.post("/create-custom", authMiddleware, createCustomItinerary);
router.post("/packing-list", authMiddleware, generatePackingList);

router.get("/history", authMiddleware, getUserItineraries);
router.post("/share/:itineraryId", authMiddleware, shareItinerary);
router.get("/public/:shareId", getPublicItinerary);
router.get("/export/:id", authMiddleware, exportItineraryPdf);

// ALWAYS KEEP THIS LAST
router.get("/:id", authMiddleware, getItineraryById);
router.delete("/:id", authMiddleware, deleteItinerary);

module.exports = router;