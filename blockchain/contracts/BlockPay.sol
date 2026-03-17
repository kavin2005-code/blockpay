// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title BlockPay
 * @dev Secure digital payment smart contract with wallet management
 * @author BlockPay Team
 */
contract BlockPay is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;

    // ======================== STATE VARIABLES ========================

    uint256 public constant TRANSACTION_FEE_BPS = 10; // 0.1% fee (10 basis points)
    uint256 public constant MAX_DAILY_LIMIT = 10 ether;
    uint256 public constant MIN_TRANSFER = 0.0001 ether;

    uint256 private _transactionCounter;
    uint256 public totalFeesCollected;

    // ======================== STRUCTS ========================

    struct Wallet {
        address walletAddress;
        string userId;           // MongoDB user ID reference
        uint256 balance;
        uint256 dailySpent;
        uint256 lastResetDay;
        bool isActive;
        bool isVerified;
        uint256 createdAt;
    }

    struct Transaction {
        uint256 txId;
        address sender;
        address receiver;
        uint256 amount;
        uint256 fee;
        string txType;           // "TRANSFER", "BILL_PAYMENT", "RECHARGE", "DEPOSIT"
        string metadata;         // JSON string for bill details
        TransactionStatus status;
        uint256 timestamp;
        bytes32 txHash;
    }

    struct BillPayment {
        uint256 txId;
        address payer;
        string billType;         // "ELECTRICITY", "MOBILE", "INTERNET"
        string providerId;
        string accountNumber;
        uint256 amount;
        bool isPaid;
        uint256 paidAt;
        bytes32 receiptHash;
    }

    enum TransactionStatus {
        PENDING,
        COMPLETED,
        FAILED,
        REVERSED
    }

    // ======================== MAPPINGS ========================

    mapping(address => Wallet) public wallets;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(uint256 => BillPayment) public billPayments;
    mapping(address => bool) public authorizedOperators;
    mapping(bytes32 => bool) public processedHashes; // Prevent duplicate txs

    // ======================== EVENTS ========================

    event WalletCreated(
        address indexed walletAddress,
        string userId,
        uint256 timestamp
    );

    event MoneyTransferred(
        uint256 indexed txId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 fee,
        bytes32 txHash,
        uint256 timestamp
    );

    event MoneyDeposited(
        address indexed walletAddress,
        uint256 amount,
        uint256 timestamp
    );

    event MoneyWithdrawn(
        address indexed walletAddress,
        uint256 amount,
        uint256 timestamp
    );

    event BillPaid(
        uint256 indexed txId,
        address indexed payer,
        string billType,
        string accountNumber,
        uint256 amount,
        bytes32 receiptHash,
        uint256 timestamp
    );

    event WalletStatusChanged(
        address indexed walletAddress,
        bool isActive,
        uint256 timestamp
    );

    event FeesWithdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );

    // ======================== MODIFIERS ========================

    modifier onlyActiveWallet(address _address) {
        require(wallets[_address].isActive, "BlockPay: Wallet is not active");
        _;
    }

    modifier walletExists(address _address) {
        require(
            wallets[_address].walletAddress != address(0),
            "BlockPay: Wallet does not exist"
        );
        _;
    }

    modifier onlyOperator() {
        require(
            authorizedOperators[msg.sender] || msg.sender == owner(),
            "BlockPay: Not authorized operator"
        );
        _;
    }

    // ======================== CONSTRUCTOR ========================

    constructor() {
        authorizedOperators[msg.sender] = true;
        _transactionCounter = 0;
    }

    // ======================== WALLET MANAGEMENT ========================

    /**
     * @dev Create a new wallet for a user
     * @param _userId MongoDB user ID reference
     */
    function createWallet(string memory _userId) external whenNotPaused {
        require(
            wallets[msg.sender].walletAddress == address(0),
            "BlockPay: Wallet already exists"
        );
        require(bytes(_userId).length > 0, "BlockPay: Invalid user ID");

        wallets[msg.sender] = Wallet({
            walletAddress: msg.sender,
            userId: _userId,
            balance: 0,
            dailySpent: 0,
            lastResetDay: block.timestamp / 86400,
            isActive: true,
            isVerified: false,
            createdAt: block.timestamp
        });

        emit WalletCreated(msg.sender, _userId, block.timestamp);
    }

    /**
     * @dev Deposit funds into wallet
     */
    function depositFunds()
        external
        payable
        whenNotPaused
        walletExists(msg.sender)
        onlyActiveWallet(msg.sender)
        nonReentrant
    {
        require(msg.value > 0, "BlockPay: Deposit amount must be > 0");

        wallets[msg.sender].balance = wallets[msg.sender].balance.add(
            msg.value
        );

        emit MoneyDeposited(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw funds from wallet
     * @param _amount Amount to withdraw in wei
     */
    function withdrawFunds(uint256 _amount)
        external
        whenNotPaused
        walletExists(msg.sender)
        onlyActiveWallet(msg.sender)
        nonReentrant
    {
        require(_amount > 0, "BlockPay: Withdrawal amount must be > 0");
        require(
            wallets[msg.sender].balance >= _amount,
            "BlockPay: Insufficient balance"
        );

        wallets[msg.sender].balance = wallets[msg.sender].balance.sub(_amount);

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "BlockPay: Withdrawal transfer failed");

        emit MoneyWithdrawn(msg.sender, _amount, block.timestamp);
    }

    // ======================== TRANSFER ========================

    /**
     * @dev Transfer funds between wallets
     * @param _receiver Receiver wallet address
     * @param _amount Amount to transfer in wei
     * @param _metadata Optional metadata (JSON string)
     */
    function transferFunds(
        address _receiver,
        uint256 _amount,
        string memory _metadata
    )
        external
        whenNotPaused
        walletExists(msg.sender)
        walletExists(_receiver)
        onlyActiveWallet(msg.sender)
        onlyActiveWallet(_receiver)
        nonReentrant
        returns (uint256 txId, bytes32 txHash)
    {
        require(
            _receiver != msg.sender,
            "BlockPay: Cannot transfer to yourself"
        );
        require(_amount >= MIN_TRANSFER, "BlockPay: Amount below minimum");
        require(
            wallets[msg.sender].balance >= _amount,
            "BlockPay: Insufficient balance"
        );

        // Check daily limit
        _checkAndResetDailyLimit(msg.sender);
        require(
            wallets[msg.sender].dailySpent.add(_amount) <= MAX_DAILY_LIMIT,
            "BlockPay: Daily transfer limit exceeded"
        );

        // Calculate fee
        uint256 fee = _amount.mul(TRANSACTION_FEE_BPS).div(10000);
        uint256 netAmount = _amount.sub(fee);

        // Generate unique tx hash
        txHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _receiver,
                _amount,
                block.timestamp,
                _transactionCounter
            )
        );
        require(!processedHashes[txHash], "BlockPay: Duplicate transaction");
        processedHashes[txHash] = true;

        // Update balances
        wallets[msg.sender].balance = wallets[msg.sender].balance.sub(_amount);
        wallets[_receiver].balance = wallets[_receiver].balance.add(netAmount);
        wallets[msg.sender].dailySpent = wallets[msg.sender].dailySpent.add(
            _amount
        );
        totalFeesCollected = totalFeesCollected.add(fee);

        // Record transaction
        txId = ++_transactionCounter;
        transactions[txId] = Transaction({
            txId: txId,
            sender: msg.sender,
            receiver: _receiver,
            amount: _amount,
            fee: fee,
            txType: "TRANSFER",
            metadata: _metadata,
            status: TransactionStatus.COMPLETED,
            timestamp: block.timestamp,
            txHash: txHash
        });

        userTransactions[msg.sender].push(txId);
        userTransactions[_receiver].push(txId);

        emit MoneyTransferred(
            txId,
            msg.sender,
            _receiver,
            _amount,
            fee,
            txHash,
            block.timestamp
        );

        return (txId, txHash);
    }

    // ======================== BILL PAYMENTS ========================

    /**
     * @dev Pay a utility bill
     * @param _billType Type of bill (ELECTRICITY, MOBILE, INTERNET)
     * @param _providerId Service provider identifier
     * @param _accountNumber Customer account/number
     * @param _amount Bill amount in wei
     */
    function payBill(
        string memory _billType,
        string memory _providerId,
        string memory _accountNumber,
        uint256 _amount
    )
        external
        whenNotPaused
        walletExists(msg.sender)
        onlyActiveWallet(msg.sender)
        nonReentrant
        returns (uint256 txId, bytes32 receiptHash)
    {
        require(_amount > 0, "BlockPay: Bill amount must be > 0");
        require(
            wallets[msg.sender].balance >= _amount,
            "BlockPay: Insufficient balance"
        );

        uint256 fee = _amount.mul(TRANSACTION_FEE_BPS).div(10000);
        uint256 totalDeduction = _amount.add(fee);

        require(
            wallets[msg.sender].balance >= totalDeduction,
            "BlockPay: Insufficient balance including fee"
        );

        receiptHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _billType,
                _accountNumber,
                _amount,
                block.timestamp,
                _transactionCounter
            )
        );

        wallets[msg.sender].balance = wallets[msg.sender].balance.sub(
            totalDeduction
        );
        totalFeesCollected = totalFeesCollected.add(fee);

        txId = ++_transactionCounter;

        // Store bill payment record
        billPayments[txId] = BillPayment({
            txId: txId,
            payer: msg.sender,
            billType: _billType,
            providerId: _providerId,
            accountNumber: _accountNumber,
            amount: _amount,
            isPaid: true,
            paidAt: block.timestamp,
            receiptHash: receiptHash
        });

        transactions[txId] = Transaction({
            txId: txId,
            sender: msg.sender,
            receiver: address(this),
            amount: _amount,
            fee: fee,
            txType: _billType,
            metadata: _accountNumber,
            status: TransactionStatus.COMPLETED,
            timestamp: block.timestamp,
            txHash: receiptHash
        });

        userTransactions[msg.sender].push(txId);

        emit BillPaid(
            txId,
            msg.sender,
            _billType,
            _accountNumber,
            _amount,
            receiptHash,
            block.timestamp
        );

        return (txId, receiptHash);
    }

    // ======================== VIEW FUNCTIONS ========================

    function getWalletBalance(address _address)
        external
        view
        walletExists(_address)
        returns (uint256)
    {
        return wallets[_address].balance;
    }

    function getTransactionDetails(uint256 _txId)
        external
        view
        returns (Transaction memory)
    {
        require(_txId > 0 && _txId <= _transactionCounter, "BlockPay: Invalid txId");
        return transactions[_txId];
    }

    function getUserTransactions(address _user)
        external
        view
        returns (uint256[] memory)
    {
        return userTransactions[_user];
    }

    function getBillPayment(uint256 _txId)
        external
        view
        returns (BillPayment memory)
    {
        return billPayments[_txId];
    }

    function getWalletInfo(address _address)
        external
        view
        walletExists(_address)
        returns (Wallet memory)
    {
        return wallets[_address];
    }

    function getTotalTransactions() external view returns (uint256) {
        return _transactionCounter;
    }

    function verifyTransactionHash(bytes32 _txHash)
        external
        view
        returns (bool)
    {
        return processedHashes[_txHash];
    }

    // ======================== ADMIN FUNCTIONS ========================

    function setWalletVerified(address _walletAddress, bool _verified)
        external
        onlyOperator
        walletExists(_walletAddress)
    {
        wallets[_walletAddress].isVerified = _verified;
    }

    function setWalletActive(address _walletAddress, bool _active)
        external
        onlyOperator
        walletExists(_walletAddress)
    {
        wallets[_walletAddress].isActive = _active;
        emit WalletStatusChanged(_walletAddress, _active, block.timestamp);
    }

    function addOperator(address _operator) external onlyOwner {
        authorizedOperators[_operator] = true;
    }

    function removeOperator(address _operator) external onlyOwner {
        authorizedOperators[_operator] = false;
    }

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = totalFeesCollected;
        require(amount > 0, "BlockPay: No fees to withdraw");
        totalFeesCollected = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "BlockPay: Fee withdrawal failed");

        emit FeesWithdrawn(owner(), amount, block.timestamp);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ======================== INTERNAL HELPERS ========================

    function _checkAndResetDailyLimit(address _user) internal {
        uint256 currentDay = block.timestamp / 86400;
        if (wallets[_user].lastResetDay < currentDay) {
            wallets[_user].dailySpent = 0;
            wallets[_user].lastResetDay = currentDay;
        }
    }

    receive() external payable {
        if (wallets[msg.sender].walletAddress != address(0)) {
            wallets[msg.sender].balance = wallets[msg.sender].balance.add(
                msg.value
            );
            emit MoneyDeposited(msg.sender, msg.value, block.timestamp);
        }
    }
}
