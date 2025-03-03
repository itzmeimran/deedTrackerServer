const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth.middleware");

//Importing Controllers
const { createUser, login } = require("../controllers/Auth.controller");

//Route for SignIn
router.post("/register", createUser);

//Route for Login
router.post("/login", login);

module.exports = router;
