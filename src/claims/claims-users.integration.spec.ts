import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsService } from './claims.service';
import { UsersService } from '../users/users.service';

describe('Claims and Users Integration', () => {
  let claimsService: ClaimsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimsService, UsersService],
    }).compile();

    claimsService = module.get<ClaimsService>(ClaimsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should create a user and link a claim to that user', () => {
    // Step 1: Create a user
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
    };
    const user = usersService.create(userData);
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');

    // Step 2: Create a claim linked to the user
    const claimData = {
      userId: user.id,
      itemId: 123,
      description: 'Lost wallet with ID cards',
      status: 'pending',
    };
    const claim = claimsService.create(claimData);
    expect(claim).toHaveProperty('id');
    expect(claim.userId).toBe(user.id);
    expect(claim.status).toBe('pending');
    expect(claim.itemId).toBe(123);

    // Step 3: Verify the claim is linked to the user
    const allClaims = claimsService.findAll();
    const userClaim = allClaims.find((c) => c.userId === user.id);
    expect(userClaim).toBeDefined();
    expect(userClaim.userId).toBe(user.id);
    expect(userClaim.id).toBe(claim.id);
  });

  it('should create multiple users and claims', () => {
    // Create first user
    const user1 = usersService.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'pass123',
    });

    // Create second user
    const user2 = usersService.create({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'pass456',
    });

    // Create claim for first user
    const claim1 = claimsService.create({
      userId: user1.id,
      itemId: 100,
      description: 'Claiming lost keys',
    });

    // Create claim for second user
    const claim2 = claimsService.create({
      userId: user2.id,
      itemId: 200,
      description: 'Claiming lost phone',
    });

    // Verify users exist
    const allUsers = usersService.findAll();
    expect(allUsers).toHaveLength(2);
    expect(allUsers.find((u) => u.name === 'Alice')).toBeDefined();
    expect(allUsers.find((u) => u.name === 'Bob')).toBeDefined();

    // Verify claims are linked to correct users
    const allClaims = claimsService.findAll();
    expect(allClaims).toHaveLength(2);

    const aliceClaim = allClaims.find((c) => c.userId === user1.id);
    expect(aliceClaim).toBeDefined();
    expect(aliceClaim.itemId).toBe(100);

    const bobClaim = allClaims.find((c) => c.userId === user2.id);
    expect(bobClaim).toBeDefined();
    expect(bobClaim.itemId).toBe(200);
  });

  it('should find user by id and verify their claims', () => {
    // Create user
    const user = usersService.create({
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'pass789',
    });

    // Create two claims for the user
    const claim1 = claimsService.create({
      userId: user.id,
      itemId: 300,
      description: 'Lost backpack',
    });

    const claim2 = claimsService.create({
      userId: user.id,
      itemId: 400,
      description: 'Lost laptop',
    });

    // Find user by id
    const foundUser = usersService.findById(user.id);
    expect(foundUser).toBeDefined();
    expect(foundUser.name).toBe('Charlie');
    expect(foundUser.id).toBe(user.id);

    // Find all claims for the user
    const userClaims = claimsService
      .findAll()
      .filter((c) => c.userId === foundUser.id);
    expect(userClaims).toHaveLength(2);
    expect(userClaims.map((c) => c.itemId)).toContain(300);
    expect(userClaims.map((c) => c.itemId)).toContain(400);
  });

  it('should approve a claim for a user', () => {
    // Create user
    const user = usersService.create({
      name: 'Diana',
      email: 'diana@example.com',
      password: 'pass999',
    });

    // Create claim
    const claim = claimsService.create({
      userId: user.id,
      itemId: 500,
      description: 'Lost glasses',
    });
    expect(claim.status).toBe('pending');

    // Approve the claim
    const approvedClaim = claimsService.approve(claim.id);
    expect(approvedClaim.status).toBe('approved');
    expect(approvedClaim.userId).toBe(user.id);

    // Verify claim status changed in the list
    const allClaims = claimsService.findAll();
    const userClaim = allClaims.find((c) => c.userId === user.id);
    expect(userClaim.status).toBe('approved');
  });

  it('should maintain separate claims for different users', () => {
    // Create two users
    const user1 = usersService.create({
      name: 'Eve',
      email: 'eve@example.com',
    });
    const user2 = usersService.create({
      name: 'Frank',
      email: 'frank@example.com',
    });

    // Create claim for user1
    const claim1 = claimsService.create({
      userId: user1.id,
      itemId: 600,
      description: 'Claiming book',
    });

    // Create claim for user2
    const claim2 = claimsService.create({
      userId: user2.id,
      itemId: 700,
      description: 'Claiming umbrella',
    });

    // Verify claims are separate
    const user1Claims = claimsService
      .findAll()
      .filter((c) => c.userId === user1.id);
    const user2Claims = claimsService
      .findAll()
      .filter((c) => c.userId === user2.id);

    expect(user1Claims).toHaveLength(1);
    expect(user2Claims).toHaveLength(1);
    expect(user1Claims[0].itemId).toBe(600);
    expect(user2Claims[0].itemId).toBe(700);
  });
});
