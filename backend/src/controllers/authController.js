const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, Wallet, OTPLog } = require("../models");
const blockchainService = require("../services/blockchainService");
const logger = require("../utils/logger");
const qrcode = require("qrcode");

// ==================== TOKEN HELPERS ====================

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ==================== CONTROLLERS ====================

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP to phone number
 */
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone, type = "LOGIN" } = req.body;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await OTPLog.create({
      phone,
      otp,
      type,
      expiresAt,
      ipAddress: req.ip,
    });

    // TODO: Integrate Twilio SMS here
    // await twilioClient.messages.create({
    //   body: `Your BlockPay OTP is: ${otp}. Valid for 10 minutes.`,
    //   from: process.env.TWILIO_PHONE,
    //   to: phone,
    // });

    logger.info(`OTP sent to ${phone}: ${otp} [DEV MODE]`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      ...(process.env.NODE_ENV === "development" && { otp }), // Remove in production
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP for phone
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const otpRecord = await OTPLog.findOne({
      phone,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    if (otpRecord.otp !== otp) {
      await OTPLog.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await OTPLog.findByIdAndUpdate(otpRecord._id, {
      isUsed: true,
      usedAt: new Date(),
    });

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const { fullName, username, email, phone, password } = req.body;

    // Check existing user
    const existing = await User.findOne({
      $or: [{ email }, { username }, { "phone.number": phone }],
    });

    if (existing) {
      const field =
        existing.email === email
          ? "Email"
          : existing.username === username
          ? "Username"
          : "Phone";
      return res.status(409).json({ success: false, message: `${field} already registered` });
    }

    // Create user
    const user = await User.create({
      fullName,
      username,
      email,
      phone: { number: phone },
      password,
      isPhoneVerified: true, // Assumed OTP verified before this call
    });

    // Generate blockchain wallet
    const walletData = blockchainService.generateUserWallet();
    const encryptedPrivateKey = blockchainService.encryptPrivateKey(
      walletData.privateKey,
      user._id.toString()
    );

    await User.findByIdAndUpdate(user._id, {
      blockchainWallet: {
        address: walletData.address,
        encryptedPrivateKey,
        publicKey: walletData.publicKey,
        isCreated: true,
      },
    });

    // Generate UPI ID and QR code
    const upiId = `${username}@blockpay`;
    const qrData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(fullName)}&mc=0000&mode=02&purpose=00`;
    const qrCode = await qrcode.toDataURL(qrData);

    // Create wallet record
    await Wallet.create({
      userId: user._id,
      upiId,
      qrCode,
      qrCodeData: qrData,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: {
          token: refreshToken,
          createdAt: new Date(),
          device: req.headers["user-agent"] || "unknown",
        },
      },
      lastLogin: new Date(),
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          walletAddress: walletData.address,
          upiId,
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user with email/phone + password
 */
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // email, phone, or username

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { "phone.number": identifier },
      ],
      isActive: true,
    }).select("+password +blockchainWallet.encryptedPrivateKey");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isLocked()) {
      return res.status(423).json({ success: false, message: "Account temporarily locked. Try again later." });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const attempts = user.loginAttempts + 1;
      const update = { loginAttempts: attempts };
      if (attempts >= 5) {
        update.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock 30 min
      }
      await User.findByIdAndUpdate(user._id, update);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
      $push: {
        refreshTokens: {
          token: refreshToken,
          createdAt: new Date(),
          device: req.headers["user-agent"] || "unknown",
        },
      },
    });

    const wallet = await Wallet.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          walletAddress: user.blockchainWallet?.address,
          upiId: wallet?.upiId,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          kyc: user.kyc,
          role: user.role,
        },
        wallet: {
          balance: wallet?.balance || 0,
          currency: wallet?.currency || "INR",
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/refresh-token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      "refreshTokens.token": refreshToken,
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { refreshTokens: { token: refreshToken } },
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
