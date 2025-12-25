// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PaymentSplitter
 * @dev Splits incoming payments among multiple recipients based on shares
 * Designed for NECRORALabs ($NECRORA) and x402-based revenue flows:
 * useful for revenue sharing, team payments, and multi-party settlements.
 */
contract PaymentSplitter is ReentrancyGuard {

    struct Split {
        address[] recipients;
        uint256[] shares;
        uint256 totalShares;
        bool active;
    }

    struct RecipientInfo {
        uint256 totalReceived;
        uint256 pendingWithdrawal;
    }

    // Split configurations
    mapping(bytes32 => Split) public splits;
    mapping(bytes32 => mapping(address => RecipientInfo)) public recipientInfo;
    mapping(bytes32 => mapping(address => mapping(address => uint256))) public pendingTokenWithdrawals; // splitId => token => recipient => amount

    // Events
    event SplitCreated(
        bytes32 indexed splitId,
        address indexed creator,
        address[] recipients,
        uint256[] shares
    );

    event PaymentReceived(
        bytes32 indexed splitId,
        address indexed from,
        uint256 amount,
        address token
    );

    event PaymentDistributed(
        bytes32 indexed splitId,
        address indexed recipient,
        uint256 amount,
        address token
    );

    event Withdrawn(
        bytes32 indexed splitId,
        address indexed recipient,
        uint256 amount,
        address token
    );

    event SplitUpdated(
        bytes32 indexed splitId,
        address[] recipients,
        uint256[] shares
    );

    /**
     * @dev Create a new payment split
     * @param recipients Array of recipient addresses
     * @param shares Array of shares for each recipient (proportional, not percentages)
     */
    function createSplit(
        address[] memory recipients,
        uint256[] memory shares
    ) external returns (bytes32) {
        require(recipients.length > 0, "At least one recipient required");
        require(recipients.length == shares.length, "Recipients and shares length mismatch");
        require(recipients.length <= 100, "Too many recipients");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(shares[i] > 0, "Share must be greater than 0");
            totalShares += shares[i];
        }

        require(totalShares > 0, "Total shares must be greater than 0");

        bytes32 splitId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipients,
                shares,
                block.timestamp
            )
        );

        require(splits[splitId].totalShares == 0, "Split already exists");

        splits[splitId] = Split({
            recipients: recipients,
            shares: shares,
            totalShares: totalShares,
            active: true
        });

        emit SplitCreated(splitId, msg.sender, recipients, shares);

        return splitId;
    }

    /**
     * @dev Send a payment to be split among recipients (native token)
     * @param splitId The split configuration identifier
     */
    function sendPaymentNative(bytes32 splitId) external payable nonReentrant {
        require(msg.value > 0, "Payment amount must be greater than 0");

        Split storage split = splits[splitId];
        require(split.active, "Split is not active");

        emit PaymentReceived(splitId, msg.sender, msg.value, address(0));

        // Distribute payment according to shares
        uint256 totalDistributed = 0;

        for (uint256 i = 0; i < split.recipients.length; i++) {
            uint256 recipientAmount;

            // Give remainder to last recipient to avoid dust
            if (i == split.recipients.length - 1) {
                recipientAmount = msg.value - totalDistributed;
            } else {
                recipientAmount = (msg.value * split.shares[i]) / split.totalShares;
            }

            address recipient = split.recipients[i];
            recipientInfo[splitId][recipient].pendingWithdrawal += recipientAmount;
            recipientInfo[splitId][recipient].totalReceived += recipientAmount;
            totalDistributed += recipientAmount;

            emit PaymentDistributed(splitId, recipient, recipientAmount, address(0));
        }
    }

    /**
     * @dev Send a payment to be split among recipients (ERC20 token)
     * @param splitId The split configuration identifier
     * @param token The ERC20 token address
     * @param amount The amount to split
     */
    function sendPaymentToken(
        bytes32 splitId,
        address token,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Payment amount must be greater than 0");
        require(token != address(0), "Invalid token address");

        Split storage split = splits[splitId];
        require(split.active, "Split is not active");

        // Transfer tokens from sender to contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        emit PaymentReceived(splitId, msg.sender, amount, token);

        // Distribute payment according to shares
        uint256 totalDistributed = 0;

        for (uint256 i = 0; i < split.recipients.length; i++) {
            uint256 recipientAmount;

            // Give remainder to last recipient to avoid dust
            if (i == split.recipients.length - 1) {
                recipientAmount = amount - totalDistributed;
            } else {
                recipientAmount = (amount * split.shares[i]) / split.totalShares;
            }

            address recipient = split.recipients[i];
            pendingTokenWithdrawals[splitId][token][recipient] += recipientAmount;
            totalDistributed += recipientAmount;

            emit PaymentDistributed(splitId, recipient, recipientAmount, token);
        }
    }

    /**
     * @dev Withdraw pending native token payments
     * @param splitId The split configuration identifier
     */
    function withdrawNative(bytes32 splitId) external nonReentrant {
        uint256 amount = recipientInfo[splitId][msg.sender].pendingWithdrawal;
        require(amount > 0, "No pending withdrawal");

        recipientInfo[splitId][msg.sender].pendingWithdrawal = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawn(splitId, msg.sender, amount, address(0));
    }

    /**
     * @dev Withdraw pending ERC20 token payments
     * @param splitId The split configuration identifier
     * @param token The ERC20 token address
     */
    function withdrawToken(bytes32 splitId, address token) external nonReentrant {
        require(token != address(0), "Invalid token address");

        uint256 amount = pendingTokenWithdrawals[splitId][token][msg.sender];
        require(amount > 0, "No pending withdrawal");

        pendingTokenWithdrawals[splitId][token][msg.sender] = 0;

        IERC20(token).transfer(msg.sender, amount);

        emit Withdrawn(splitId, msg.sender, amount, token);
    }

    /**
     * @dev Update split configuration (only for testing - in production this should be more restricted)
     * @param splitId The split configuration identifier
     * @param recipients New array of recipient addresses
     * @param shares New array of shares for each recipient
     */
    function updateSplit(
        bytes32 splitId,
        address[] memory recipients,
        uint256[] memory shares
    ) external {
        Split storage split = splits[splitId];
        require(split.active, "Split does not exist or is inactive");
        require(recipients.length > 0, "At least one recipient required");
        require(recipients.length == shares.length, "Recipients and shares length mismatch");
        require(recipients.length <= 100, "Too many recipients");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(shares[i] > 0, "Share must be greater than 0");
            totalShares += shares[i];
        }

        split.recipients = recipients;
        split.shares = shares;
        split.totalShares = totalShares;

        emit SplitUpdated(splitId, recipients, shares);
    }

    /**
     * @dev Deactivate a split
     * @param splitId The split configuration identifier
     */
    function deactivateSplit(bytes32 splitId) external {
        Split storage split = splits[splitId];
        require(split.active, "Split already inactive");

        split.active = false;
    }

    /**
     * @dev Get split details
     * @param splitId The split configuration identifier
     */
    function getSplit(bytes32 splitId) external view returns (
        address[] memory recipients,
        uint256[] memory shares,
        uint256 totalShares,
        bool active
    ) {
        Split memory split = splits[splitId];
        return (split.recipients, split.shares, split.totalShares, split.active);
    }

    /**
     * @dev Get pending withdrawal amount for native token
     * @param splitId The split configuration identifier
     * @param recipient The recipient address
     */
    function getPendingWithdrawal(bytes32 splitId, address recipient) external view returns (uint256) {
        return recipientInfo[splitId][recipient].pendingWithdrawal;
    }

    /**
     * @dev Get pending withdrawal amount for ERC20 token
     * @param splitId The split configuration identifier
     * @param token The ERC20 token address
     * @param recipient The recipient address
     */
    function getPendingTokenWithdrawal(
        bytes32 splitId,
        address token,
        address recipient
    ) external view returns (uint256) {
        return pendingTokenWithdrawals[splitId][token][recipient];
    }

    /**
     * @dev Get total received by a recipient
     * @param splitId The split configuration identifier
     * @param recipient The recipient address
     */
    function getTotalReceived(bytes32 splitId, address recipient) external view returns (uint256) {
        return recipientInfo[splitId][recipient].totalReceived;
    }

    /**
     * @dev Calculate share percentage (in basis points, 10000 = 100%)
     * @param splitId The split configuration identifier
     * @param recipient The recipient address
     */
    function getSharePercentage(bytes32 splitId, address recipient) external view returns (uint256) {
        Split memory split = splits[splitId];

        for (uint256 i = 0; i < split.recipients.length; i++) {
            if (split.recipients[i] == recipient) {
                return (split.shares[i] * 10000) / split.totalShares;
            }
        }

        return 0;
    }
}
