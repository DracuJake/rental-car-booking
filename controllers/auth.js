const User = require("../models/User");

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });
    const token = await user.getSignedJwtToken();
    res.status(200).json({ success: true,  _id: user._id,
        name: user.name,
        email: user.email,token});
  } catch (err) {
    res.status(400).json({ success: false });
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

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      //add for frontend
      _id: user._id,
      name: user.name,
      email: user.email,
      //end for frontend
      token,
    });
  } catch (err) {
    res.status(401).json({ success: false, msg: "Cannot convert email or password to string" });
  }
};


// @desc      Get current logged-in user's details
// @route     GET /api/v1/auth/me
// @access    Private (since `protect` middleware is used)
exports.getMe = async (req, res, next) => {
  try {
    // `req.user` will be set by the JWT middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, 
      },
    // If you want to return the role as well
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
