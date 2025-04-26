const User = require("../model/User.Model");
const Profile = require("../model/Profile.Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const { passwordUpdated } = require("../mail/templates/passwordUpdate");
// const mailSender = require("../utils/mailServer");
const redisClient = require("../redis"); // adjust the path as needed

require("dotenv").config();
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
      role,
      status,
    } = req.body;

    //Validate all fields
    if (!email || !firstName || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (password !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Passwords do not match",
      });
    }
    //Check user already exist or not
    const ExistingUser = await User.findOne({ email });
    if (ExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }
    // const recentOTP = await OTP.findOne({ email })
    //   .sort({ createdAt: -1 })
    //   .limit(1);
    // console.log("This is Entered OTP", otp);
    // if (recentOTP.otp.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "OTP Expired",
    //   });
    // } else if (otp !== recentOTP.otp) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "OTP Invalid",
    //   });
    // }

    //Secure Password

    let hashedPassword;
    const salt = bcrypt.genSaltSync(10);
    try {
      hashedPassword = await bcrypt.hashSync(password, salt);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .json({ success: false, message: "Error generating password hash" });
    }

    // Create the user
    let approved = "";
    role === "admin" ? (approved = false) : (approved = true);

    //Create User entry in profileDetails

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
      displayName: null,
      profession: null,
    });

    // Creating UserDB

    const user = await User.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
      status,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/6.x/pixel-art/svg?seed=${firstName}${lastName}`,
    });

    res.status(200).json({
      success: true,
      data: user,
      message: "User Registered Successfull",
    });
  } catch (error) {
    console.log("Error has occured", error);
    res.status(500).json({
      success: false,
      data: error.message,
      message: "User cannot be registered",
    });
  }
};

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     // Validate email and password
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Please fill all fields",
//       });
//     }
//     // Try getting cached user from redis
//     let cachedUser = await redisClient.get(email);
//     let user;
//     if (cachedUser) {
//       user = JSON.parse(cachedUser);
//       console.log("cached user here", cachedUser);
//     } else {
//       // Check if user exists
//       const user = await User.findOne({ email }).exec();
//       if (!user) {
//         return res.status(400).json({
//           success: false,
//           message: "User doesn't exist",
//         });
//       }
//       //Update redis with the email given
//       await redisClient.set(email, JSON.stringify(user), {
//         EX: 3600, //expires in an hour 60min *60sec
//       });
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, user?.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: "Incorrect Password",
//       });
//     }

//     // Generate JWT token
//     const payload = {
//       id: user._id,
//       email: user.email,
//       role: user.role,
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
//       expiresIn: "48h",
//     });

//     // Update lastLogin and save
//     user.lastLogin = new Date(); // Store current date and time
//     user.token = token;

//     await user?.save(); // Important: This ensures lastLogin is saved in the DB
//     //Update redis with the email given
//     await redisClient.set(email, JSON.stringify(user), {
//       EX: 3600, //expires in an hour 60min *60sec
//     });
//     // Hide sensitive info
//     user.password = undefined;
//     user.confirmpassword = undefined;

//     // Set cookie for token and return success response
//     const options = {
//       expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
//       httpOnly: true,
//     };

//     res.cookie("imranCookie", token, options).status(200).json({
//       success: true,
//       token,
//       user,
//       message: "User Logged In Successfully",
//     });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({
//       success: false,
//       message: "Login Failure. Please Try Again.",
//       error: e.message,
//     });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    let user;

    // Try getting cached user from Redis
    let cachedUser = await redisClient.get(email);

    if (cachedUser) {
      // User found in Redis
      user = JSON.parse(cachedUser);
      console.log("User found in Redis cache:", user);

      // Rehydrate the user object to a Mongoose document
      user = User.hydrate(user); // Converts plain object into Mongoose document
    } else {
      // User not found in Redis, fetch from MongoDB
      user = await User.findOne({ email }).exec();
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User doesn't exist",
        });
      }

      // Cache the user in Redis for future requests
      await redisClient.set(email, JSON.stringify(user), {
        EX: 3600, // Cache expires in 1 hour
      });
      console.log("User cached in Redis:", user);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    // Generate JWT token
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "48h",
    });

    // Update lastLogin and save in MongoDB
    user.lastLogin = new Date(); // Store current date and time
    user.token = token; // Store the token

    // Save the updated user to MongoDB
    await user.save();
    console.log("User data saved to MongoDB:", user);

    // Update Redis cache with the new data (lastLogin and token)
    await redisClient.set(email, JSON.stringify(user), {
      EX: 3600, // Cache expires in 1 hour
    });
    console.log("User data updated in Redis cache:", user);

    // Hide sensitive info
    user.password = undefined;
    user.confirmpassword = undefined;

    // Set cookie for token and return success response
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
    };

    res.cookie("imranCookie", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "User Logged In Successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Login Failure. Please Try Again.",
      error: e.message,
    });
  }
};
