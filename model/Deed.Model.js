const mongoose = require("mongoose");

const PrayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      enum: ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha", "Tahajjud", "Taraweeh"],
      required: true,
    },
    farz: { type: Number, default: 0 }, // Number of Farz rakats
    nafl: { type: Number, default: 0 }, // Number of Nafl rakats
    sunnat: { type: Number, default: 0 }, // Number of Sunnat rakats
    witr: { type: Number, default: 0 }, // Optional for Isha
    date: {
      type: String, // Store as a string (YYYY-MM-DD) for easy searching
      required: true,
    },
    notes: { type: String, trim: true }, // Additional notes
  },
  { timestamps: true }
);

PrayerSchema.pre("save", function (next) {
  this.date = new Date(this.date).toISOString().split("T")[0];
  next();
});

module.exports = mongoose.model("PrayerSchema", PrayerSchema);
