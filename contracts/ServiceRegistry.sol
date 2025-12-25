// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ServiceRegistry
 * @dev Registry for x402 services that NECRORALabs ($NECRORA) agents can discover and use
 * Allows service providers to register their APIs and pricing
 */
contract ServiceRegistry is Ownable, ReentrancyGuard {

    struct Service {
        address provider;
        string name;
        string endpoint;
        uint256 pricePerCall;
        uint256 pricePerMonth;
        bytes32 category;
        bool isActive;
        uint256 totalCalls;
        uint256 registeredAt;
        string metadata; // JSON metadata
    }

    struct Subscription {
        address subscriber;
        bytes32 serviceId;
        uint256 expiresAt;
        bool isActive;
    }

    // Service storage
    mapping(bytes32 => Service) public services;
    mapping(address => bytes32[]) public providerServices;
    mapping(bytes32 => bytes32[]) public categoryServices;

    // Subscription storage
    mapping(bytes32 => Subscription) public subscriptions;
    mapping(address => bytes32[]) public userSubscriptions;

    // Statistics
    uint256 public totalServices;
    uint256 public totalActiveServices;
    uint256 public totalSubscriptions;

    // Events
    event ServiceRegistered(
        bytes32 indexed serviceId,
        address indexed provider,
        string name,
        bytes32 category
    );
    event ServiceUpdated(bytes32 indexed serviceId);
    event ServiceDeactivated(bytes32 indexed serviceId);
    event ServiceCalled(bytes32 indexed serviceId, address indexed caller);
    event SubscriptionCreated(
        bytes32 indexed subscriptionId,
        bytes32 indexed serviceId,
        address indexed subscriber,
        uint256 expiresAt
    );
    event SubscriptionRenewed(bytes32 indexed subscriptionId, uint256 newExpiresAt);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new service
     * @param name Service name
     * @param endpoint Service endpoint URL
     * @param pricePerCall Price per API call
     * @param pricePerMonth Monthly subscription price
     * @param category Service category
     * @param metadata JSON metadata string
     */
    function registerService(
        string calldata name,
        string calldata endpoint,
        uint256 pricePerCall,
        uint256 pricePerMonth,
        bytes32 category,
        string calldata metadata
    ) external returns (bytes32 serviceId) {
        require(bytes(name).length > 0, "Invalid name");
        require(bytes(endpoint).length > 0, "Invalid endpoint");

        serviceId = keccak256(abi.encodePacked(
            msg.sender,
            name,
            block.timestamp
        ));

        require(services[serviceId].provider == address(0), "Service exists");

        services[serviceId] = Service({
            provider: msg.sender,
            name: name,
            endpoint: endpoint,
            pricePerCall: pricePerCall,
            pricePerMonth: pricePerMonth,
            category: category,
            isActive: true,
            totalCalls: 0,
            registeredAt: block.timestamp,
            metadata: metadata
        });

        providerServices[msg.sender].push(serviceId);
        categoryServices[category].push(serviceId);

        totalServices++;
        totalActiveServices++;

        emit ServiceRegistered(serviceId, msg.sender, name, category);

        return serviceId;
    }

    /**
     * @dev Update service pricing
     * @param serviceId Service to update
     * @param pricePerCall New price per call
     * @param pricePerMonth New monthly price
     */
    function updateServicePricing(
        bytes32 serviceId,
        uint256 pricePerCall,
        uint256 pricePerMonth
    ) external {
        Service storage service = services[serviceId];
        require(service.provider == msg.sender, "Not service provider");

        service.pricePerCall = pricePerCall;
        service.pricePerMonth = pricePerMonth;

        emit ServiceUpdated(serviceId);
    }

    /**
     * @dev Update service metadata
     * @param serviceId Service to update
     * @param metadata New metadata
     */
    function updateServiceMetadata(
        bytes32 serviceId,
        string calldata metadata
    ) external {
        Service storage service = services[serviceId];
        require(service.provider == msg.sender, "Not service provider");

        service.metadata = metadata;

        emit ServiceUpdated(serviceId);
    }

    /**
     * @dev Deactivate a service
     * @param serviceId Service to deactivate
     */
    function deactivateService(bytes32 serviceId) external {
        Service storage service = services[serviceId];
        require(service.provider == msg.sender, "Not service provider");
        require(service.isActive, "Already inactive");

        service.isActive = false;
        totalActiveServices--;

        emit ServiceDeactivated(serviceId);
    }

    /**
     * @dev Reactivate a service
     * @param serviceId Service to reactivate
     */
    function reactivateService(bytes32 serviceId) external {
        Service storage service = services[serviceId];
        require(service.provider == msg.sender, "Not service provider");
        require(!service.isActive, "Already active");

        service.isActive = true;
        totalActiveServices++;

        emit ServiceUpdated(serviceId);
    }

    /**
     * @dev Record a service call (called by payment router)
     * @param serviceId Service being called
     * @param caller Address making the call
     */
    function recordServiceCall(bytes32 serviceId, address caller) external {
        Service storage service = services[serviceId];
        require(service.isActive, "Service not active");

        service.totalCalls++;

        emit ServiceCalled(serviceId, caller);
    }

    /**
     * @dev Create a subscription
     * @param serviceId Service to subscribe to
     * @param durationMonths Subscription duration in months
     */
    function createSubscription(
        bytes32 serviceId,
        uint256 durationMonths
    ) external payable nonReentrant returns (bytes32 subscriptionId) {
        Service memory service = services[serviceId];
        require(service.isActive, "Service not active");
        require(durationMonths > 0, "Invalid duration");

        uint256 totalCost = service.pricePerMonth * durationMonths;
        require(msg.value >= totalCost, "Insufficient payment");

        subscriptionId = keccak256(abi.encodePacked(
            msg.sender,
            serviceId,
            block.timestamp
        ));

        uint256 expiresAt = block.timestamp + (durationMonths * 30 days);

        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            serviceId: serviceId,
            expiresAt: expiresAt,
            isActive: true
        });

        userSubscriptions[msg.sender].push(subscriptionId);
        totalSubscriptions++;

        // Transfer payment to service provider
        (bool success, ) = payable(service.provider).call{value: msg.value}("");
        require(success, "Payment failed");

        emit SubscriptionCreated(subscriptionId, serviceId, msg.sender, expiresAt);

        return subscriptionId;
    }

    /**
     * @dev Check if user has active subscription
     * @param user User address
     * @param serviceId Service to check
     */
    function hasActiveSubscription(address user, bytes32 serviceId) external view returns (bool) {
        bytes32[] memory userSubs = userSubscriptions[user];

        for (uint256 i = 0; i < userSubs.length; i++) {
            Subscription memory sub = subscriptions[userSubs[i]];
            if (sub.serviceId == serviceId && sub.isActive && sub.expiresAt > block.timestamp) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Get services by category
     * @param category Category to query
     */
    function getServicesByCategory(bytes32 category) external view returns (bytes32[] memory) {
        return categoryServices[category];
    }

    /**
     * @dev Get services by provider
     * @param provider Provider address
     */
    function getServicesByProvider(address provider) external view returns (bytes32[] memory) {
        return providerServices[provider];
    }

    /**
     * @dev Get service details
     * @param serviceId Service to query
     */
    function getService(bytes32 serviceId) external view returns (
        address provider,
        string memory name,
        string memory endpoint,
        uint256 pricePerCall,
        uint256 pricePerMonth,
        bytes32 category,
        bool isActive,
        uint256 totalCalls
    ) {
        Service memory service = services[serviceId];
        return (
            service.provider,
            service.name,
            service.endpoint,
            service.pricePerCall,
            service.pricePerMonth,
            service.category,
            service.isActive,
            service.totalCalls
        );
    }

    /**
     * @dev Get registry statistics
     */
    function getStats() external view returns (
        uint256 _totalServices,
        uint256 _totalActiveServices,
        uint256 _totalSubscriptions
    ) {
        return (totalServices, totalActiveServices, totalSubscriptions);
    }
}
