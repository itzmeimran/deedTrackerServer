const mongoose = require("mongoose");
require("dotenv").config();

function Dbconnect() {
  mongoose
    .connect(process.env.MONGO_URI) // ✅ Removed deprecated options
    .then(() => console.log("Connected to Database Successfully"))
    .catch((e) => {
      console.error("Error Occurred At Connection", e);
      process.exit(1);
    });
}

module.exports = Dbconnect;
