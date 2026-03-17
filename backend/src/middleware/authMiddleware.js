const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.protect = async (req, res, next) => {
  try {
    console.log("Headers received:", JSON.stringify(req.headers));
    const authHeader = req.headers.authorization || req.headers["Authorization"];
      return res.status(401).json({ success: false, message: "No token provided" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
      return res.status(401).json({ success: false, message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.log("Auth error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
    return res.status(403).json({ success: false, message: "Forbidden" });
  next();
};
