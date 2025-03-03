const mongoose = require("mongoose");
require("dotenv").config();
function Dbconnect() {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to Database Successfully"))
    .catch((e) => {
      console.log("Error Occured At Connection", e);
      process.exit(1);
    });
}

module.exports = Dbconnect;