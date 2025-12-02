// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PaymentStreaming
 * @dev Enables continuous payment flows over time for Luna402
 * Useful for real-time compensation, per-second billing, and continuous service payments
 */
contract PaymentStreaming is ReentrancyGuard {

    struct Stream {
        address sender;
        address recipient;
        uint256 deposit;
        address token; // address(0) for native token
        uint256 startTime;
        uint256 stopTime;
        uint256 ratePerSecond;
        uint256 remainingBalance;
        bool active;
        uint256 lastWithdrawal;
    }

    // Stream tracking
    mapping(bytes32 => Stream) public streams;
    mapping(address => bytes32[]) public senderStreams;
    mapping(address => bytes32[]) public recipientStreams;

    // Events
    event StreamCreated(
        bytes32 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 deposit,
        uint256 startTime,
        uint256 stopTime,
        uint256 ratePerSecond
    );

    event StreamWithdrawn(
        bytes32 indexed streamId,
        address indexed recipient,
        uint256 amount
    );

    event StreamCancelled(
        bytes32 indexed streamId,
        uint256 senderBalance,
        uint256 recipientBalance
    );

    event StreamExtended(
        bytes32 indexed streamId,
        uint256 newStopTime,
        uint256 additionalDeposit
    );

    /**
     * @dev Create a payment stream with native token
     * @param recipient The address receiving the stream
     * @param stopTime The timestamp when stream ends
     */
    function createStreamNative(
        address recipient,
        uint256 stopTime
    ) external payable nonReentrant returns (bytes32) {
        require(recipient != address(0), "Invalid recipient address");
        require(msg.value > 0, "Deposit must be greater than 0");
        require(stopTime > block.timestamp, "Stop time must be in the future");

        uint256 duration = stopTime - block.timestamp;
        require(duration > 0, "Duration must be greater than 0");
        require(msg.value >= duration, "Deposit too small for duration");

        uint256 ratePerSecond = msg.value / duration;
        require(ratePerSecond > 0, "Rate per second must be greater than 0");

        bytes32 streamId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipient,
                block.timestamp,
                msg.value
            )
        );

        require(streams[streamId].sender == address(0), "Stream already exists");

        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            deposit: msg.value,
            token: address(0),
            startTime: block.timestamp,
            stopTime: stopTime,
            ratePerSecond: ratePerSecond,
            remainingBalance: msg.value,
            active: true,
            lastWithdrawal: block.timestamp
        });

        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            msg.value,
            block.timestamp,
            stopTime,
            ratePerSecond
        );

        return streamId;
    }

    /**
     * @dev Create a payment stream with ERC20 token
     * @param recipient The address receiving the stream
     * @param token The ERC20 token address
     * @param deposit The deposit amount
     * @param stopTime The timestamp when stream ends
     */
    function createStreamToken(
        address recipient,
        address token,
        uint256 deposit,
        uint256 stopTime
    ) external nonReentrant returns (bytes32) {
        require(recipient != address(0), "Invalid recipient address");
        require(token != address(0), "Invalid token address");
        require(deposit > 0, "Deposit must be greater than 0");
        require(stopTime > block.timestamp, "Stop time must be in the future");

        uint256 duration = stopTime - block.timestamp;
        require(duration > 0, "Duration must be greater than 0");
        require(deposit >= duration, "Deposit too small for duration");

        uint256 ratePerSecond = deposit / duration;
        require(ratePerSecond > 0, "Rate per second must be greater than 0");

        // Transfer tokens from sender to contract
        IERC20(token).transferFrom(msg.sender, address(this), deposit);

        bytes32 streamId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipient,
                token,
                block.timestamp,
                deposit
            )
        );

        require(streams[streamId].sender == address(0), "Stream already exists");

        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            deposit: deposit,
            token: token,
            startTime: block.timestamp,
            stopTime: stopTime,
            ratePerSecond: ratePerSecond,
            remainingBalance: deposit,
            active: true,
            lastWithdrawal: block.timestamp
        });

        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            deposit,
            block.timestamp,
            stopTime,
            ratePerSecond
        );

        return streamId;
    }

    /**
     * @dev Withdraw available balance from stream
     * @param streamId The stream identifier
     */
    function withdrawFromStream(bytes32 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];

        require(stream.sender != address(0), "Stream does not exist");
        require(msg.sender == stream.recipient, "Only recipient can withdraw");
        require(stream.active, "Stream is not active");

        uint256 availableBalance = balanceOf(streamId, stream.recipient);
        require(availableBalance > 0, "No balance available");

        stream.remainingBalance -= availableBalance;
        stream.lastWithdrawal = block.timestamp;

        // If stream ended and all funds withdrawn, mark as inactive
        if (block.timestamp >= stream.stopTime && stream.remainingBalance == 0) {
            stream.active = false;
        }

        // Transfer funds
        if (stream.token == address(0)) {
            (bool success, ) = stream.recipient.call{value: availableBalance}("");
            require(success, "Transfer failed");
        } else {
            IERC20(stream.token).transfer(stream.recipient, availableBalance);
        }

        emit StreamWithdrawn(streamId, stream.recipient, availableBalance);
    }

    /**
     * @dev Cancel a stream and return remaining funds
     * @param streamId The stream identifier
     */
    function cancelStream(bytes32 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];

        require(stream.sender != address(0), "Stream does not exist");
        require(msg.sender == stream.sender || msg.sender == stream.recipient, "Not authorized");
        require(stream.active, "Stream already inactive");

        uint256 recipientBalance = balanceOf(streamId, stream.recipient);
        uint256 senderBalance = stream.remainingBalance - recipientBalance;

        stream.active = false;
        stream.remainingBalance = 0;

        // Transfer recipient's earned balance
        if (recipientBalance > 0) {
            if (stream.token == address(0)) {
                (bool success, ) = stream.recipient.call{value: recipientBalance}("");
                require(success, "Transfer to recipient failed");
            } else {
                IERC20(stream.token).transfer(stream.recipient, recipientBalance);
            }
        }

        // Return remaining balance to sender
        if (senderBalance > 0) {
            if (stream.token == address(0)) {
                (bool success, ) = stream.sender.call{value: senderBalance}("");
                require(success, "Transfer to sender failed");
            } else {
                IERC20(stream.token).transfer(stream.sender, senderBalance);
            }
        }

        emit StreamCancelled(streamId, senderBalance, recipientBalance);
    }

    /**
     * @dev Extend a stream with additional deposit
     * @param streamId The stream identifier
     * @param additionalTime Additional seconds to extend the stream
     */
    function extendStreamNative(bytes32 streamId, uint256 additionalTime) external payable nonReentrant {
        Stream storage stream = streams[streamId];

        require(stream.sender == msg.sender, "Only sender can extend stream");
        require(stream.token == address(0), "This stream requires ERC20 token");
        require(stream.active, "Stream is not active");
        require(additionalTime > 0, "Additional time must be greater than 0");
        require(msg.value > 0, "Additional deposit required");

        uint256 additionalDeposit = additionalTime * stream.ratePerSecond;
        require(msg.value >= additionalDeposit, "Insufficient deposit for extension");

        stream.stopTime += additionalTime;
        stream.deposit += msg.value;
        stream.remainingBalance += msg.value;

        // Refund excess
        if (msg.value > additionalDeposit) {
            uint256 excess = msg.value - additionalDeposit;
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "Excess refund failed");
        }

        emit StreamExtended(streamId, stream.stopTime, msg.value);
    }

    /**
     * @dev Extend a stream with ERC20 token
     * @param streamId The stream identifier
     * @param additionalTime Additional seconds to extend the stream
     */
    function extendStreamToken(bytes32 streamId, uint256 additionalTime) external nonReentrant {
        Stream storage stream = streams[streamId];

        require(stream.sender == msg.sender, "Only sender can extend stream");
        require(stream.token != address(0), "This stream requires native token");
        require(stream.active, "Stream is not active");
        require(additionalTime > 0, "Additional time must be greater than 0");

        uint256 additionalDeposit = additionalTime * stream.ratePerSecond;
        require(additionalDeposit > 0, "Additional deposit required");

        IERC20(stream.token).transferFrom(msg.sender, address(this), additionalDeposit);

        stream.stopTime += additionalTime;
        stream.deposit += additionalDeposit;
        stream.remainingBalance += additionalDeposit;

        emit StreamExtended(streamId, stream.stopTime, additionalDeposit);
    }

    /**
     * @dev Get available balance for a recipient
     * @param streamId The stream identifier
     * @param who The address to check balance for
     */
    function balanceOf(bytes32 streamId, address who) public view returns (uint256) {
        Stream memory stream = streams[streamId];

        if (who != stream.recipient) {
            return 0;
        }

        if (!stream.active || stream.remainingBalance == 0) {
            return 0;
        }

        uint256 currentTime = block.timestamp > stream.stopTime ? stream.stopTime : block.timestamp;
        uint256 elapsedTime = currentTime > stream.lastWithdrawal ? currentTime - stream.lastWithdrawal : 0;
        uint256 earned = elapsedTime * stream.ratePerSecond;

        // Ensure we don't exceed remaining balance
        return earned > stream.remainingBalance ? stream.remainingBalance : earned;
    }

    /**
     * @dev Get stream details
     * @param streamId The stream identifier
     */
    function getStream(bytes32 streamId) external view returns (
        address sender,
        address recipient,
        uint256 deposit,
        address token,
        uint256 startTime,
        uint256 stopTime,
        uint256 ratePerSecond,
        uint256 remainingBalance,
        bool active
    ) {
        Stream memory stream = streams[streamId];
        return (
            stream.sender,
            stream.recipient,
            stream.deposit,
            stream.token,
            stream.startTime,
            stream.stopTime,
            stream.ratePerSecond,
            stream.remainingBalance,
            stream.active
        );
    }

    /**
     * @dev Get all streams created by a sender
     * @param sender The sender address
     */
    function getSenderStreams(address sender) external view returns (bytes32[] memory) {
        return senderStreams[sender];
    }

    /**
     * @dev Get all streams received by a recipient
     * @param recipient The recipient address
     */
    function getRecipientStreams(address recipient) external view returns (bytes32[] memory) {
        return recipientStreams[recipient];
    }

    /**
     * @dev Check if stream is active and ongoing
     * @param streamId The stream identifier
     */
    function isStreamActive(bytes32 streamId) external view returns (bool) {
        Stream memory stream = streams[streamId];
        return stream.active && block.timestamp < stream.stopTime;
    }

    /**
     * @dev Calculate total time elapsed in stream
     * @param streamId The stream identifier
     */
    function getElapsedTime(bytes32 streamId) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        if (block.timestamp < stream.startTime) {
            return 0;
        }
        uint256 currentTime = block.timestamp > stream.stopTime ? stream.stopTime : block.timestamp;
        return currentTime - stream.startTime;
    }

    /**
     * @dev Calculate remaining time in stream
     * @param streamId The stream identifier
     */
    function getRemainingTime(bytes32 streamId) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        if (block.timestamp >= stream.stopTime) {
            return 0;
        }
        return stream.stopTime - block.timestamp;
    }
}
