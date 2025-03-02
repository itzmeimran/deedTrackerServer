

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const { cloudinaryConnect } = require("./database/cloudinaryConnect");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const port = process.env.PORT || 3000;

//Importing Routes
const Course = require("./routes/Course");
const Payment = require("./routes/Payment");
const Profile = require("./routes/Profile");
const User = require("./routes/User");
const Dashboard = require("./routes/Dashboard");

//DataBase connect
const dbConnect = require("./database/Database");
dbConnect();

//middleWares
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

//Cloudinary Connection
cloudinaryConnect();

//Appending or mounting api's
const mountApis = [
  { path: "/api/v1/course", element: Course },
  { path: "/api/v1/payment", element: Payment },
  { path: "/api/v1/profile", element: Profile },
  { path: "/api/v1/auth", element: User },
  { path: "/api/v1/adminDashboard", element: Dashboard },
];
mountApis.forEach((api) => {
  app.use(api.path, api.element);
})

//Starting Server
app.listen(port, () => console.log(`App Started at port  ${port}`));

app.get("/", (req, res) => {
  res.send("This is HomePage");
});