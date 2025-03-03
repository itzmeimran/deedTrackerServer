const Prayer = require("../model/Deed.Model");
const User = require("../model/User.Model"); // Assuming you have a User model

// Store a prayer record for a user
exports.storePrayer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, farz, nafl, sunnat, witr, date, notes } = req.body;

    // Convert date to YYYY-MM-DD format for consistency
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Validate user existence
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if the prayer already exists for the same user, same date, and same prayer name
    let existingPrayer = await Prayer.findOne({ userId, name, date: formattedDate });

    if (existingPrayer) {
      // Update the existing prayer entry
      existingPrayer.farz = farz ?? existingPrayer.farz;
      existingPrayer.nafl = nafl ?? existingPrayer.nafl;
      existingPrayer.sunnat = sunnat ?? existingPrayer.sunnat;
      existingPrayer.witr = witr ?? existingPrayer.witr;
      existingPrayer.notes = notes ?? existingPrayer.notes;
      
      await existingPrayer.save();

      return res.status(200).json({
        success: true,
        message: "Prayer record updated successfully",
        data: existingPrayer,
      });
    }

    // If not found, create a new prayer record
    const newPrayer = new Prayer({
      userId,
      name,
      farz: farz || 0,
      nafl: nafl || 0,
      sunnat: sunnat || 0,
      witr: witr || 0,
      date: formattedDate,
      notes,
    });

    await newPrayer.save();

    return res.status(201).json({
      success: true,
      message: "Prayer record saved successfully",
      data: newPrayer,
    });

  } catch (error) {
    console.error("Error storing prayer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getPrayersByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    // Validate required fields
    if (!userId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "User ID and date are required" });
    }

    // Ensure date is formatted correctly (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split("T")[0];
    console.log("Received userId:", userId);
    console.log("Received date:", date);
    console.log("Formatted date:", formattedDate);
    // Fetch prayers for the user on the given date
    const prayers = await Prayer.find({ userId, date });

    res.status(200).json({
      success: true,
      message: "Prayers retrieved successfully",
      prayers,
    });
  } catch (error) {
    console.error("Error fetching prayers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
