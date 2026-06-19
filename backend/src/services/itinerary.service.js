const {generateItinerary , extracteTravelData} = require("../services/gemini.service")
const Document = require("../models/Document.model")
const Itinerary = require("../models/Itinerary.model")
const crypto = require("crypto")




//  Create Itinerary
const createItinerary = async (userId , documentId) => {

   const document = await Document.findById(documentId)

   if (!document) {
        throw new Error("Document Is Not Found")
   }

   if(!document.extractedText)
   {
        throw new Error("No Extracted Text Found")
   }

   const exractedTravelData = await extracteTravelData(
        document.extractedText
   )


   let travelData;


   try { 
     travelData = JSON.parse(exractedTravelData);
   } catch (error) {
     throw new Error("Invalid JSON Returned From Gemini");
   }

    // Gemini Generate Itinerary
  const itineraryText = await generateItinerary(
    travelData
  );

  // Create Title
  const title = `${travelData.origin} to ${travelData.destination} Trip`;

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
//  End Of Create Itinerary




// User History
const getUserItineraries = async (userId) => {

  const itineraries = await Itinerary.find({
    userId,
  })
    .populate("documentId")
    .sort({ createdAt: -1 });

  return itineraries;
};






// Single Itinerary
const getItineraryById = async (itineraryId) => {

  const itinerary = await Itinerary.findById(
    itineraryId
  );

  if (!itinerary) {
    throw new Error("Itinerary Not Found");
  }

  return itinerary;
};


const shareItinerary = async (itineraryId) => {

    // Find itinerary
    const itinerary = await Itinerary.findById(
        itineraryId
    );

    if (!itinerary) {
        throw new Error("Itinerary Not Found");
    }

    // Generate unique share id
    const shareId = crypto.randomBytes(8).toString("hex");

    // Update itinerary
    itinerary.shareId = shareId;
    itinerary.isPublic = true;
    itinerary.status = "shared";

    await itinerary.save();

    return {
      shareId,  shareLink:  `/api/v1/itinerary/public/${shareId}`,
    };
};


const getPublicItinerary = async (shareId) => {

    const itinerary = await Itinerary.findOne({
        shareId,
        isPublic: true,
    });

    if (!itinerary) {
        throw new Error(
            "Shared Itinerary Not Found"
        );
    }

    return itinerary;
};


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
  getUserItineraries,
  getItineraryById,
  shareItinerary ,
  getPublicItinerary ,
  deleteItinerary
};