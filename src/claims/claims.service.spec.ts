import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsService } from './claims.service';

describe('ClaimsService', () => {
  let service: ClaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimsService],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
  });

  // Removed afterEach to avoid setting service = null

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with empty claims array', () => {
      expect(service.findAll()).toEqual([]);
    });
  });

  describe('Create', () => {
    it('should create a claim with all provided data', () => {
      const claimData = { itemId: 1, userId: 123, description: 'Claiming my wallet' };
      const claim = service.create(claimData);

      expect(claim).toHaveProperty('id');
      expect(claim.status).toBe('pending');
      expect(claim.itemId).toBe(1);
      expect(claim.userId).toBe(123);
      expect(claim.description).toBe('Claiming my wallet');
    });

    it('should auto-generate unique ID for each claim', () => {
      const claim1 = service.create({ itemId: 1 });
      const claim2 = service.create({ itemId: 2 });

      expect(claim1.id).toBeDefined();
      expect(claim2.id).toBeDefined();
      expect(claim1.id).not.toBe(claim2.id);
    });

    it('should set default status to pending', () => {
      const claim = service.create({ itemId: 1 });
      expect(claim.status).toBe('pending');
    });
  });

  describe('FindAll', () => {
    it('should return all created claims', () => {
      const claim1 = service.create({ itemId: 1 });
      const claim2 = service.create({ itemId: 2 });
      const claims = service.findAll();

      expect(claims).toHaveLength(2);
      expect(claims.map(c => c.id)).toEqual([claim1.id, claim2.id]);
    });

    it('should return empty array when no claims exist', () => {
      const claims = service.findAll();
      expect(claims).toEqual([]);
    });
  });

  describe('Approve', () => {
    it('should change claim status to approved', () => {
      const claim = service.create({ itemId: 1 });
      const approvedClaim = service.approve(claim.id);

      expect(approvedClaim.status).toBe('approved');
      expect(approvedClaim.id).toBe(claim.id);
    });

    it('should persist approval status in claims list', () => {
      const claim = service.create({ itemId: 1 });
      service.approve(claim.id);

      const allClaims = service.findAll();
      const updatedClaim = allClaims.find(c => c.id === claim.id);
      expect(updatedClaim.status).toBe('approved');
    });

    it('should return undefined when approving non-existent claim', () => {
      const result = service.approve(999);
      expect(result).toBeUndefined();
    });
  });

  describe('Reject', () => {
    it('should change claim status to rejected', () => {
      const claim = service.create({ itemId: 1 });
      const rejectedClaim = service.reject(claim.id);

      expect(rejectedClaim.status).toBe('rejected');
      expect(rejectedClaim.id).toBe(claim.id);
    });

    it('should persist rejection status in claims list', () => {
      const claim = service.create({ itemId: 1 });
      service.reject(claim.id);

      const allClaims = service.findAll();
      const updatedClaim = allClaims.find(c => c.id === claim.id);
      expect(updatedClaim.status).toBe('rejected');
    });

    it('should return undefined when rejecting non-existent claim', () => {
      const result = service.reject(999);
      expect(result).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple claims from same user', () => {
      const userId = 123;
      const claim1 = service.create({ userId, itemId: 1 });
      const claim2 = service.create({ userId, itemId: 2 });

      const claims = service.findAll();
      const userClaims = claims.filter(c => c.userId === userId);

      expect(userClaims).toHaveLength(2);
    });

    it('should preserve original claim data when approving', () => {
      const originalData = { userId: 456, itemId: 5, description: 'Original description' };
      const claim = service.create(originalData);
      const approvedClaim = service.approve(claim.id);

      expect(approvedClaim.userId).toBe(originalData.userId);
      expect(approvedClaim.itemId).toBe(originalData.itemId);
      expect(approvedClaim.description).toBe(originalData.description);
    });
  });
});