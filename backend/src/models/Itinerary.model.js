const mongoose = require("mongoose")

const ItinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },

  itineraryText: {
    type: String,
    required: true,
  },

  extractedData: {
    type: Object,
    default: {},
  },

  shareId: {
    type: String,
    unique: true,
    sparse: true,
  },

  isPublic: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    enum: ["generated", "shared"],
    default: "generated",
  },


} , {timestamps : true});

const Itinerary = mongoose.model("Itinerary" , ItinerarySchema)

module.exports = Itinerary;