// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RecurringPayments
 * @dev Manages subscription-based recurring payments for NEPHARALabs ($NEPHARA)
 * Enables AI agents to pay for recurring services automatically
 */
contract RecurringPayments is ReentrancyGuard, Ownable {

    enum Frequency {
        DAILY,
        WEEKLY,
        MONTHLY,
        YEARLY
    }

    struct Subscription {
        address subscriber;
        address provider;
        uint256 amount;
        address token; // address(0) for native token
        Frequency frequency;
        uint256 startTime;
        uint256 lastPaymentTime;
        uint256 nextPaymentDue;
        bool active;
        uint256 totalPaid;
        uint256 paymentCount;
    }

    // Subscription tracking
    mapping(bytes32 => Subscription) public subscriptions;
    mapping(address => bytes32[]) public subscriberSubscriptions;
    mapping(address => bytes32[]) public providerSubscriptions;
    mapping(address => uint256) public balances; // Prepaid balances for subscriptions

    // Events
    event SubscriptionCreated(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        address indexed provider,
        uint256 amount,
        Frequency frequency
    );

    event SubscriptionPaymentProcessed(
        bytes32 indexed subscriptionId,
        uint256 paymentNumber,
        uint256 amount,
        uint256 timestamp
    );

    event SubscriptionCancelled(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        uint256 finalPaymentCount
    );

    event BalanceDeposited(
        address indexed user,
        uint256 amount
    );

    event BalanceWithdrawn(
        address indexed user,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new subscription with native token
     * @param provider The service provider receiving payments
     * @param amount The amount per payment period
     * @param frequency The payment frequency
     */
    function createSubscriptionNative(
        address provider,
        uint256 amount,
        Frequency frequency
    ) external payable nonReentrant returns (bytes32) {
        require(provider != address(0), "Invalid provider address");
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= amount, "Insufficient initial payment");

        bytes32 subscriptionId = keccak256(
            abi.encodePacked(
                msg.sender,
                provider,
                amount,
                frequency,
                block.timestamp
            )
        );

        require(subscriptions[subscriptionId].subscriber == address(0), "Subscription already exists");

        uint256 nextDue = calculateNextPaymentTime(block.timestamp, frequency);

        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            provider: provider,
            amount: amount,
            token: address(0),
            frequency: frequency,
            startTime: block.timestamp,
            lastPaymentTime: block.timestamp,
            nextPaymentDue: nextDue,
            active: true,
            totalPaid: amount,
            paymentCount: 1
        });

        subscriberSubscriptions[msg.sender].push(subscriptionId);
        providerSubscriptions[provider].push(subscriptionId);

        // Process initial payment
        (bool success, ) = provider.call{value: amount}("");
        require(success, "Initial payment failed");

        // Store any excess as balance
        if (msg.value > amount) {
            balances[msg.sender] += msg.value - amount;
        }

        emit SubscriptionCreated(subscriptionId, msg.sender, provider, amount, frequency);
        emit SubscriptionPaymentProcessed(subscriptionId, 1, amount, block.timestamp);

        return subscriptionId;
    }

    /**
     * @dev Create a new subscription with ERC20 token
     * @param provider The service provider receiving payments
     * @param token The ERC20 token address
     * @param amount The amount per payment period
     * @param frequency The payment frequency
     */
    function createSubscriptionToken(
        address provider,
        address token,
        uint256 amount,
        Frequency frequency
    ) external nonReentrant returns (bytes32) {
        require(provider != address(0), "Invalid provider address");
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        bytes32 subscriptionId = keccak256(
            abi.encodePacked(
                msg.sender,
                provider,
                amount,
                token,
                frequency,
                block.timestamp
            )
        );

        require(subscriptions[subscriptionId].subscriber == address(0), "Subscription already exists");

        // Transfer initial payment
        IERC20(token).transferFrom(msg.sender, provider, amount);

        uint256 nextDue = calculateNextPaymentTime(block.timestamp, frequency);

        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            provider: provider,
            amount: amount,
            token: token,
            frequency: frequency,
            startTime: block.timestamp,
            lastPaymentTime: block.timestamp,
            nextPaymentDue: nextDue,
            active: true,
            totalPaid: amount,
            paymentCount: 1
        });

        subscriberSubscriptions[msg.sender].push(subscriptionId);
        providerSubscriptions[provider].push(subscriptionId);

        emit SubscriptionCreated(subscriptionId, msg.sender, provider, amount, frequency);
        emit SubscriptionPaymentProcessed(subscriptionId, 1, amount, block.timestamp);

        return subscriptionId;
    }

    /**
     * @dev Process a subscription payment (can be called by anyone when payment is due)
     * @param subscriptionId The subscription identifier
     */
    function processPayment(bytes32 subscriptionId) external nonReentrant {
        Subscription storage sub = subscriptions[subscriptionId];

        require(sub.subscriber != address(0), "Subscription does not exist");
        require(sub.active, "Subscription is not active");
        require(block.timestamp >= sub.nextPaymentDue, "Payment not yet due");

        // Check if subscriber has enough balance or allowance
        if (sub.token == address(0)) {
            // Native token - use prepaid balance
            require(balances[sub.subscriber] >= sub.amount, "Insufficient balance");
            balances[sub.subscriber] -= sub.amount;

            (bool success, ) = sub.provider.call{value: sub.amount}("");
            require(success, "Payment transfer failed");
        } else {
            // ERC20 token
            IERC20(sub.token).transferFrom(sub.subscriber, sub.provider, sub.amount);
        }

        // Update subscription
        sub.lastPaymentTime = block.timestamp;
        sub.nextPaymentDue = calculateNextPaymentTime(block.timestamp, sub.frequency);
        sub.totalPaid += sub.amount;
        sub.paymentCount += 1;

        emit SubscriptionPaymentProcessed(subscriptionId, sub.paymentCount, sub.amount, block.timestamp);
    }

    /**
     * @dev Cancel a subscription
     * @param subscriptionId The subscription identifier
     */
    function cancelSubscription(bytes32 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];

        require(sub.subscriber != address(0), "Subscription does not exist");
        require(msg.sender == sub.subscriber || msg.sender == owner(), "Not authorized");
        require(sub.active, "Subscription already cancelled");

        sub.active = false;

        emit SubscriptionCancelled(subscriptionId, sub.subscriber, sub.paymentCount);
    }

    /**
     * @dev Deposit native tokens to prepaid balance
     */
    function depositBalance() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit BalanceDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw from prepaid balance
     * @param amount The amount to withdraw
     */
    function withdrawBalance(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit BalanceWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Calculate next payment time based on frequency
     * @param currentTime The current timestamp
     * @param frequency The payment frequency
     */
    function calculateNextPaymentTime(
        uint256 currentTime,
        Frequency frequency
    ) internal pure returns (uint256) {
        if (frequency == Frequency.DAILY) {
            return currentTime + 1 days;
        } else if (frequency == Frequency.WEEKLY) {
            return currentTime + 7 days;
        } else if (frequency == Frequency.MONTHLY) {
            return currentTime + 30 days;
        } else if (frequency == Frequency.YEARLY) {
            return currentTime + 365 days;
        }
        revert("Invalid frequency");
    }

    /**
     * @dev Get subscription details
     * @param subscriptionId The subscription identifier
     */
    function getSubscription(bytes32 subscriptionId) external view returns (Subscription memory) {
        return subscriptions[subscriptionId];
    }

    /**
     * @dev Get all subscriptions for a subscriber
     * @param subscriber The subscriber address
     */
    function getSubscriberSubscriptions(address subscriber) external view returns (bytes32[] memory) {
        return subscriberSubscriptions[subscriber];
    }

    /**
     * @dev Get all subscriptions for a provider
     * @param provider The provider address
     */
    function getProviderSubscriptions(address provider) external view returns (bytes32[] memory) {
        return providerSubscriptions[provider];
    }

    /**
     * @dev Check if a payment is due
     * @param subscriptionId The subscription identifier
     */
    function isPaymentDue(bytes32 subscriptionId) external view returns (bool) {
        Subscription memory sub = subscriptions[subscriptionId];
        return sub.active && block.timestamp >= sub.nextPaymentDue;
    }
}

