// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PaymentGateway
 * @dev Handles x402 protocol payments for NepharaLabs ($NEPHARA)
 * Supports both native token and ERC20 payments
 */
contract PaymentGateway is ReentrancyGuard, Ownable {

    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        address token; // address(0) for native token
        uint256 timestamp;
        bytes32 requestHash;
        bool completed;
    }

    // Payment tracking
    mapping(bytes32 => Payment) public payments;
    mapping(address => uint256) public totalPaid;
    mapping(address => uint256) public totalReceived;

    // Events
    event PaymentInitiated(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token
    );

    event PaymentCompleted(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount
    );

    event PaymentRefunded(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Initiate a payment with native token
     * @param payee The address receiving the payment
     * @param requestHash Hash of the resource request
     */
    function payNative(
        address payee,
        bytes32 requestHash
    ) external payable nonReentrant returns (bytes32) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(payee != address(0), "Invalid payee address");

        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                payee,
                msg.value,
                requestHash,
                block.timestamp
            )
        );

        require(payments[paymentId].payer == address(0), "Payment already exists");

        payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            token: address(0),
            timestamp: block.timestamp,
            requestHash: requestHash,
            completed: false
        });

        totalPaid[msg.sender] += msg.value;

        emit PaymentInitiated(paymentId, msg.sender, payee, msg.value, address(0));

        return paymentId;
    }

    /**
     * @dev Initiate a payment with ERC20 token
     * @param payee The address receiving the payment
     * @param token The ERC20 token address
     * @param amount The amount to pay
     * @param requestHash Hash of the resource request
     */
    function payToken(
        address payee,
        address token,
        uint256 amount,
        bytes32 requestHash
    ) external nonReentrant returns (bytes32) {
        require(amount > 0, "Payment amount must be greater than 0");
        require(payee != address(0), "Invalid payee address");
        require(token != address(0), "Invalid token address");

        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                payee,
                amount,
                token,
                requestHash,
                block.timestamp
            )
        );

        require(payments[paymentId].payer == address(0), "Payment already exists");

        // Transfer tokens from payer to this contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            token: token,
            timestamp: block.timestamp,
            requestHash: requestHash,
            completed: false
        });

        totalPaid[msg.sender] += amount;

        emit PaymentInitiated(paymentId, msg.sender, payee, amount, token);

        return paymentId;
    }

    /**
     * @dev Complete a payment and transfer funds to payee
     * @param paymentId The payment identifier
     */
    function completePayment(bytes32 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];

        require(payment.payer != address(0), "Payment does not exist");
        require(!payment.completed, "Payment already completed");
        require(msg.sender == payment.payee || msg.sender == owner(), "Only payee or owner can complete");

        payment.completed = true;
        totalReceived[payment.payee] += payment.amount;

        // Transfer funds to payee
        if (payment.token == address(0)) {
            // Native token transfer
            (bool success, ) = payment.payee.call{value: payment.amount}("");
            require(success, "Native token transfer failed");
        } else {
            // ERC20 token transfer
            IERC20(payment.token).transfer(payment.payee, payment.amount);
        }

        emit PaymentCompleted(paymentId, payment.payer, payment.payee, payment.amount);
    }

    /**
     * @dev Refund a payment (only owner can refund)
     * @param paymentId The payment identifier
     */
    function refundPayment(bytes32 paymentId) external onlyOwner nonReentrant {
        Payment storage payment = payments[paymentId];

        require(payment.payer != address(0), "Payment does not exist");
        require(!payment.completed, "Payment already completed");

        payment.completed = true; // Mark as completed to prevent double refund

        // Refund to payer
        if (payment.token == address(0)) {
            (bool success, ) = payment.payer.call{value: payment.amount}("");
            require(success, "Native token refund failed");
        } else {
            IERC20(payment.token).transfer(payment.payer, payment.amount);
        }

        emit PaymentRefunded(paymentId, payment.payer, payment.amount);
    }

    /**
     * @dev Get payment details
     * @param paymentId The payment identifier
     */
    function getPayment(bytes32 paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }

    /**
     * @dev Check if payment is completed
     * @param paymentId The payment identifier
     */
    function isPaymentCompleted(bytes32 paymentId) external view returns (bool) {
        return payments[paymentId].completed;
    }
}

