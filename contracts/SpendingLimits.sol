// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SpendingLimits
 * @dev Manages spending limits for Luna402 autonomous payments
 * Allows users to set daily/weekly/monthly limits for AI spending
 */
contract SpendingLimits is Ownable {

    struct Limit {
        uint256 dailyLimit;
        uint256 weeklyLimit;
        uint256 monthlyLimit;
        uint256 dailySpent;
        uint256 weeklySpent;
        uint256 monthlySpent;
        uint256 lastDailyReset;
        uint256 lastWeeklyReset;
        uint256 lastMonthlyReset;
        bool active;
    }

    // User address => Limit configuration
    mapping(address => Limit) public limits;

    // Approved spenders (AI agents/contracts that can spend on behalf of users)
    mapping(address => mapping(address => bool)) public approvedSpenders;

    // Events
    event LimitSet(
        address indexed user,
        uint256 dailyLimit,
        uint256 weeklyLimit,
        uint256 monthlyLimit
    );

    event SpendingRecorded(
        address indexed user,
        address indexed spender,
        uint256 amount,
        uint256 timestamp
    );

    event SpenderApproved(address indexed user, address indexed spender);
    event SpenderRevoked(address indexed user, address indexed spender);
    event LimitActivated(address indexed user);
    event LimitDeactivated(address indexed user);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Set spending limits for a user
     * @param dailyLimit Maximum spending per day (in wei)
     * @param weeklyLimit Maximum spending per week (in wei)
     * @param monthlyLimit Maximum spending per month (in wei)
     */
    function setLimits(
        uint256 dailyLimit,
        uint256 weeklyLimit,
        uint256 monthlyLimit
    ) external {
        require(weeklyLimit >= dailyLimit, "Weekly limit must be >= daily limit");
        require(monthlyLimit >= weeklyLimit, "Monthly limit must be >= weekly limit");

        Limit storage limit = limits[msg.sender];

        if (limit.lastDailyReset == 0) {
            // First time setting limits
            limit.lastDailyReset = block.timestamp;
            limit.lastWeeklyReset = block.timestamp;
            limit.lastMonthlyReset = block.timestamp;
        }

        limit.dailyLimit = dailyLimit;
        limit.weeklyLimit = weeklyLimit;
        limit.monthlyLimit = monthlyLimit;
        limit.active = true;

        emit LimitSet(msg.sender, dailyLimit, weeklyLimit, monthlyLimit);
    }

    /**
     * @dev Approve a spender (AI agent/contract) to spend on behalf of user
     * @param spender Address of the approved spender
     */
    function approveSpender(address spender) external {
        require(spender != address(0), "Invalid spender address");
        approvedSpenders[msg.sender][spender] = true;
        emit SpenderApproved(msg.sender, spender);
    }

    /**
     * @dev Revoke spender approval
     * @param spender Address of the spender to revoke
     */
    function revokeSpender(address spender) external {
        approvedSpenders[msg.sender][spender] = false;
        emit SpenderRevoked(msg.sender, spender);
    }

    /**
     * @dev Check if spending is allowed and record it
     * @param user The user whose limit to check
     * @param amount The amount to spend
     */
    function recordSpending(address user, uint256 amount) external returns (bool) {
        require(approvedSpenders[user][msg.sender], "Spender not approved");

        Limit storage limit = limits[user];
        require(limit.active, "Spending limits not active");

        // Reset counters if time periods have passed
        _resetLimitsIfNeeded(limit);

        // Check if spending would exceed limits
        require(
            limit.dailySpent + amount <= limit.dailyLimit,
            "Daily spending limit exceeded"
        );
        require(
            limit.weeklySpent + amount <= limit.weeklyLimit,
            "Weekly spending limit exceeded"
        );
        require(
            limit.monthlySpent + amount <= limit.monthlyLimit,
            "Monthly spending limit exceeded"
        );

        // Record spending
        limit.dailySpent += amount;
        limit.weeklySpent += amount;
        limit.monthlySpent += amount;

        emit SpendingRecorded(user, msg.sender, amount, block.timestamp);

        return true;
    }

    /**
     * @dev Check remaining spending allowance
     * @param user The user to check
     */
    function getRemainingAllowance(address user)
        external
        view
        returns (uint256 daily, uint256 weekly, uint256 monthly)
    {
        Limit storage limit = limits[user];

        if (!limit.active) {
            return (0, 0, 0);
        }

        // Calculate time-adjusted remaining amounts
        uint256 dailyRemaining = _getDailyRemaining(limit);
        uint256 weeklyRemaining = _getWeeklyRemaining(limit);
        uint256 monthlyRemaining = _getMonthlyRemaining(limit);

        return (dailyRemaining, weeklyRemaining, monthlyRemaining);
    }

    /**
     * @dev Get limit configuration for a user
     * @param user The user address
     */
    function getLimit(address user) external view returns (Limit memory) {
        return limits[user];
    }

    /**
     * @dev Activate spending limits
     */
    function activateLimits() external {
        limits[msg.sender].active = true;
        emit LimitActivated(msg.sender);
    }

    /**
     * @dev Deactivate spending limits
     */
    function deactivateLimits() external {
        limits[msg.sender].active = false;
        emit LimitDeactivated(msg.sender);
    }

    // Internal functions

    function _resetLimitsIfNeeded(Limit storage limit) internal {
        // Reset daily (24 hours)
        if (block.timestamp >= limit.lastDailyReset + 1 days) {
            limit.dailySpent = 0;
            limit.lastDailyReset = block.timestamp;
        }

        // Reset weekly (7 days)
        if (block.timestamp >= limit.lastWeeklyReset + 7 days) {
            limit.weeklySpent = 0;
            limit.lastWeeklyReset = block.timestamp;
        }

        // Reset monthly (30 days)
        if (block.timestamp >= limit.lastMonthlyReset + 30 days) {
            limit.monthlySpent = 0;
            limit.lastMonthlyReset = block.timestamp;
        }
    }

    function _getDailyRemaining(Limit storage limit) internal view returns (uint256) {
        if (block.timestamp >= limit.lastDailyReset + 1 days) {
            return limit.dailyLimit;
        }
        return limit.dailyLimit > limit.dailySpent ? limit.dailyLimit - limit.dailySpent : 0;
    }

    function _getWeeklyRemaining(Limit storage limit) internal view returns (uint256) {
        if (block.timestamp >= limit.lastWeeklyReset + 7 days) {
            return limit.weeklyLimit;
        }
        return limit.weeklyLimit > limit.weeklySpent ? limit.weeklyLimit - limit.weeklySpent : 0;
    }

    function _getMonthlyRemaining(Limit storage limit) internal view returns (uint256) {
        if (block.timestamp >= limit.lastMonthlyReset + 30 days) {
            return limit.monthlyLimit;
        }
        return limit.monthlyLimit > limit.monthlySpent ? limit.monthlyLimit - limit.monthlySpent : 0;
    }
}
