const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');

describe('SpendingLimits', function () {
  async function deploySpendingLimitsFixture() {
    const [owner, user, spender, otherSpender, other] = await ethers.getSigners();

    const SpendingLimits = await ethers.getContractFactory('SpendingLimits');
    const limits = await SpendingLimits.deploy();

    return { limits, owner, user, spender, otherSpender, other };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { limits, owner } = await loadFixture(deploySpendingLimitsFixture);
      expect(await limits.owner()).to.equal(owner.address);
    });
  });

  describe('Setting Limits', function () {
    it('Should allow user to set spending limits', async function () {
      const { limits, user } = await loadFixture(deploySpendingLimitsFixture);

      const daily = ethers.parseEther('10');
      const weekly = ethers.parseEther('50');
      const monthly = ethers.parseEther('200');

      await expect(limits.connect(user).setLimits(daily, weekly, monthly))
        .to.emit(limits, 'LimitSet')
        .withArgs(user.address, daily, weekly, monthly);

      const limit = await limits.getLimit(user.address);
      expect(limit.dailyLimit).to.equal(daily);
      expect(limit.weeklyLimit).to.equal(weekly);
      expect(limit.monthlyLimit).to.equal(monthly);
      expect(limit.active).to.be.true;
    });

    it('Should reject invalid limit hierarchy', async function () {
      const { limits, user } = await loadFixture(deploySpendingLimitsFixture);

      const daily = ethers.parseEther('100');
      const weekly = ethers.parseEther('50'); // Less than daily
      const monthly = ethers.parseEther('200');

      await expect(limits.connect(user).setLimits(daily, weekly, monthly)).to.be.revertedWith(
        'Weekly limit must be >= daily limit'
      );
    });

    it('Should reject invalid monthly limit', async function () {
      const { limits, user } = await loadFixture(deploySpendingLimitsFixture);

      const daily = ethers.parseEther('10');
      const weekly = ethers.parseEther('50');
      const monthly = ethers.parseEther('30'); // Less than weekly

      await expect(limits.connect(user).setLimits(daily, weekly, monthly)).to.be.revertedWith(
        'Monthly limit must be >= weekly limit'
      );
    });

    it('Should allow updating limits', async function () {
      const { limits, user } = await loadFixture(deploySpendingLimitsFixture);

      // Set initial limits
      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));

      // Update limits
      const newDaily = ethers.parseEther('20');
      const newWeekly = ethers.parseEther('100');
      const newMonthly = ethers.parseEther('400');

      await limits.connect(user).setLimits(newDaily, newWeekly, newMonthly);

      const limit = await limits.getLimit(user.address);
      expect(limit.dailyLimit).to.equal(newDaily);
      expect(limit.weeklyLimit).to.equal(newWeekly);
      expect(limit.monthlyLimit).to.equal(newMonthly);
    });
  });

  describe('Spender Management', function () {
    it('Should allow approving a spender', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await expect(limits.connect(user).approveSpender(spender.address))
        .to.emit(limits, 'SpenderApproved')
        .withArgs(user.address, spender.address);

      expect(await limits.approvedSpenders(user.address, spender.address)).to.be.true;
    });

    it('Should allow revoking a spender', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      // Approve first
      await limits.connect(user).approveSpender(spender.address);

      // Then revoke
      await expect(limits.connect(user).revokeSpender(spender.address))
        .to.emit(limits, 'SpenderRevoked')
        .withArgs(user.address, spender.address);

      expect(await limits.approvedSpenders(user.address, spender.address)).to.be.false;
    });

    it('Should reject zero address as spender', async function () {
      const { limits, user } = await loadFixture(deploySpendingLimitsFixture);

      await expect(limits.connect(user).approveSpender(ethers.ZeroAddress)).to.be.revertedWith(
        'Invalid spender address'
      );
    });
  });

  describe('Recording Spending', function () {
    it('Should allow approved spender to record spending', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      // Set limits
      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));

      // Approve spender
      await limits.connect(user).approveSpender(spender.address);

      const amount = ethers.parseEther('5');

      await expect(limits.connect(spender).recordSpending(user.address, amount)).to.emit(
        limits,
        'SpendingRecorded'
      );

      const limit = await limits.getLimit(user.address);
      expect(limit.dailySpent).to.equal(amount);
      expect(limit.weeklySpent).to.equal(amount);
      expect(limit.monthlySpent).to.equal(amount);
    });

    it('Should reject spending from unapproved spender', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));

      const amount = ethers.parseEther('5');

      await expect(limits.connect(spender).recordSpending(user.address, amount)).to.be.revertedWith(
        'Spender not approved'
      );
    });

    it('Should reject spending when limits not active', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));
      await limits.connect(user).approveSpender(spender.address);

      // Deactivate limits
      await limits.connect(user).deactivateLimits();

      const amount = ethers.parseEther('5');

      await expect(limits.connect(spender).recordSpending(user.address, amount)).to.be.revertedWith(
        'Spending limits not active'
      );
    });

    it('Should reject spending exceeding daily limit', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));
      await limits.connect(user).approveSpender(spender.address);

      const amount = ethers.parseEther('15'); // Exceeds daily limit

      await expect(limits.connect(spender).recordSpending(user.address, amount)).to.be.revertedWith(
        'Daily spending limit exceeded'
      );
    });

    it('Should reject spending exceeding weekly limit', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('20'), ethers.parseEther('50'), ethers.parseEther('200'));
      await limits.connect(user).approveSpender(spender.address);

      // Spend multiple times
      await limits.connect(spender).recordSpending(user.address, ethers.parseEther('20'));
      await limits.connect(spender).recordSpending(user.address, ethers.parseEther('20'));

      // This should exceed weekly limit
      await expect(
        limits.connect(spender).recordSpending(user.address, ethers.parseEther('20'))
      ).to.be.revertedWith('Weekly spending limit exceeded');
    });

    it('Should accumulate spending correctly', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('100'), ethers.parseEther('500'), ethers.parseEther('2000'));
      await limits.connect(user).approveSpender(spender.address);

      const amount1 = ethers.parseEther('30');
      const amount2 = ethers.parseEther('40');
      const amount3 = ethers.parseEther('20');

      await limits.connect(spender).recordSpending(user.address, amount1);
      await limits.connect(spender).recordSpending(user.address, amount2);
      await limits.connect(spender).recordSpending(user.address, amount3);

      const limit = await limits.getLimit(user.address);
      const totalSpent = amount1 + amount2 + amount3;

      expect(limit.dailySpent).to.equal(totalSpent);
      expect(limit.weeklySpent).to.equal(totalSpent);
      expect(limit.monthlySpent).to.equal(totalSpent);
    });
  });

  describe('Limit Resets', function () {
    it('Should reset daily limit after 24 hours', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));
      await limits.connect(user).approveSpender(spender.address);

      // Spend up to daily limit
      await limits.connect(spender).recordSpending(user.address, ethers.parseEther('10'));

      // Fast forward 24 hours
      await time.increase(24 * 60 * 60 + 1);

      // Should be able to spend again
      await expect(limits.connect(spender).recordSpending(user.address, ethers.parseEther('10'))).to
        .not.be.reverted;

      const limit = await limits.getLimit(user.address);
      expect(limit.dailySpent).to.equal(ethers.parseEther('10'));
      expect(limit.weeklySpent).to.equal(ethers.parseEther('20'));
    });

    it('Should reset weekly limit after 7 days', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('20'), ethers.parseEther('50'), ethers.parseEther('200'));
      await limits.connect(user).approveSpender(spender.address);

      // Spend near weekly limit
      await limits.connect(spender).recordSpending(user.address, ethers.parseEther('20'));
      await limits.connect(spender).recordSpending(user.address, ethers.parseEther('20'));

      // Fast forward 7 days
      await time.increase(7 * 24 * 60 * 60 + 1);

      // Should be able to spend again
      await expect(limits.connect(spender).recordSpending(user.address, ethers.parseEther('20'))).to
        .not.be.reverted;
    });

    it('Should reset monthly limit after 30 days', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('100'), ethers.parseEther('500'), ethers.parseEther('1000'));
      await limits.connect(user).approveSpender(spender.address);

      // Spend a lot
      await limits.connect(spender).recordSpending(user.address, ethers.parseEther('900'));

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60 + 1);

      // Should be able to spend again
      await expect(limits.connect(spender).recordSpending(user.address, ethers.parseEther('100')))
        .to.not.be.reverted;
    });
  });

  describe('Remaining Allowance', function () {
    it('Should return correct remaining allowance', async function () {
      const { limits, user, spender } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));
      await limits.connect(user).approveSpender(spender.address);

      await limits.connect(spender).recordSpending(user.address, ethers.parseEther('3'));

      const [daily, weekly, monthly] = await limits.getRemainingAllowance(user.address);

      expect(daily).to.equal(ethers.parseEther('7'));
      expect(weekly).to.equal(ethers.parseEther('47'));
      expect(monthly).to.equal(ethers.parseEther('197'));
    });

    it('Should return zero when limits not active', async function () {
      const { limits, user } = await loadFixture(deploySpendingLimitsFixture);

      const [daily, weekly, monthly] = await limits.getRemainingAllowance(user.address);

      expect(daily).to.equal(0);
      expect(weekly).to.equal(0);
      expect(monthly).to.equal(0);
    });
  });

  describe('Activate/Deactivate', function () {
    it('Should allow activating limits', async function () {
      const { limits, user } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));

      await limits.connect(user).deactivateLimits();

      await expect(limits.connect(user).activateLimits())
        .to.emit(limits, 'LimitActivated')
        .withArgs(user.address);

      const limit = await limits.getLimit(user.address);
      expect(limit.active).to.be.true;
    });

    it('Should allow deactivating limits', async function () {
      const { limits, user } = await loadFixture(deploySpendingLimitsFixture);

      await limits
        .connect(user)
        .setLimits(ethers.parseEther('10'), ethers.parseEther('50'), ethers.parseEther('200'));

      await expect(limits.connect(user).deactivateLimits())
        .to.emit(limits, 'LimitDeactivated')
        .withArgs(user.address);

      const limit = await limits.getLimit(user.address);
      expect(limit.active).to.be.false;
    });
  });
});
