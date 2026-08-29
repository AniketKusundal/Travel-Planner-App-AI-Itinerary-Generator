const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  avatar: {
    type: String,
    default: "",
  },
  homeAirport: {
    type: String,
    default: "",
  },
  travelStyle: {
    type: String,
    default: "Moderate Explorer",
  },
  favoriteDestinations: {
    type: String,
    default: "",
  },
  emergencyContact: {
    type: String,
    default: "",
  },
  emergencyPhone: {
    type: String,
    default: "",
  },
  passportExpiry: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "Passionate traveler exploring the world with AI-powered itineraries.",
  },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

module.exports = User;