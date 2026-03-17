const { v4: uuidv4 } = require("uuid");
const { User, Wallet, Transaction, Notification } = require("../models");
const blockchainService = require("../services/blockchainService");
const logger = require("../utils/logger");

// ==================== HELPER: INR to ETH conversion (mock) ====================
const INR_TO_ETH_RATE = 0.000004; // Mock rate: 1 INR = 0.000004 ETH
const inrToEth = (inr) => (inr * INR_TO_ETH_RATE).toFixed(8);
const ethToInr = (eth) => (parseFloat(eth) / INR_TO_ETH_RATE).toFixed(2);

// ==================== SEND MONEY ====================

/**
 * @route   POST /api/v1/transactions/send
 * @desc    Send money to another user
 */
exports.sendMoney = async (req, res, next) => {
  const session = await require("mongoose").startSession();
  session.startTransaction();

  try {
    const { receiverIdentifier, amount, note, pin } = req.body;
    const senderId = req.user.id;

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // Find sender
    const sender = await User.findById(senderId)
      .select("+blockchainWallet.encryptedPrivateKey +pin")
      .session(session);

    if (!sender?.blockchainWallet?.isCreated) {
      return res.status(400).json({ success: false, message: "Sender wallet not found" });
    }

    // Verify PIN
    const isPinValid = await sender.comparePin(pin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, message: "Invalid PIN" });
    }

    // Find receiver
    const receiver = await User.findOne({
      $or: [
        { "phone.number": receiverIdentifier },
        { username: receiverIdentifier },
        { "blockchainWallet.address": receiverIdentifier },
      ],
      isActive: true,
    }).session(session);

    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    if (sender._id.equals(receiver._id)) {
      return res.status(400).json({ success: false, message: "Cannot send money to yourself" });
    }

    // Check sender wallet balance
    const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(senderWallet.lastResetDate) < today) {
      senderWallet.dailySpent = 0;
      senderWallet.lastResetDate = new Date();
    }

    if (senderWallet.dailySpent + amount > senderWallet.dailyLimit) {
      return res.status(400).json({
        success: false,
        message: `Daily limit exceeded. Remaining: ₹${senderWallet.dailyLimit - senderWallet.dailySpent}`,
      });
    }

    const receiverWallet = await Wallet.findOne({ userId: receiver._id }).session(session);
    if (!receiverWallet) {
      return res.status(404).json({ success: false, message: "Receiver wallet not found" });
    }

    // Calculate fees (0.1%)
    const feeAmount = Math.floor(amount * 0.001 * 100) / 100;
    const netAmount = amount - feeAmount;
    const transactionId = `BP-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Debit sender, credit receiver (DB first for speed)
    senderWallet.balance -= amount;
    senderWallet.dailySpent += amount;
    senderWallet.totalTransferred += amount;
    receiverWallet.balance += netAmount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    // Create transaction records
    const [senderTx, receiverTx] = await Transaction.create(
      [
        {
          transactionId: `${transactionId}-S`,
          type: "TRANSFER_SEND",
          senderId,
          receiverId: receiver._id,
          senderWalletId: senderWallet._id,
          receiverWalletId: receiverWallet._id,
          amount,
          fee: feeAmount,
          netAmount,
          description: `Sent to ${receiver.username}`,
          note,
          status: "PROCESSING",
          "blockchain.network": process.env.BLOCKCHAIN_NETWORK,
        },
        {
          transactionId: `${transactionId}-R`,
          type: "TRANSFER_RECEIVE",
          senderId,
          receiverId: receiver._id,
          senderWalletId: senderWallet._id,
          receiverWalletId: receiverWallet._id,
          amount,
          fee: feeAmount,
          netAmount,
          description: `Received from ${sender.username}`,
          note,
          status: "PROCESSING",
          "blockchain.network": process.env.BLOCKCHAIN_NETWORK,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // ---- Async blockchain recording (non-blocking) ----
    setImmediate(async () => {
      try {
        const amountInEth = inrToEth(amount);
        const privateKey = blockchainService.decryptPrivateKey(
          sender.blockchainWallet.encryptedPrivateKey,
          senderId.toString()
        );

        const blockchainResult = await blockchainService.executeTransfer({
          senderPrivateKey: privateKey,
          senderId: senderId.toString(),
          receiverAddress: receiver.blockchainWallet.address,
          amountInEther: amountInEth,
          metadata: JSON.stringify({ transactionId, note }),
        });

        // Update transaction records with blockchain data
        const blockchainUpdate = {
          status: "COMPLETED",
          "blockchain.txHash": blockchainResult.txHash,
          "blockchain.blockNumber": blockchainResult.blockNumber,
          "blockchain.gasUsed": blockchainResult.gasUsed,
          "blockchain.contractTxId": blockchainResult.contractTxId,
          "blockchain.isConfirmed": true,
          "blockchain.confirmedAt": new Date(),
        };

        await Transaction.updateMany(
          { transactionId: { $in: [`${transactionId}-S`, `${transactionId}-R`] } },
          blockchainUpdate
        );

        // Real-time notifications via Socket.IO
        const io = req.app.get("io");
        if (io) {
          io.to(`user_${receiver._id}`).emit("money_received", {
            amount: netAmount,
            from: sender.username,
            txHash: blockchainResult.txHash,
            transactionId,
          });
        }

        // Create DB notifications
        await Notification.create([
          {
            userId: senderId,
            type: "TRANSACTION_SUCCESS",
            title: "Money Sent!",
            body: `₹${amount} sent to ${receiver.fullName}`,
            data: { transactionId, txHash: blockchainResult.txHash },
          },
          {
            userId: receiver._id,
            type: "MONEY_RECEIVED",
            title: "Money Received!",
            body: `₹${netAmount} received from ${sender.fullName}`,
            data: { transactionId, txHash: blockchainResult.txHash },
          },
        ]);

        logger.info(`✅ Blockchain tx confirmed: ${blockchainResult.txHash}`);
      } catch (blockchainErr) {
        logger.error("Blockchain recording failed:", blockchainErr.message);
        // Transaction stays PROCESSING - can be retried via job queue
      }
    });

    res.status(200).json({
      success: true,
      message: "Transaction initiated successfully",
      data: {
        transactionId,
        amount,
        fee: feeAmount,
        netAmount,
        receiver: {
          name: receiver.fullName,
          username: receiver.username,
        },
        status: "PROCESSING",
        message: "Transaction is being recorded on blockchain",
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

// ==================== GET TRANSACTION HISTORY ====================

/**
 * @route   GET /api/v1/transactions/history
 */
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;

    const filter = {
      $or: [{ senderId: userId }, { receiverId: userId }],
    };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("senderId", "fullName username avatar")
        .populate("receiverId", "fullName username avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ==================== VERIFY TRANSACTION ON BLOCKCHAIN ====================

/**
 * @route   GET /api/v1/transactions/:txHash/verify
 */
exports.verifyOnBlockchain = async (req, res, next) => {
  try {
    const { txHash } = req.params;

    const [dbTx, blockchainVerification] = await Promise.all([
      Transaction.findOne({ "blockchain.txHash": txHash }),
      blockchainService.verifyTransaction(txHash),
    ]);

    if (!dbTx) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        transactionId: dbTx.transactionId,
        dbStatus: dbTx.status,
        amount: dbTx.amount,
        blockchain: {
          txHash,
          isVerified: blockchainVerification.isValid,
          isOnChain: blockchainVerification.onChain,
          blockNumber: blockchainVerification.blockNumber,
          confirmations: blockchainVerification.confirmations,
          network: process.env.BLOCKCHAIN_NETWORK,
          explorerUrl: `${process.env.BLOCK_EXPLORER_URL}/tx/${txHash}`,
        },
        timestamp: dbTx.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ==================== GET WALLET BALANCE ====================

/**
 * @route   GET /api/v1/wallet/balance
 */
exports.getWalletBalance = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const user = await User.findById(req.user.id);
    let onChainBalance = "0";

    if (user?.blockchainWallet?.address) {
      onChainBalance = await blockchainService.getOnChainBalance(
        user.blockchainWallet.address
      );
    }

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        currency: wallet.currency,
        onChainBalance: `${onChainBalance} ETH`,
        dailyLimit: wallet.dailyLimit,
        dailySpent: wallet.dailySpent,
        dailyRemaining: wallet.dailyLimit - wallet.dailySpent,
        upiId: wallet.upiId,
        qrCode: wallet.qrCode,
        walletAddress: user?.blockchainWallet?.address,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ==================== ADD MONEY (DEPOSIT SIMULATION) ====================

/**
 * @route   POST /api/v1/wallet/deposit
 */
exports.depositMoney = async (req, res, next) => {
  try {
    const { amount, method = "UPI" } = req.body;

    if (amount <= 0 || amount > 100000) {
      return res.status(400).json({ success: false, message: "Invalid deposit amount (max ₹1,00,000)" });
    }

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user.id },
      {
        $inc: { balance: amount, totalDeposited: amount },
      },
      { new: true }
    );

    const transactionId = `BP-DEP-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    await Transaction.create({
      transactionId,
      type: "DEPOSIT",
      receiverId: req.user.id,
      receiverWalletId: wallet._id,
      amount,
      fee: 0,
      netAmount: amount,
      status: "COMPLETED",
      description: `Deposit via ${method}`,
      "blockchain.network": process.env.BLOCKCHAIN_NETWORK,
    });

    res.status(200).json({
      success: true,
      message: `₹${amount} added to wallet successfully`,
      data: {
        transactionId,
        amount,
        newBalance: wallet.balance,
        method,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};
