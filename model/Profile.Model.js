const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  displayName: {
    type: String,
  },
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
  },
  profession: {
    type: String,
  },
});

module.exports = mongoose.model("profile", profileSchema);
