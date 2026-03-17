// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.post("/send-otp", [
  body("phone").isMobilePhone().withMessage("Valid phone number required"),
], validate, auth.sendOTP);

router.post("/verify-otp", [
  body("phone").isMobilePhone(),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
], validate, auth.verifyOTP);

router.post("/register", [
  body("fullName").trim().isLength({ min: 2, max: 100 }),
  body("username").trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body("email").isEmail().normalizeEmail(),
  body("phone").isMobilePhone(),
  body("password").isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], validate, auth.register);

router.post("/login", [
  body("identifier").notEmpty().withMessage("Email, username or phone required"),
  body("password").notEmpty(),
], validate, auth.login);

router.post("/refresh-token", auth.refreshToken);
router.post("/logout", protect, auth.logout);

module.exports = router;

// ─────────────────────────────────────────────

// routes/transactionRoutes.js  
const txRouter = express.Router();
const txCtrl = require("../controllers/transactionController");
const { protect: txProtect } = require("../middleware/authMiddleware");

txRouter.use(txProtect);

txRouter.get("/history", txCtrl.getHistory);
txRouter.get("/:txHash/verify", txCtrl.verifyOnBlockchain);

txRouter.post("/send", [
  body("receiverIdentifier").notEmpty(),
  body("amount").isFloat({ min: 1 }),
  body("pin").isLength({ min: 4, max: 6 }).isNumeric(),
], validate, txCtrl.sendMoney);

txRouter.get("/wallet/balance", txCtrl.getWalletBalance);
txRouter.post("/wallet/deposit", [
  body("amount").isFloat({ min: 1, max: 100000 }),
], validate, txCtrl.depositMoney);

// ─────────────────────────────────────────────

// routes/billRoutes.js
const billRouter = express.Router();
const billCtrl = require("../controllers/billController");
const { protect: billProtect } = require("../middleware/authMiddleware");

billRouter.use(billProtect);

billRouter.get("/providers/:billType", billCtrl.getProviders);
billRouter.post("/validate", billCtrl.validateBill);
billRouter.post("/pay", [
  body("billType").isIn(["ELECTRICITY", "MOBILE", "INTERNET", "DTH", "GAS", "WATER"]),
  body("providerId").notEmpty(),
  body("accountNumber").notEmpty(),
  body("amount").isFloat({ min: 1 }),
  body("pin").isLength({ min: 4, max: 6 }).isNumeric(),
], validate, billCtrl.payBill);
billRouter.post("/recharge", billCtrl.mobileRecharge);

module.exports = { router, txRouter, billRouter };
