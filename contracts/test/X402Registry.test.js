const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('X402Registry', function () {
  async function deployRegistryFixture() {
    const [owner, provider1, provider2, user] = await ethers.getSigners();

    const X402Registry = await ethers.getContractFactory('X402Registry');
    const registry = await X402Registry.deploy();

    return { registry, owner, provider1, provider2, user };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { registry, owner } = await loadFixture(deployRegistryFixture);
      expect(await registry.owner()).to.equal(owner.address);
    });

    it('Should start with zero services', async function () {
      const { registry } = await loadFixture(deployRegistryFixture);
      expect(await registry.getTotalServices()).to.equal(0);
    });
  });

  describe('Service Registration', function () {
    it('Should allow registering a service', async function () {
      const { registry, provider1 } = await loadFixture(deployRegistryFixture);

      const name = 'AI Image Generation';
      const description = 'Generate images using AI models';
      const endpoint = 'https://api.example.com/v1/generate';
      const paymentAddress = provider1.address;
      const basePrice = ethers.parseEther('0.01');
      const token = ethers.ZeroAddress;

      await expect(
        registry
          .connect(provider1)
          .registerService(name, description, endpoint, paymentAddress, basePrice, token)
      ).to.emit(registry, 'ServiceRegistered');

      expect(await registry.getTotalServices()).to.equal(1);
    });

    it('Should reject registration with empty name', async function () {
      const { registry, provider1 } = await loadFixture(deployRegistryFixture);

      await expect(
        registry
          .connect(provider1)
          .registerService(
            '',
            'Description',
            'https://api.example.com',
            provider1.address,
            ethers.parseEther('0.01'),
            ethers.ZeroAddress
          )
      ).to.be.revertedWith('Name required');
    });

    it('Should reject registration with empty endpoint', async function () {
      const { registry, provider1 } = await loadFixture(deployRegistryFixture);

      await expect(
        registry
          .connect(provider1)
          .registerService(
            'Service Name',
            'Description',
            '',
            provider1.address,
            ethers.parseEther('0.01'),
            ethers.ZeroAddress
          )
      ).to.be.revertedWith('Endpoint required');
    });

    it('Should reject registration with zero payment address', async function () {
      const { registry, provider1 } = await loadFixture(deployRegistryFixture);

      await expect(
        registry
          .connect(provider1)
          .registerService(
            'Service Name',
            'Description',
            'https://api.example.com',
            ethers.ZeroAddress,
            ethers.parseEther('0.01'),
            ethers.ZeroAddress
          )
      ).to.be.revertedWith('Invalid payment address');
    });

    it('Should track provider services', async function () {
      const { registry, provider1 } = await loadFixture(deployRegistryFixture);

      await registry
        .connect(provider1)
        .registerService(
          'Service 1',
          'Description 1',
          'https://api1.example.com',
          provider1.address,
          ethers.parseEther('0.01'),
          ethers.ZeroAddress
        );

      await registry
        .connect(provider1)
        .registerService(
          'Service 2',
          'Description 2',
          'https://api2.example.com',
          provider1.address,
          ethers.parseEther('0.02'),
          ethers.ZeroAddress
        );

      const providerServices = await registry.getProviderServices(provider1.address);
      expect(providerServices.length).to.equal(2);
    });
  });

  describe('Service Management', function () {
    async function registerServiceFixture() {
      const { registry, owner, provider1, provider2, user } =
        await loadFixture(deployRegistryFixture);

      const tx = await registry
        .connect(provider1)
        .registerService(
          'AI Service',
          'AI-powered service',
          'https://api.example.com/v1',
          provider1.address,
          ethers.parseEther('0.01'),
          ethers.ZeroAddress
        );
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return registry.interface.parseLog(log).name === 'ServiceRegistered';
        } catch (e) {
          return false;
        }
      });
      const serviceId = registry.interface.parseLog(event).args[0];

      return { registry, owner, provider1, provider2, user, serviceId };
    }

    it('Should allow provider to update service', async function () {
      const { registry, provider1, serviceId } = await loadFixture(registerServiceFixture);

      const newDescription = 'Updated description';
      const newPrice = ethers.parseEther('0.02');

      await expect(
        registry
          .connect(provider1)
          .updateService(serviceId, newDescription, newPrice, provider1.address)
      )
        .to.emit(registry, 'ServiceUpdated')
        .withArgs(serviceId);

      const service = await registry.getService(serviceId);
      expect(service.description).to.equal(newDescription);
      expect(service.basePrice).to.equal(newPrice);
    });

    it('Should not allow non-provider to update service', async function () {
      const { registry, provider2, serviceId } = await loadFixture(registerServiceFixture);

      await expect(
        registry
          .connect(provider2)
          .updateService(serviceId, 'Hacked', ethers.parseEther('100'), provider2.address)
      ).to.be.revertedWith('Only provider can update');
    });

    it('Should allow provider to deactivate service', async function () {
      const { registry, provider1, serviceId } = await loadFixture(registerServiceFixture);

      await expect(registry.connect(provider1).deactivateService(serviceId))
        .to.emit(registry, 'ServiceDeactivated')
        .withArgs(serviceId);

      const service = await registry.getService(serviceId);
      expect(service.active).to.be.false;
    });

    it('Should allow owner to deactivate any service', async function () {
      const { registry, owner, serviceId } = await loadFixture(registerServiceFixture);

      await expect(registry.connect(owner).deactivateService(serviceId))
        .to.emit(registry, 'ServiceDeactivated')
        .withArgs(serviceId);

      const service = await registry.getService(serviceId);
      expect(service.active).to.be.false;
    });

    it('Should allow provider to reactivate service', async function () {
      const { registry, provider1, serviceId } = await loadFixture(registerServiceFixture);

      // Deactivate first
      await registry.connect(provider1).deactivateService(serviceId);

      // Reactivate
      await expect(registry.connect(provider1).activateService(serviceId))
        .to.emit(registry, 'ServiceActivated')
        .withArgs(serviceId);

      const service = await registry.getService(serviceId);
      expect(service.active).to.be.true;
    });
  });

  describe('Pricing Tiers', function () {
    async function registerServiceFixture() {
      const { registry, owner, provider1, provider2, user } =
        await loadFixture(deployRegistryFixture);

      const tx = await registry
        .connect(provider1)
        .registerService(
          'API Service',
          'Premium API',
          'https://api.example.com',
          provider1.address,
          ethers.parseEther('0.01'),
          ethers.ZeroAddress
        );
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return registry.interface.parseLog(log).name === 'ServiceRegistered';
        } catch (e) {
          return false;
        }
      });
      const serviceId = registry.interface.parseLog(event).args[0];

      return { registry, owner, provider1, provider2, user, serviceId };
    }

    it('Should allow adding pricing tiers', async function () {
      const { registry, provider1, serviceId } = await loadFixture(registerServiceFixture);

      await expect(
        registry.connect(provider1).addPricingTier(
          serviceId,
          'Basic',
          ethers.parseEther('10'),
          100, // 100 requests
          30 * 24 * 60 * 60 // 30 days
        )
      ).to.emit(registry, 'PricingTierAdded');

      const tiers = await registry.getPricingTiers(serviceId);
      expect(tiers.length).to.equal(1);
      expect(tiers[0].tierName).to.equal('Basic');
    });

    it('Should allow multiple pricing tiers', async function () {
      const { registry, provider1, serviceId } = await loadFixture(registerServiceFixture);

      // Add Basic tier
      await registry
        .connect(provider1)
        .addPricingTier(serviceId, 'Basic', ethers.parseEther('10'), 100, 30 * 24 * 60 * 60);

      // Add Premium tier
      await registry
        .connect(provider1)
        .addPricingTier(serviceId, 'Premium', ethers.parseEther('50'), 1000, 30 * 24 * 60 * 60);

      // Add Enterprise tier
      await registry
        .connect(provider1)
        .addPricingTier(
          serviceId,
          'Enterprise',
          ethers.parseEther('200'),
          10000,
          30 * 24 * 60 * 60
        );

      const tiers = await registry.getPricingTiers(serviceId);
      expect(tiers.length).to.equal(3);
      expect(tiers[0].tierName).to.equal('Basic');
      expect(tiers[1].tierName).to.equal('Premium');
      expect(tiers[2].tierName).to.equal('Enterprise');
    });

    it('Should not allow non-provider to add pricing tiers', async function () {
      const { registry, provider2, serviceId } = await loadFixture(registerServiceFixture);

      await expect(
        registry
          .connect(provider2)
          .addPricingTier(
            serviceId,
            'Malicious',
            ethers.parseEther('1'),
            1000000,
            365 * 24 * 60 * 60
          )
      ).to.be.revertedWith('Only provider can add pricing tiers');
    });

    it('Should not allow adding tiers to inactive service', async function () {
      const { registry, provider1, serviceId } = await loadFixture(registerServiceFixture);

      // Deactivate service
      await registry.connect(provider1).deactivateService(serviceId);

      await expect(
        registry
          .connect(provider1)
          .addPricingTier(serviceId, 'Basic', ethers.parseEther('10'), 100, 30 * 24 * 60 * 60)
      ).to.be.revertedWith('Service not active');
    });
  });

  describe('Service Verification', function () {
    async function registerServiceFixture() {
      const { registry, owner, provider1, provider2, user } =
        await loadFixture(deployRegistryFixture);

      const tx = await registry
        .connect(provider1)
        .registerService(
          'Verified Service',
          'This will be verified',
          'https://api.verified.com',
          provider1.address,
          ethers.parseEther('0.01'),
          ethers.ZeroAddress
        );
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return registry.interface.parseLog(log).name === 'ServiceRegistered';
        } catch (e) {
          return false;
        }
      });
      const serviceId = registry.interface.parseLog(event).args[0];

      return { registry, owner, provider1, provider2, user, serviceId };
    }

    it('Should allow owner to verify service', async function () {
      const { registry, owner, serviceId } = await loadFixture(registerServiceFixture);

      await expect(registry.connect(owner).verifyService(serviceId))
        .to.emit(registry, 'ServiceVerified')
        .withArgs(serviceId);

      expect(await registry.isVerified(serviceId)).to.be.true;
    });

    it('Should not allow non-owner to verify service', async function () {
      const { registry, provider1, serviceId } = await loadFixture(registerServiceFixture);

      await expect(
        registry.connect(provider1).verifyService(serviceId)
      ).to.be.revertedWithCustomError(registry, 'OwnableUnauthorizedAccount');
    });

    it('Should reject verifying non-existent service', async function () {
      const { registry, owner } = await loadFixture(deployRegistryFixture);

      const fakeServiceId = ethers.keccak256(ethers.toUtf8Bytes('fake-service'));

      await expect(registry.connect(owner).verifyService(fakeServiceId)).to.be.revertedWith(
        'Service does not exist'
      );
    });
  });

  describe('Request Recording', function () {
    async function registerServiceFixture() {
      const { registry, owner, provider1, provider2, user } =
        await loadFixture(deployRegistryFixture);

      const tx = await registry
        .connect(provider1)
        .registerService(
          'Request Service',
          'Tracks requests',
          'https://api.requests.com',
          provider1.address,
          ethers.parseEther('0.01'),
          ethers.ZeroAddress
        );
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return registry.interface.parseLog(log).name === 'ServiceRegistered';
        } catch (e) {
          return false;
        }
      });
      const serviceId = registry.interface.parseLog(event).args[0];

      return { registry, owner, provider1, provider2, user, serviceId };
    }

    it('Should record service requests', async function () {
      const { registry, user, serviceId } = await loadFixture(registerServiceFixture);

      const amount = ethers.parseEther('0.01');

      await expect(registry.connect(user).recordRequest(serviceId, amount))
        .to.emit(registry, 'RequestRecorded')
        .withArgs(serviceId, amount);

      const service = await registry.getService(serviceId);
      expect(service.totalRequests).to.equal(1);
      expect(service.totalRevenue).to.equal(amount);
    });

    it('Should accumulate requests and revenue', async function () {
      const { registry, user, serviceId } = await loadFixture(registerServiceFixture);

      await registry.connect(user).recordRequest(serviceId, ethers.parseEther('0.01'));
      await registry.connect(user).recordRequest(serviceId, ethers.parseEther('0.02'));
      await registry.connect(user).recordRequest(serviceId, ethers.parseEther('0.03'));

      const service = await registry.getService(serviceId);
      expect(service.totalRequests).to.equal(3);
      expect(service.totalRevenue).to.equal(ethers.parseEther('0.06'));
    });

    it('Should not record requests for inactive service', async function () {
      const { registry, provider1, user, serviceId } = await loadFixture(registerServiceFixture);

      // Deactivate service
      await registry.connect(provider1).deactivateService(serviceId);

      await expect(
        registry.connect(user).recordRequest(serviceId, ethers.parseEther('0.01'))
      ).to.be.revertedWith('Service not active');
    });
  });

  describe('Service Queries', function () {
    it('Should return all services', async function () {
      const { registry, provider1, provider2 } = await loadFixture(deployRegistryFixture);

      await registry
        .connect(provider1)
        .registerService(
          'Service 1',
          'Desc 1',
          'https://api1.com',
          provider1.address,
          ethers.parseEther('0.01'),
          ethers.ZeroAddress
        );

      await registry
        .connect(provider2)
        .registerService(
          'Service 2',
          'Desc 2',
          'https://api2.com',
          provider2.address,
          ethers.parseEther('0.02'),
          ethers.ZeroAddress
        );

      const allServices = await registry.getAllServices();
      expect(allServices.length).to.equal(2);
    });

    it('Should return correct service details', async function () {
      const { registry, provider1 } = await loadFixture(deployRegistryFixture);

      const name = 'Test Service';
      const endpoint = 'https://test.api.com';
      const basePrice = ethers.parseEther('0.05');

      const tx = await registry
        .connect(provider1)
        .registerService(
          name,
          'Test description',
          endpoint,
          provider1.address,
          basePrice,
          ethers.ZeroAddress
        );
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return registry.interface.parseLog(log).name === 'ServiceRegistered';
        } catch (e) {
          return false;
        }
      });
      const serviceId = registry.interface.parseLog(event).args[0];

      const service = await registry.getService(serviceId);
      expect(service.provider).to.equal(provider1.address);
      expect(service.name).to.equal(name);
      expect(service.endpoint).to.equal(endpoint);
      expect(service.basePrice).to.equal(basePrice);
      expect(service.active).to.be.true;
    });
  });
});
