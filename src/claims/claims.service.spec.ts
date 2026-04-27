import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClaimsService } from './claims.service';
import { Claim } from '../entities/claim.entity';
import { Item } from '../entities/item.entity';
import { User } from '../entities/user.entity';

describe('ClaimsService', () => {
  let service: ClaimsService;

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
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
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

    service = module.get<ClaimsService>(ClaimsService);
  });

  it('creates a pending claim for an approved found item', async () => {
    itemRepository.findOne.mockResolvedValue({
      id: 3,
      title: 'USB Drive',
      description: 'Blue flash drive',
      status: 'found',
      approvalStatus: 'approved',
    });
    claimRepository.findOne.mockResolvedValue(null);
    claimRepository.create.mockImplementation((payload) => payload);
    claimRepository.save.mockImplementation(async (payload) => ({
      id: 9,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...payload,
    }));

    const result = await service.create(
      { itemId: 3, message: 'This is my USB drive.' },
      { id: 7 },
    );

    expect(result.id).toBe(9);
    expect(result.status).toBe('pending');
    expect(result.itemId).toBe(3);
    expect(result.userId).toBe(7);
    expect(result.itemTitle).toBe('USB Drive');
  });

  it('returns enriched claims for a user', async () => {
    claimRepository.find.mockResolvedValue([
      {
        id: 5,
        itemId: 11,
        userId: 4,
        message: 'My student ID is inside.',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    itemRepository.find.mockResolvedValue([
      {
        id: 11,
        title: 'Wallet',
        description: 'Brown wallet',
        status: 'found',
      },
    ]);
    userRepository.find.mockResolvedValue([
      {
        id: 4,
        name: 'Jamie User',
        email: 'jamie@example.com',
      },
    ]);

    const claims = await service.findByUser(4);

    expect(claims).toHaveLength(1);
    expect(claims[0]).toMatchObject({
      id: 5,
      itemTitle: 'Wallet',
      claimantName: 'Jamie User',
      claimantEmail: 'jamie@example.com',
    });
  });

  it('updates claim status when approving', async () => {
    claimRepository.findOne.mockResolvedValue({
      id: 2,
      itemId: 1,
      userId: 8,
      message: 'Please approve this.',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    claimRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.approve(2);

    expect(result.status).toBe('approved');
    expect(claimRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2, status: 'approved' }),
    );
  });
});
