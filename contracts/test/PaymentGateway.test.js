const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('PaymentGateway', function () {
  // Fixture for deployment
  async function deployPaymentGatewayFixture() {
    const [owner, payer, payee, other] = await ethers.getSigners();

    const PaymentGateway = await ethers.getContractFactory('PaymentGateway');
    const gateway = await PaymentGateway.deploy();

    // Deploy a mock ERC20 token for testing
    const MockERC20 = await ethers.getContractFactory('MockERC20');
    const token = await MockERC20.deploy('Mock Token', 'MTK', ethers.parseEther('1000000'));

    // Transfer some tokens to payer
    await token.transfer(payer.address, ethers.parseEther('10000'));

    return { gateway, token, owner, payer, payee, other };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { gateway, owner } = await loadFixture(deployPaymentGatewayFixture);
      expect(await gateway.owner()).to.equal(owner.address);
    });

    it('Should initialize with zero total paid and received', async function () {
      const { gateway, payer, payee } = await loadFixture(deployPaymentGatewayFixture);
      expect(await gateway.totalPaid(payer.address)).to.equal(0);
      expect(await gateway.totalReceived(payee.address)).to.equal(0);
    });
  });

  describe('Native Token Payments', function () {
    it('Should allow paying with native token', async function () {
      const { gateway, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('1.0');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      const tx = await gateway
        .connect(payer)
        .payNative(payee.address, requestHash, { value: amount });

      await expect(tx).to.emit(gateway, 'PaymentInitiated');

      // Check total paid increased
      expect(await gateway.totalPaid(payer.address)).to.equal(amount);
    });

    it('Should reject zero value payments', async function () {
      const { gateway, payer, payee } = await loadFixture(deployPaymentGatewayFixture);
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      await expect(
        gateway.connect(payer).payNative(payee.address, requestHash, { value: 0 })
      ).to.be.revertedWith('Payment amount must be greater than 0');
    });

    it('Should reject invalid payee address', async function () {
      const { gateway, payer } = await loadFixture(deployPaymentGatewayFixture);
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));
      const amount = ethers.parseEther('1.0');

      await expect(
        gateway.connect(payer).payNative(ethers.ZeroAddress, requestHash, { value: amount })
      ).to.be.revertedWith('Invalid payee address');
    });

    it('Should complete native token payment', async function () {
      const { gateway, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('1.0');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      // Initiate payment
      const tx = await gateway
        .connect(payer)
        .payNative(payee.address, requestHash, { value: amount });
      const receipt = await tx.wait();

      // Extract payment ID from event
      const event = receipt.logs.find((log) => {
        try {
          return gateway.interface.parseLog(log).name === 'PaymentInitiated';
        } catch (e) {
          return false;
        }
      });
      const paymentId = gateway.interface.parseLog(event).args[0];

      const payeeBalanceBefore = await ethers.provider.getBalance(payee.address);

      // Complete payment
      await expect(gateway.connect(payee).completePayment(paymentId))
        .to.emit(gateway, 'PaymentCompleted')
        .withArgs(paymentId, payer.address, payee.address, amount);

      // Check payee received funds
      const payeeBalanceAfter = await ethers.provider.getBalance(payee.address);
      expect(payeeBalanceAfter).to.be.gt(payeeBalanceBefore);

      // Check totalReceived updated
      expect(await gateway.totalReceived(payee.address)).to.equal(amount);

      // Check payment marked as completed
      const payment = await gateway.getPayment(paymentId);
      expect(payment.completed).to.be.true;
    });

    it('Should not allow completing payment twice', async function () {
      const { gateway, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('1.0');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      const tx = await gateway
        .connect(payer)
        .payNative(payee.address, requestHash, { value: amount });
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return gateway.interface.parseLog(log).name === 'PaymentInitiated';
        } catch (e) {
          return false;
        }
      });
      const paymentId = gateway.interface.parseLog(event).args[0];

      // Complete payment once
      await gateway.connect(payee).completePayment(paymentId);

      // Try to complete again
      await expect(gateway.connect(payee).completePayment(paymentId)).to.be.revertedWith(
        'Payment already completed'
      );
    });
  });

  describe('ERC20 Token Payments', function () {
    it('Should allow paying with ERC20 token', async function () {
      const { gateway, token, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('100');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      // Approve gateway to spend tokens
      await token.connect(payer).approve(gateway.target, amount);

      const tx = await gateway
        .connect(payer)
        .payToken(payee.address, token.target, amount, requestHash);

      await expect(tx).to.emit(gateway, 'PaymentInitiated');
      expect(await gateway.totalPaid(payer.address)).to.equal(amount);
    });

    it('Should reject ERC20 payment without approval', async function () {
      const { gateway, token, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('100');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      // Don't approve - should fail
      await expect(
        gateway.connect(payer).payToken(payee.address, token.target, amount, requestHash)
      ).to.be.reverted;
    });

    it('Should complete ERC20 payment', async function () {
      const { gateway, token, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('100');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      await token.connect(payer).approve(gateway.target, amount);
      const tx = await gateway
        .connect(payer)
        .payToken(payee.address, token.target, amount, requestHash);
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return gateway.interface.parseLog(log).name === 'PaymentInitiated';
        } catch (e) {
          return false;
        }
      });
      const paymentId = gateway.interface.parseLog(event).args[0];

      const payeeBalanceBefore = await token.balanceOf(payee.address);

      // Complete payment
      await gateway.connect(payee).completePayment(paymentId);

      // Check payee received tokens
      const payeeBalanceAfter = await token.balanceOf(payee.address);
      expect(payeeBalanceAfter - payeeBalanceBefore).to.equal(amount);
    });
  });

  describe('Payment Refunds', function () {
    it('Should allow owner to refund native payment', async function () {
      const { gateway, owner, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('1.0');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      const tx = await gateway
        .connect(payer)
        .payNative(payee.address, requestHash, { value: amount });
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return gateway.interface.parseLog(log).name === 'PaymentInitiated';
        } catch (e) {
          return false;
        }
      });
      const paymentId = gateway.interface.parseLog(event).args[0];

      const payerBalanceBefore = await ethers.provider.getBalance(payer.address);

      // Refund payment
      await expect(gateway.connect(owner).refundPayment(paymentId))
        .to.emit(gateway, 'PaymentRefunded')
        .withArgs(paymentId, payer.address, amount);

      // Check payer received refund
      const payerBalanceAfter = await ethers.provider.getBalance(payer.address);
      expect(payerBalanceAfter).to.be.gt(payerBalanceBefore);
    });

    it('Should not allow non-owner to refund', async function () {
      const { gateway, payer, payee, other } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('1.0');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      const tx = await gateway
        .connect(payer)
        .payNative(payee.address, requestHash, { value: amount });
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return gateway.interface.parseLog(log).name === 'PaymentInitiated';
        } catch (e) {
          return false;
        }
      });
      const paymentId = gateway.interface.parseLog(event).args[0];

      await expect(gateway.connect(other).refundPayment(paymentId)).to.be.revertedWithCustomError(
        gateway,
        'OwnableUnauthorizedAccount'
      );
    });

    it('Should not allow refunding completed payment', async function () {
      const { gateway, owner, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('1.0');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      const tx = await gateway
        .connect(payer)
        .payNative(payee.address, requestHash, { value: amount });
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return gateway.interface.parseLog(log).name === 'PaymentInitiated';
        } catch (e) {
          return false;
        }
      });
      const paymentId = gateway.interface.parseLog(event).args[0];

      // Complete payment first
      await gateway.connect(payee).completePayment(paymentId);

      // Try to refund
      await expect(gateway.connect(owner).refundPayment(paymentId)).to.be.revertedWith(
        'Payment already completed'
      );
    });
  });

  describe('Payment Queries', function () {
    it('Should return correct payment details', async function () {
      const { gateway, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('1.0');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      const tx = await gateway
        .connect(payer)
        .payNative(payee.address, requestHash, { value: amount });
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return gateway.interface.parseLog(log).name === 'PaymentInitiated';
        } catch (e) {
          return false;
        }
      });
      const paymentId = gateway.interface.parseLog(event).args[0];

      const payment = await gateway.getPayment(paymentId);

      expect(payment.payer).to.equal(payer.address);
      expect(payment.payee).to.equal(payee.address);
      expect(payment.amount).to.equal(amount);
      expect(payment.token).to.equal(ethers.ZeroAddress);
      expect(payment.requestHash).to.equal(requestHash);
      expect(payment.completed).to.be.false;
    });

    it('Should correctly report payment completion status', async function () {
      const { gateway, payer, payee } = await loadFixture(deployPaymentGatewayFixture);

      const amount = ethers.parseEther('1.0');
      const requestHash = ethers.keccak256(ethers.toUtf8Bytes('test-request'));

      const tx = await gateway
        .connect(payer)
        .payNative(payee.address, requestHash, { value: amount });
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return gateway.interface.parseLog(log).name === 'PaymentInitiated';
        } catch (e) {
          return false;
        }
      });
      const paymentId = gateway.interface.parseLog(event).args[0];

      // Before completion
      expect(await gateway.isPaymentCompleted(paymentId)).to.be.false;

      // Complete payment
      await gateway.connect(payee).completePayment(paymentId);

      // After completion
      expect(await gateway.isPaymentCompleted(paymentId)).to.be.true;
    });
  });
});

// Mock ERC20 contract for testing
const MockERC20Source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
`;

