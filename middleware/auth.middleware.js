const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/User.Model");

//auth
exports.auth = async (req, res, next) => {
  try {
    //extract token
    const token =
      req.cookies.imranCookie ||
      req.body.token ||
      (req.header("Authorization")?.replace("Bearer ", "") ?? "");
    console.log("This is token in middleware -> ", req.cookies.imranCookie);
    //if token missing, then return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    //verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log(decode);
      req.user = decode;
    } catch (err) {
      //verification - issue
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
      data: error.message,
    });
  }
};

//isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Students only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

exports.checkUserStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Assuming JWT middleware adds user info to req
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID provided" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Access denied: User is blocked" });
    }

    if (user.status === "inactive") {
      return res
        .status(403)
        .json({ message: "Access denied: User is inactive" });
    }

    // If active, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error checking user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
