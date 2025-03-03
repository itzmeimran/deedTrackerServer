const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth.middleware");

//Importing Controllers
const {
  storePrayer,
  getPrayersByDate,
} = require("../controllers/Deeds.controller");

router.post("/storePrayer", auth, storePrayer);
router.get("/getPrayerByDate", auth, getPrayersByDate);
module.exports = router;
