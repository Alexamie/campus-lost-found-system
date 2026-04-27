import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClaimsService } from './claims.service';
import { UsersService } from '../users/users.service';
import { Claim } from '../entities/claim.entity';
import { Item } from '../entities/item.entity';
import { User } from '../entities/user.entity';

describe('Claims and Users Integration', () => {
  let claimsService: ClaimsService;
  let usersService: UsersService;

  const claimRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const itemRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const userRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        UsersService,
        {
          provide: getRepositoryToken(Claim),
          useValue: claimRepository,
        },
        {
          provide: getRepositoryToken(Item),
          useValue: itemRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    claimsService = module.get<ClaimsService>(ClaimsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('creates a user and associates a persisted claim with that user id', async () => {
    userRepository.create.mockImplementation((data) => data);
    userRepository.save.mockImplementation(async (data) => ({ id: 1, ...data }));

    const user = await usersService.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
    });

    itemRepository.findOne.mockResolvedValue({
      id: 15,
      title: 'ID Card',
      description: 'University ID',
      status: 'found',
      approvalStatus: 'approved',
    });
    claimRepository.findOne.mockResolvedValue(null);
    claimRepository.create.mockImplementation((payload) => payload);
    claimRepository.save.mockImplementation(async (payload) => ({
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...payload,
    }));

    const claim = await claimsService.create(
      { itemId: 15, message: 'This ID card belongs to me.' },
      { id: user.id },
    );

    expect(user.id).toBeDefined();
    expect(claim.userId).toBe(user.id);
    expect(claim.itemId).toBe(15);
    expect(claim.status).toBe('pending');
  });
});
