const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3001;
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
//Importing Routes
const userRoutes = require("./routes/User.routes");
const deedRoutes = require("./routes/Deeds.routes");
//DataBase connect
const dbConnect = require("./db");

dbConnect();

//middleWares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Allow requests from a specific frontend
    credentials: true, // Allow cookies
  })
);

//Data sanitization for NoSql query injection
app.use(mongoSanitize());

//Data sanitization against Cross site scripting
app.use(xssClean())

//Appending or mounting api's
const mountApis = [
  { path: "/api/v1/auth", element: userRoutes },
  { path: "/api/v1/deeds", element: deedRoutes },
];
mountApis.forEach((api) => {
  app.use(api.path, api.element);
});

//Starting Server
app.listen(port, () => console.log(`App Started at port  ${port}`));

app.get("/", (req, res) => {
  res.send("This is HomePage");
});
