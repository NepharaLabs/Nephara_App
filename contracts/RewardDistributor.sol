// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardDistributor
 * @dev Distributes rewards to $LUNA holders and platform users
 * Supports staking rewards, usage rewards, and referral bonuses
 */
contract RewardDistributor is ReentrancyGuard, Ownable {

    IERC20 public immutable lunaToken;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastClaimAt;
        uint256 totalClaimed;
    }

    struct RewardPool {
        uint256 totalRewards;
        uint256 rewardRate; // Rewards per second per token
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
    }

    // Staking
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    RewardPool public stakingPool;

    // Usage rewards
    mapping(address => uint256) public usageRewards;
    mapping(address => uint256) public totalUsageRewards;
    uint256 public usageRewardRate = 100; // 1% of payment as reward

    // Referral system
    mapping(address => address) public referrers;
    mapping(address => uint256) public referralRewards;
    mapping(address => uint256) public totalReferrals;
    uint256 public referralBonusRate = 500; // 5% bonus

    // Constants
    uint256 public constant RATE_DIVISOR = 10000;
    uint256 public constant MIN_STAKE_DURATION = 7 days;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event UsageRewardAdded(address indexed user, uint256 amount);
    event ReferralSet(address indexed user, address indexed referrer);
    event ReferralRewardAdded(address indexed referrer, uint256 amount);

    constructor(address _lunaToken) Ownable(msg.sender) {
        require(_lunaToken != address(0), "Invalid token");
        lunaToken = IERC20(_lunaToken);

        stakingPool.lastUpdateTime = block.timestamp;
        stakingPool.rewardRate = 1e15; // Initial rate: 0.001 tokens per second per staked token
    }

    /**
     * @dev Stake $LUNA tokens to earn rewards
     * @param amount Amount to stake
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");

        updateRewardPool();

        StakeInfo storage userStake = stakes[msg.sender];

        // Claim pending rewards if user has existing stake
        if (userStake.amount > 0) {
            uint256 pending = calculateStakingReward(msg.sender);
            if (pending > 0) {
                userStake.totalClaimed += pending;
                emit RewardClaimed(msg.sender, pending);
            }
        }

        // Transfer tokens from user
        require(lunaToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Update stake info
        userStake.amount += amount;
        userStake.stakedAt = block.timestamp;
        userStake.lastClaimAt = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake $LUNA tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");
        require(block.timestamp >= userStake.stakedAt + MIN_STAKE_DURATION, "Stake locked");

        updateRewardPool();

        // Claim all pending rewards
        uint256 pending = calculateStakingReward(msg.sender);
        if (pending > 0) {
            userStake.totalClaimed += pending;
            emit RewardClaimed(msg.sender, pending);
        }

        // Update stake
        userStake.amount -= amount;
        totalStaked -= amount;

        // Transfer tokens back to user
        require(lunaToken.transfer(msg.sender, amount), "Transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() external nonReentrant {
        updateRewardPool();

        uint256 reward = calculateStakingReward(msg.sender);
        require(reward > 0, "No rewards to claim");

        StakeInfo storage userStake = stakes[msg.sender];
        userStake.lastClaimAt = block.timestamp;
        userStake.totalClaimed += reward;

        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @dev Add usage reward for user (called by payment system)
     * @param user User to reward
     * @param paymentAmount Amount of payment made
     */
    function addUsageReward(address user, uint256 paymentAmount) external {
        uint256 reward = (paymentAmount * usageRewardRate) / RATE_DIVISOR;

        usageRewards[user] += reward;
        totalUsageRewards[user] += reward;

        emit UsageRewardAdded(user, reward);

        // Add referral bonus if applicable
        address referrer = referrers[user];
        if (referrer != address(0)) {
            uint256 referralBonus = (reward * referralBonusRate) / RATE_DIVISOR;
            referralRewards[referrer] += referralBonus;
            emit ReferralRewardAdded(referrer, referralBonus);
        }
    }

    /**
     * @dev Claim usage rewards
     */
    function claimUsageRewards() external nonReentrant {
        uint256 reward = usageRewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        usageRewards[msg.sender] = 0;

        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @dev Claim referral rewards
     */
    function claimReferralRewards() external nonReentrant {
        uint256 reward = referralRewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        referralRewards[msg.sender] = 0;

        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @dev Set referrer for a user (can only be set once)
     * @param referrer Referrer address
     */
    function setReferrer(address referrer) external {
        require(referrers[msg.sender] == address(0), "Referrer already set");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(referrer != address(0), "Invalid referrer");

        referrers[msg.sender] = referrer;
        totalReferrals[referrer]++;

        emit ReferralSet(msg.sender, referrer);
    }

    /**
     * @dev Calculate staking rewards for a user
     * @param user User address
     */
    function calculateStakingReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 duration = block.timestamp - userStake.lastClaimAt;
        uint256 reward = (userStake.amount * stakingPool.rewardRate * duration) / 1e18;

        return reward;
    }

    /**
     * @dev Update reward pool calculations
     */
    function updateRewardPool() internal {
        stakingPool.lastUpdateTime = block.timestamp;

        if (totalStaked > 0) {
            uint256 timeDelta = block.timestamp - stakingPool.lastUpdateTime;
            stakingPool.rewardPerTokenStored += (stakingPool.rewardRate * timeDelta * 1e18) / totalStaked;
        }
    }

    /**
     * @dev Update staking reward rate (owner only)
     * @param newRate New reward rate
     */
    function updateStakingRewardRate(uint256 newRate) external onlyOwner {
        updateRewardPool();
        stakingPool.rewardRate = newRate;
    }

    /**
     * @dev Update usage reward rate (owner only)
     * @param newRate New usage reward rate
     */
    function updateUsageRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Rate too high"); // Max 10%
        usageRewardRate = newRate;
    }

    /**
     * @dev Update referral bonus rate (owner only)
     * @param newRate New referral bonus rate
     */
    function updateReferralBonusRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Rate too high"); // Max 10%
        referralBonusRate = newRate;
    }

    /**
     * @dev Fund reward pool (owner only)
     * @param amount Amount to add
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(lunaToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        stakingPool.totalRewards += amount;
    }

    /**
     * @dev Get user's total claimable rewards
     * @param user User address
     */
    function getTotalClaimableRewards(address user) external view returns (
        uint256 stakingRewards,
        uint256 usageRewardsAmount,
        uint256 referralRewardsAmount,
        uint256 totalClaimable
    ) {
        stakingRewards = calculateStakingReward(user);
        usageRewardsAmount = usageRewards[user];
        referralRewardsAmount = referralRewards[user];
        totalClaimable = stakingRewards + usageRewardsAmount + referralRewardsAmount;

        return (stakingRewards, usageRewardsAmount, referralRewardsAmount, totalClaimable);
    }

    /**
     * @dev Get user's staking info
     * @param user User address
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 stakedAt,
        uint256 lastClaimAt,
        uint256 totalClaimed,
        uint256 pendingRewards
    ) {
        StakeInfo memory userStake = stakes[user];
        return (
            userStake.amount,
            userStake.stakedAt,
            userStake.lastClaimAt,
            userStake.totalClaimed,
            calculateStakingReward(user)
        );
    }
}
