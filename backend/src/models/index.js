const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// ======================== USER SCHEMA ========================
const UserSchema = new mongoose.Schema(
  {
    // Identity
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    phone: {
      countryCode: { type: String, default: "+91" },
      number: { type: String, required: true, unique: true },
    },

    // Authentication
    password: { type: String, required: true, minlength: 8, select: false },
    pin: { type: String, select: false }, // 4-digit encrypted PIN
    biometricEnabled: { type: Boolean, default: false },
    biometricKey: { type: String, select: false },

    // OTP
    otp: {
      code: { type: String, select: false },
      expiry: { type: Date, select: false },
      attempts: { type: Number, default: 0 },
      lastSent: { type: Date },
    },

    // Profile
    avatar: { type: String, default: null },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not"] },

    // KYC
    kyc: {
      status: {
        type: String,
        enum: ["pending", "submitted", "verified", "rejected"],
        default: "pending",
      },
      aadhaarNumber: { type: String, select: false },
      panNumber: { type: String, select: false },
      verifiedAt: { type: Date },
    },

    // Blockchain wallet
    blockchainWallet: {
      address: { type: String, unique: true, sparse: true },
      encryptedPrivateKey: { type: String, select: false },
      publicKey: { type: String },
      isCreated: { type: Boolean, default: false },
    },

    // Status
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },

    // Sessions
    refreshTokens: [{ token: String, createdAt: Date, device: String }],
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // Referral
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ "phone.number": 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ "blockchainWallet.address": 1 });
UserSchema.index({ referralCode: 1 });

// Virtuals
UserSchema.virtual("wallet", {
  ref: "Wallet",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

// Pre-save hooks
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified("pin") && this.pin) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.comparePin = async function (candidatePin) {
  return bcrypt.compare(candidatePin, this.pin);
};

UserSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model("User", UserSchema);

// ======================== WALLET SCHEMA ========================
const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0, min: 0 }, // In INR (fiat)
    cryptoBalance: { type: Number, default: 0 },   // In ETH/MATIC
    currency: { type: String, default: "INR" },
    isActive: { type: Boolean, default: true },
    dailyLimit: { type: Number, default: 50000 },   // INR
    dailySpent: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    totalTransferred: { type: Number, default: 0 },
    linkedAccounts: [
      {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountHolder: String,
        isPrimary: { type: Boolean, default: false },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    upiId: { type: String, unique: true, sparse: true },
    qrCode: { type: String }, // Base64 QR code
    qrCodeData: { type: String }, // UPI string
  },
  { timestamps: true }
);

WalletSchema.index({ userId: 1 });
WalletSchema.index({ upiId: 1 });

const Wallet = mongoose.model("Wallet", WalletSchema);

// ======================== TRANSACTION SCHEMA ========================
const TransactionSchema = new mongoose.Schema(
  {
    // Identifiers
    transactionId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: [
        "TRANSFER_SEND",
        "TRANSFER_RECEIVE",
        "BILL_PAYMENT",
        "MOBILE_RECHARGE",
        "DEPOSIT",
        "WITHDRAWAL",
        "CASHBACK",
        "REFUND",
      ],
      required: true,
    },

    // Parties
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderWalletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
    receiverWalletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },

    // Amounts
    amount: { type: Number, required: true, min: 0 },
    fee: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // Blockchain
    blockchain: {
      network: { type: String, default: "polygon" },
      txHash: { type: String, unique: true, sparse: true },
      blockNumber: { type: Number },
      contractTxId: { type: Number }, // On-chain transaction ID
      gasUsed: { type: String },
      gasPrice: { type: String },
      confirmations: { type: Number, default: 0 },
      isConfirmed: { type: Boolean, default: false },
      confirmedAt: { type: Date },
    },

    // Status
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REVERSED"],
      default: "PENDING",
    },

    // Metadata
    description: { type: String, maxlength: 500 },
    note: { type: String, maxlength: 200 },
    category: { type: String },

    // Bill Payment Details
    billDetails: {
      billType: String,
      providerId: String,
      providerName: String,
      accountNumber: String,
      billPeriod: String,
      receiptHash: String,
    },

    // Failure info
    failureReason: { type: String },

    // Receipt
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ senderId: 1, createdAt: -1 });
TransactionSchema.index({ receiverId: 1, createdAt: -1 });
TransactionSchema.index({ "blockchain.txHash": 1 });
TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ status: 1 });

const Transaction = mongoose.model("Transaction", TransactionSchema);

// ======================== NOTIFICATION SCHEMA ========================
const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "TRANSACTION_SUCCESS",
        "TRANSACTION_FAILED",
        "MONEY_RECEIVED",
        "BILL_PAID",
        "KYC_VERIFIED",
        "LOGIN_ALERT",
        "PROMOTIONAL",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);

// ======================== OTP LOG SCHEMA ========================
const OTPLogSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String },
  otp: { type: String, required: true },
  type: {
    type: String,
    enum: ["REGISTRATION", "LOGIN", "TRANSACTION", "PASSWORD_RESET"],
    required: true,
  },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL 10 min
});

const OTPLog = mongoose.model("OTPLog", OTPLogSchema);

module.exports = { User, Wallet, Transaction, Notification, OTPLog };
