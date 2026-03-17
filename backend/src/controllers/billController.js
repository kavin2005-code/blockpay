const { v4: uuidv4 } = require("uuid");
const { User, Wallet, Transaction, Notification } = require("../models");
const blockchainService = require("../services/blockchainService");
const logger = require("../utils/logger");

// Mock bill providers
const BILL_PROVIDERS = {
  ELECTRICITY: [
    { id: "BESCOM", name: "BESCOM - Bangalore Electricity", states: ["KA"] },
    { id: "MSEDCL", name: "MSEDCL - Maharashtra", states: ["MH"] },
    { id: "TATA_POWER", name: "Tata Power", states: ["MH", "DL"] },
  ],
  MOBILE: [
    { id: "JIO", name: "Reliance Jio", plans: [199, 299, 399, 599, 999] },
    { id: "AIRTEL", name: "Airtel", plans: [199, 265, 359, 549, 839] },
    { id: "VI", name: "Vodafone Idea", plans: [179, 249, 319, 479, 699] },
    { id: "BSNL", name: "BSNL", plans: [97, 187, 247, 397, 666] },
  ],
  INTERNET: [
    { id: "ACT", name: "ACT Fibernet", plans: [599, 799, 999, 1199] },
    { id: "AIRTEL_FIBER", name: "Airtel Xstream Fiber", plans: [499, 799, 999, 1499] },
    { id: "JIOFIBER", name: "JioFiber", plans: [399, 699, 999, 1499] },
  ],
  DTH: [
    { id: "TATA_PLAY", name: "Tata Play", plans: [149, 249, 349, 499] },
    { id: "DISH_TV", name: "Dish TV", plans: [129, 229, 329, 429] },
    { id: "JIOTV", name: "JioTV", plans: [149, 249, 399] },
  ],
};

/**
 * @route   GET /api/v1/bills/providers/:billType
 */
exports.getProviders = async (req, res) => {
  const { billType } = req.params;
  const providers = BILL_PROVIDERS[billType.toUpperCase()];

  if (!providers) {
    return res.status(400).json({ success: false, message: "Invalid bill type" });
  }

  res.status(200).json({ success: true, data: { providers } });
};

/**
 * @route   POST /api/v1/bills/validate
 * @desc    Validate bill account before payment
 */
exports.validateBill = async (req, res) => {
  const { billType, providerId, accountNumber } = req.body;

  // Mock validation - in production, call provider's API
  const mockBillData = {
    accountHolder: "John Doe",
    address: "123 Main Street, Bangalore",
    amount: Math.floor(Math.random() * 2000) + 500,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    billPeriod: "November 2024",
    billNumber: `BILL-${Date.now()}`,
    status: "UNPAID",
  };

  res.status(200).json({
    success: true,
    data: {
      isValid: true,
      billType,
      providerId,
      accountNumber,
      ...mockBillData,
    },
  });
};

/**
 * @route   POST /api/v1/bills/pay
 * @desc    Pay a utility bill
 */
exports.payBill = async (req, res, next) => {
  const session = await require("mongoose").startSession();
  session.startTransaction();

  try {
    const { billType, providerId, accountNumber, amount, pin } = req.body;
    const userId = req.user.id;

    const VALID_BILL_TYPES = ["ELECTRICITY", "MOBILE", "INTERNET", "DTH", "GAS", "WATER"];
    if (!VALID_BILL_TYPES.includes(billType.toUpperCase())) {
      return res.status(400).json({ success: false, message: "Invalid bill type" });
    }

    const user = await User.findById(userId)
      .select("+blockchainWallet.encryptedPrivateKey +pin")
      .session(session);

    // Verify PIN
    const isPinValid = await user.comparePin(pin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, message: "Invalid PIN" });
    }

    // Check wallet balance
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const fee = Math.floor(amount * 0.001 * 100) / 100;
    const totalDeduction = amount + fee;

    if (wallet.balance < totalDeduction) {
      return res.status(400).json({ success: false, message: "Insufficient balance (including fees)" });
    }

    const transactionId = `BP-BILL-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Deduct from wallet
    wallet.balance -= totalDeduction;
    await wallet.save({ session });

    const tx = await Transaction.create(
      [
        {
          transactionId,
          type: "BILL_PAYMENT",
          senderId: userId,
          senderWalletId: wallet._id,
          amount,
          fee,
          netAmount: amount,
          status: "PROCESSING",
          description: `${billType} bill payment - ${accountNumber}`,
          billDetails: {
            billType: billType.toUpperCase(),
            providerId,
            providerName: BILL_PROVIDERS[billType.toUpperCase()]?.find((p) => p.id === providerId)?.name || providerId,
            accountNumber,
          },
          "blockchain.network": process.env.BLOCKCHAIN_NETWORK,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Async blockchain recording
    setImmediate(async () => {
      try {
        const amountInEth = (amount * 0.000004).toFixed(8);
        const privateKey = blockchainService.decryptPrivateKey(
          user.blockchainWallet.encryptedPrivateKey,
          userId.toString()
        );

        const blockchainResult = await blockchainService.executeBillPayment({
          payerPrivateKey: privateKey,
          billType: billType.toUpperCase(),
          providerId,
          accountNumber,
          amountInEther: amountInEth,
        });

        await Transaction.findByIdAndUpdate(tx[0]._id, {
          status: "COMPLETED",
          "blockchain.txHash": blockchainResult.txHash,
          "blockchain.blockNumber": blockchainResult.blockNumber,
          "blockchain.isConfirmed": true,
          "blockchain.confirmedAt": new Date(),
          "billDetails.receiptHash": blockchainResult.receiptHash,
        });

        await Notification.create({
          userId,
          type: "BILL_PAID",
          title: `${billType} Bill Paid!`,
          body: `₹${amount} paid for ${accountNumber}. Receipt on blockchain.`,
          data: { transactionId, txHash: blockchainResult.txHash },
        });

        logger.info(`Bill payment blockchain recorded: ${blockchainResult.txHash}`);
      } catch (err) {
        logger.error("Bill payment blockchain recording failed:", err.message);
      }
    });

    res.status(200).json({
      success: true,
      message: "Bill payment successful",
      data: {
        transactionId,
        billType,
        accountNumber,
        amount,
        fee,
        status: "PROCESSING",
        message: "Payment recorded on blockchain. Receipt will be available shortly.",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

/**
 * @route   POST /api/v1/bills/recharge
 * @desc    Mobile/DTH recharge
 */
exports.mobileRecharge = async (req, res, next) => {
  try {
    const { mobileNumber, operatorId, planAmount, pin } = req.body;
    const userId = req.user.id;

    // Delegate to payBill with MOBILE type
    req.body = {
      billType: "MOBILE",
      providerId: operatorId,
      accountNumber: mobileNumber,
      amount: planAmount,
      pin,
    };

    return exports.payBill(req, res, next);
  } catch (err) {
    next(err);
  }
};
