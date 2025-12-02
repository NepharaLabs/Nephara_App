// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title X402Registry
 * @dev Registry for x402 protocol compatible services and APIs
 * Allows services to register and users to discover payment-enabled resources
 */
contract X402Registry is Ownable {

    struct Service {
        address provider;
        string name;
        string description;
        string endpoint;
        address paymentAddress;
        uint256 basePrice;
        address acceptedToken; // address(0) for native token
        bool active;
        uint256 registeredAt;
        uint256 totalRequests;
        uint256 totalRevenue;
    }

    struct PricingTier {
        string tierName;
        uint256 price;
        uint256 requestLimit;
        uint256 validityPeriod; // in seconds
    }

    // Service ID => Service details
    mapping(bytes32 => Service) public services;

    // Service ID => Pricing tiers
    mapping(bytes32 => PricingTier[]) public pricingTiers;

    // Provider address => Service IDs
    mapping(address => bytes32[]) public providerServices;

    // All service IDs
    bytes32[] public allServiceIds;

    // Service verification status
    mapping(bytes32 => bool) public verifiedServices;

    // Events
    event ServiceRegistered(
        bytes32 indexed serviceId,
        address indexed provider,
        string name,
        string endpoint
    );

    event ServiceUpdated(bytes32 indexed serviceId);
    event ServiceDeactivated(bytes32 indexed serviceId);
    event ServiceActivated(bytes32 indexed serviceId);
    event ServiceVerified(bytes32 indexed serviceId);
    event PricingTierAdded(bytes32 indexed serviceId, string tierName, uint256 price);
    event RequestRecorded(bytes32 indexed serviceId, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new x402 service
     * @param name Service name
     * @param description Service description
     * @param endpoint API endpoint
     * @param paymentAddress Address to receive payments
     * @param basePrice Base price for the service
     * @param acceptedToken Token address (address(0) for native)
     */
    function registerService(
        string memory name,
        string memory description,
        string memory endpoint,
        address paymentAddress,
        uint256 basePrice,
        address acceptedToken
    ) external returns (bytes32) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(endpoint).length > 0, "Endpoint required");
        require(paymentAddress != address(0), "Invalid payment address");

        bytes32 serviceId = keccak256(
            abi.encodePacked(
                msg.sender,
                name,
                endpoint,
                block.timestamp
            )
        );

        require(services[serviceId].provider == address(0), "Service already registered");

        services[serviceId] = Service({
            provider: msg.sender,
            name: name,
            description: description,
            endpoint: endpoint,
            paymentAddress: paymentAddress,
            basePrice: basePrice,
            acceptedToken: acceptedToken,
            active: true,
            registeredAt: block.timestamp,
            totalRequests: 0,
            totalRevenue: 0
        });

        providerServices[msg.sender].push(serviceId);
        allServiceIds.push(serviceId);

        emit ServiceRegistered(serviceId, msg.sender, name, endpoint);

        return serviceId;
    }

    /**
     * @dev Add a pricing tier to a service
     * @param serviceId The service identifier
     * @param tierName Name of the pricing tier
     * @param price Price for this tier
     * @param requestLimit Number of requests included
     * @param validityPeriod How long the tier is valid (in seconds)
     */
    function addPricingTier(
        bytes32 serviceId,
        string memory tierName,
        uint256 price,
        uint256 requestLimit,
        uint256 validityPeriod
    ) external {
        Service storage service = services[serviceId];
        require(service.provider == msg.sender, "Only provider can add pricing tiers");
        require(service.active, "Service not active");

        pricingTiers[serviceId].push(PricingTier({
            tierName: tierName,
            price: price,
            requestLimit: requestLimit,
            validityPeriod: validityPeriod
        }));

        emit PricingTierAdded(serviceId, tierName, price);
    }

    /**
     * @dev Update service details
     * @param serviceId The service identifier
     * @param description New description
     * @param basePrice New base price
     * @param paymentAddress New payment address
     */
    function updateService(
        bytes32 serviceId,
        string memory description,
        uint256 basePrice,
        address paymentAddress
    ) external {
        Service storage service = services[serviceId];
        require(service.provider == msg.sender, "Only provider can update");
        require(paymentAddress != address(0), "Invalid payment address");

        service.description = description;
        service.basePrice = basePrice;
        service.paymentAddress = paymentAddress;

        emit ServiceUpdated(serviceId);
    }

    /**
     * @dev Deactivate a service
     * @param serviceId The service identifier
     */
    function deactivateService(bytes32 serviceId) external {
        Service storage service = services[serviceId];
        require(
            service.provider == msg.sender || msg.sender == owner(),
            "Not authorized"
        );

        service.active = false;
        emit ServiceDeactivated(serviceId);
    }

    /**
     * @dev Activate a service
     * @param serviceId The service identifier
     */
    function activateService(bytes32 serviceId) external {
        Service storage service = services[serviceId];
        require(service.provider == msg.sender, "Only provider can activate");

        service.active = true;
        emit ServiceActivated(serviceId);
    }

    /**
     * @dev Verify a service (only owner)
     * @param serviceId The service identifier
     */
    function verifyService(bytes32 serviceId) external onlyOwner {
        require(services[serviceId].provider != address(0), "Service does not exist");
        verifiedServices[serviceId] = true;
        emit ServiceVerified(serviceId);
    }

    /**
     * @dev Record a service request (called by payment gateway)
     * @param serviceId The service identifier
     * @param amount Payment amount
     */
    function recordRequest(bytes32 serviceId, uint256 amount) external {
        Service storage service = services[serviceId];
        require(service.active, "Service not active");

        service.totalRequests++;
        service.totalRevenue += amount;

        emit RequestRecorded(serviceId, amount);
    }

    /**
     * @dev Get service details
     * @param serviceId The service identifier
     */
    function getService(bytes32 serviceId) external view returns (Service memory) {
        return services[serviceId];
    }

    /**
     * @dev Get pricing tiers for a service
     * @param serviceId The service identifier
     */
    function getPricingTiers(bytes32 serviceId) external view returns (PricingTier[] memory) {
        return pricingTiers[serviceId];
    }

    /**
     * @dev Get all services by a provider
     * @param provider Provider address
     */
    function getProviderServices(address provider) external view returns (bytes32[] memory) {
        return providerServices[provider];
    }

    /**
     * @dev Get all registered services
     */
    function getAllServices() external view returns (bytes32[] memory) {
        return allServiceIds;
    }

    /**
     * @dev Get total number of services
     */
    function getTotalServices() external view returns (uint256) {
        return allServiceIds.length;
    }

    /**
     * @dev Check if a service is verified
     * @param serviceId The service identifier
     */
    function isVerified(bytes32 serviceId) external view returns (bool) {
        return verifiedServices[serviceId];
    }
}
