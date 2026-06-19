const Document = require("../models/Document.model");
const Itinerary = require("../models/Itinerary.model");

const getDashboardStats = async (userId) => {

    const documents = await Document.countDocuments({
        userId,
    });

    const itineraries = await Itinerary.countDocuments({
        userId,
    });

    const sharedItineraries = await Itinerary.countDocuments({
        userId,
        isPublic: true,
    });

    return {
        documents,
        itineraries,
        sharedItineraries,
    };
};

module.exports = {
    getDashboardStats,
};