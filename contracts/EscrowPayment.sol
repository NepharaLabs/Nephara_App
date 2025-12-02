// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EscrowPayment
 * @dev Manages milestone-based escrow payments for Luna402
 * Enables secure payments that are released upon milestone completion
 */
contract EscrowPayment is ReentrancyGuard {

    enum EscrowStatus {
        CREATED,
        FUNDED,
        IN_PROGRESS,
        COMPLETED,
        DISPUTED,
        REFUNDED,
        CANCELLED
    }

    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool paid;
    }

    struct Escrow {
        address payer;
        address payee;
        address arbiter; // Optional third-party arbiter
        uint256 totalAmount;
        address token; // address(0) for native token
        EscrowStatus status;
        uint256 createdAt;
        uint256 deadline; // Optional deadline
        Milestone[] milestones;
        uint256 totalReleased;
        uint256 currentMilestone;
    }

    // Escrow tracking
    mapping(bytes32 => Escrow) public escrows;
    mapping(address => bytes32[]) public payerEscrows;
    mapping(address => bytes32[]) public payeeEscrows;

    // Events
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 totalAmount,
        uint256 milestoneCount
    );

    event EscrowFunded(
        bytes32 indexed escrowId,
        uint256 amount
    );

    event MilestoneCompleted(
        bytes32 indexed escrowId,
        uint256 milestoneIndex,
        string description
    );

    event PaymentReleased(
        bytes32 indexed escrowId,
        uint256 milestoneIndex,
        uint256 amount,
        address indexed payee
    );

    event EscrowDisputed(
        bytes32 indexed escrowId,
        address indexed disputedBy
    );

    event DisputeResolved(
        bytes32 indexed escrowId,
        address indexed resolvedBy,
        bool releasedToPayee
    );

    event EscrowRefunded(
        bytes32 indexed escrowId,
        uint256 amount
    );

    event EscrowCancelled(
        bytes32 indexed escrowId
    );

    /**
     * @dev Create a new escrow agreement with milestones
     * @param payee The service provider who will receive payments
     * @param arbiter Optional third-party arbiter (use address(0) if not needed)
     * @param token Token address (address(0) for native token)
     * @param milestoneDescriptions Array of milestone descriptions
     * @param milestoneAmounts Array of amounts for each milestone
     * @param deadline Optional deadline timestamp (0 for no deadline)
     */
    function createEscrow(
        address payee,
        address arbiter,
        address token,
        string[] memory milestoneDescriptions,
        uint256[] memory milestoneAmounts,
        uint256 deadline
    ) external returns (bytes32) {
        require(payee != address(0), "Invalid payee address");
        require(milestoneDescriptions.length > 0, "At least one milestone required");
        require(milestoneDescriptions.length == milestoneAmounts.length, "Milestone data mismatch");
        require(milestoneDescriptions.length <= 50, "Too many milestones");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Milestone amount must be greater than 0");
            totalAmount += milestoneAmounts[i];
        }

        bytes32 escrowId = keccak256(
            abi.encodePacked(
                msg.sender,
                payee,
                totalAmount,
                block.timestamp
            )
        );

        require(escrows[escrowId].payer == address(0), "Escrow already exists");

        Escrow storage newEscrow = escrows[escrowId];
        newEscrow.payer = msg.sender;
        newEscrow.payee = payee;
        newEscrow.arbiter = arbiter;
        newEscrow.totalAmount = totalAmount;
        newEscrow.token = token;
        newEscrow.status = EscrowStatus.CREATED;
        newEscrow.createdAt = block.timestamp;
        newEscrow.deadline = deadline;
        newEscrow.totalReleased = 0;
        newEscrow.currentMilestone = 0;

        // Create milestones
        for (uint256 i = 0; i < milestoneDescriptions.length; i++) {
            newEscrow.milestones.push(Milestone({
                description: milestoneDescriptions[i],
                amount: milestoneAmounts[i],
                completed: false,
                paid: false
            }));
        }

        payerEscrows[msg.sender].push(escrowId);
        payeeEscrows[payee].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, payee, totalAmount, milestoneDescriptions.length);

        return escrowId;
    }

    /**
     * @dev Fund an escrow with native token
     * @param escrowId The escrow identifier
     */
    function fundEscrowNative(bytes32 escrowId) external payable nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer == msg.sender, "Only payer can fund escrow");
        require(escrow.status == EscrowStatus.CREATED, "Escrow already funded or completed");
        require(escrow.token == address(0), "This escrow requires ERC20 token");
        require(msg.value == escrow.totalAmount, "Incorrect funding amount");

        escrow.status = EscrowStatus.FUNDED;

        emit EscrowFunded(escrowId, msg.value);
    }

    /**
     * @dev Fund an escrow with ERC20 token
     * @param escrowId The escrow identifier
     */
    function fundEscrowToken(bytes32 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer == msg.sender, "Only payer can fund escrow");
        require(escrow.status == EscrowStatus.CREATED, "Escrow already funded or completed");
        require(escrow.token != address(0), "This escrow requires native token");

        IERC20(escrow.token).transferFrom(msg.sender, address(this), escrow.totalAmount);

        escrow.status = EscrowStatus.FUNDED;

        emit EscrowFunded(escrowId, escrow.totalAmount);
    }

    /**
     * @dev Mark a milestone as completed (called by payee)
     * @param escrowId The escrow identifier
     * @param milestoneIndex The milestone index
     */
    function completeMilestone(bytes32 escrowId, uint256 milestoneIndex) external {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payee == msg.sender, "Only payee can mark milestone complete");
        require(escrow.status == EscrowStatus.FUNDED || escrow.status == EscrowStatus.IN_PROGRESS, "Escrow not active");
        require(milestoneIndex < escrow.milestones.length, "Invalid milestone index");
        require(!escrow.milestones[milestoneIndex].completed, "Milestone already completed");
        require(milestoneIndex == escrow.currentMilestone, "Must complete milestones in order");

        escrow.milestones[milestoneIndex].completed = true;
        escrow.status = EscrowStatus.IN_PROGRESS;

        emit MilestoneCompleted(escrowId, milestoneIndex, escrow.milestones[milestoneIndex].description);
    }

    /**
     * @dev Release payment for a completed milestone (called by payer)
     * @param escrowId The escrow identifier
     * @param milestoneIndex The milestone index
     */
    function releaseMilestonePayment(bytes32 escrowId, uint256 milestoneIndex) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer == msg.sender, "Only payer can release payment");
        require(escrow.status == EscrowStatus.IN_PROGRESS || escrow.status == EscrowStatus.FUNDED, "Escrow not active");
        require(milestoneIndex < escrow.milestones.length, "Invalid milestone index");
        require(escrow.milestones[milestoneIndex].completed, "Milestone not completed");
        require(!escrow.milestones[milestoneIndex].paid, "Milestone already paid");

        Milestone storage milestone = escrow.milestones[milestoneIndex];
        milestone.paid = true;
        escrow.totalReleased += milestone.amount;
        escrow.currentMilestone++;

        // Transfer payment
        if (escrow.token == address(0)) {
            (bool success, ) = escrow.payee.call{value: milestone.amount}("");
            require(success, "Payment transfer failed");
        } else {
            IERC20(escrow.token).transfer(escrow.payee, milestone.amount);
        }

        // Check if all milestones are completed
        if (escrow.currentMilestone == escrow.milestones.length) {
            escrow.status = EscrowStatus.COMPLETED;
        }

        emit PaymentReleased(escrowId, milestoneIndex, milestone.amount, escrow.payee);
    }

    /**
     * @dev Raise a dispute
     * @param escrowId The escrow identifier
     */
    function disputeEscrow(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];

        require(msg.sender == escrow.payer || msg.sender == escrow.payee, "Only parties can dispute");
        require(escrow.status == EscrowStatus.IN_PROGRESS || escrow.status == EscrowStatus.FUNDED, "Cannot dispute this escrow");

        escrow.status = EscrowStatus.DISPUTED;

        emit EscrowDisputed(escrowId, msg.sender);
    }

    /**
     * @dev Resolve a dispute (called by arbiter)
     * @param escrowId The escrow identifier
     * @param releaseToPayee True to release remaining funds to payee, false to refund payer
     */
    function resolveDispute(bytes32 escrowId, bool releaseToPayee) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.arbiter != address(0), "No arbiter assigned");
        require(msg.sender == escrow.arbiter, "Only arbiter can resolve dispute");
        require(escrow.status == EscrowStatus.DISPUTED, "Escrow not disputed");

        uint256 remainingAmount = escrow.totalAmount - escrow.totalReleased;

        if (releaseToPayee) {
            // Release remaining funds to payee
            if (escrow.token == address(0)) {
                (bool success, ) = escrow.payee.call{value: remainingAmount}("");
                require(success, "Transfer to payee failed");
            } else {
                IERC20(escrow.token).transfer(escrow.payee, remainingAmount);
            }
            escrow.status = EscrowStatus.COMPLETED;
        } else {
            // Refund remaining funds to payer
            if (escrow.token == address(0)) {
                (bool success, ) = escrow.payer.call{value: remainingAmount}("");
                require(success, "Refund to payer failed");
            } else {
                IERC20(escrow.token).transfer(escrow.payer, remainingAmount);
            }
            escrow.status = EscrowStatus.REFUNDED;
        }

        emit DisputeResolved(escrowId, msg.sender, releaseToPayee);
    }

    /**
     * @dev Cancel unfunded escrow
     * @param escrowId The escrow identifier
     */
    function cancelEscrow(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];

        require(msg.sender == escrow.payer || msg.sender == escrow.payee, "Only parties can cancel");
        require(escrow.status == EscrowStatus.CREATED, "Can only cancel unfunded escrow");

        escrow.status = EscrowStatus.CANCELLED;

        emit EscrowCancelled(escrowId);
    }

    /**
     * @dev Get escrow details
     * @param escrowId The escrow identifier
     */
    function getEscrow(bytes32 escrowId) external view returns (
        address payer,
        address payee,
        address arbiter,
        uint256 totalAmount,
        address token,
        EscrowStatus status,
        uint256 totalReleased,
        uint256 milestoneCount
    ) {
        Escrow memory escrow = escrows[escrowId];
        return (
            escrow.payer,
            escrow.payee,
            escrow.arbiter,
            escrow.totalAmount,
            escrow.token,
            escrow.status,
            escrow.totalReleased,
            escrow.milestones.length
        );
    }

    /**
     * @dev Get milestone details
     * @param escrowId The escrow identifier
     * @param milestoneIndex The milestone index
     */
    function getMilestone(bytes32 escrowId, uint256 milestoneIndex) external view returns (
        string memory description,
        uint256 amount,
        bool completed,
        bool paid
    ) {
        require(milestoneIndex < escrows[escrowId].milestones.length, "Invalid milestone index");
        Milestone memory milestone = escrows[escrowId].milestones[milestoneIndex];
        return (milestone.description, milestone.amount, milestone.completed, milestone.paid);
    }

    /**
     * @dev Get all escrows for a payer
     * @param payer The payer address
     */
    function getPayerEscrows(address payer) external view returns (bytes32[] memory) {
        return payerEscrows[payer];
    }

    /**
     * @dev Get all escrows for a payee
     * @param payee The payee address
     */
    function getPayeeEscrows(address payee) external view returns (bytes32[] memory) {
        return payeeEscrows[payee];
    }
}
