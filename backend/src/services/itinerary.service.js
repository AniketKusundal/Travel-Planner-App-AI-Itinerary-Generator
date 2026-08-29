const { generateItinerary, extracteTravelData, generateCustomItinerary, generatePackingList } = require("../services/gemini.service");
const Document = require("../models/Document.model");
const Itinerary = require("../models/Itinerary.model");
const crypto = require("crypto");

// Create Itinerary from uploaded Document
const createItinerary = async (userId, documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document Not Found");
  }

  if (!document.extractedText) {
    throw new Error("No Extracted Text Found in Document");
  }

  const extractedResult = await extracteTravelData(document.extractedText);

  let travelData;
  if (typeof extractedResult === "string") {
    try {
      travelData = JSON.parse(extractedResult);
    } catch (e) {
      travelData = { destination: "Trip", origin: "Origin", travelDate: "Upcoming" };
    }
  } else {
    travelData = extractedResult;
  }

  // Gemini Generate Itinerary
  const itineraryText = await generateItinerary(travelData);

  // Generate title
  const originStr = travelData.origin || "Origin";
  const destStr = travelData.destination || "Destination";
  const title = `${originStr} to ${destStr} Trip`;

  // Save Itinerary
  const itinerary = await Itinerary.create({
    userId,
    documentId,
    title,
    itineraryText,
    extractedData: travelData,
    status: "generated",
  });

  return itinerary;
};

// Create Custom Prompt-based Itinerary (No Document Required)
const createCustomItinerary = async (userId, { destination, duration, budget, vibe, interests }) => {
  if (!destination) {
    throw new Error("Destination is required");
  }

  const days = duration || 3;
  const itineraryText = await generateCustomItinerary({
    destination,
    duration: days,
    budget,
    vibe,
    interests,
  });

  const title = `${days}-Day ${vibe || "Explore"} Trip to ${destination}`;

  const travelData = {
    destination,
    duration: days,
    budget: budget || "Moderate",
    vibe: vibe || "Balanced",
    interests: interests || "Sightseeing",
  };

  const itinerary = await Itinerary.create({
    userId,
    title,
    itineraryText,
    extractedData: travelData,
    status: "generated",
  });

  return itinerary;
};

// Generate & Attach Smart Packing List to Itinerary
const getPackingList = async ({ destination, duration, climate, activities }) => {
  return await generatePackingList({
    destination: destination || "Travel Destination",
    duration: duration || 3,
    climate: climate || "Mild / Seasonal",
    activities: activities || "Sightseeing & Leisure",
  });
};

// User History
const getUserItineraries = async (userId) => {
  const itineraries = await Itinerary.find({ userId })
    .populate("documentId")
    .sort({ createdAt: -1 });

  return itineraries;
};

// Single Itinerary
const getItineraryById = async (itineraryId) => {
  const itinerary = await Itinerary.findById(itineraryId);
  if (!itinerary) {
    throw new Error("Itinerary Not Found");
  }
  return itinerary;
};

// Share Itinerary
const shareItinerary = async (itineraryId) => {
  const itinerary = await Itinerary.findById(itineraryId);

  if (!itinerary) {
    throw new Error("Itinerary Not Found");
  }

  const shareId = crypto.randomBytes(8).toString("hex");

  itinerary.shareId = shareId;
  itinerary.isPublic = true;
  itinerary.status = "shared";

  await itinerary.save();

  return {
    shareId,
    shareLink: `/api/v1/itinerary/public/${shareId}`,
  };
};

// Public Itinerary
const getPublicItinerary = async (shareId) => {
  const itinerary = await Itinerary.findOne({
    shareId,
    isPublic: true,
  });

  if (!itinerary) {
    throw new Error("Shared Itinerary Not Found");
  }

  return itinerary;
};

// Delete Itinerary
const deleteItinerary = async (itineraryId) => {
  const itinerary = await Itinerary.findById(itineraryId);

  if (!itinerary) {
    throw new Error("Itinerary Not Found");
  }

  await Itinerary.findByIdAndDelete(itineraryId);

  return true;
};

module.exports = {
  createItinerary,
  createCustomItinerary,
  getPackingList,
  getUserItineraries,
  getItineraryById,
  shareItinerary,
  getPublicItinerary,
  deleteItinerary,
};