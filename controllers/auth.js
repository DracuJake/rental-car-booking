const User = require("../models/User");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5003/auth/google/callback";

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, tel } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      tel,
    });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, err });
    console.log(err.stack);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an email and password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    if (user.registerType === "gmail") {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Please use Gmail login for your account.",
        });
    }
    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res
      .status(401)
      .json({
        success: false,
        msg: "Cannot convert email or password to string",
      });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
  });
};

exports.logout = (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(0),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

exports.loginByGmail = async (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
};

exports.loginByGmailCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token, id_token } = data;

    // Use access_token or id_token to fetch user profile
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    // find user in database
    const user = await User.findOne({ email: profile.email });
    if (!user) {
      // Create user
      const user = await User.create({
        name: profile.name,
        email: profile.email,
        password: "12345678",
        tel: "0000000000",
        registerType : "gmail"
      });
      sendTokenResponse(user, 200, res);
      return;
    }
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Error:", error);
  }
};
