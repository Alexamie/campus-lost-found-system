import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';

describe('ClaimsController', () => {
  let controller: ClaimsController;

  const claimsService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findAll: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimsController],
      providers: [
        {
          provide: ClaimsService,
          useValue: claimsService,
        },
      ],
    }).compile();

    controller = module.get<ClaimsController>(ClaimsController);
  });

  it('creates a claim for the authenticated user', async () => {
    claimsService.create.mockResolvedValue({ id: 1, status: 'pending' });

    const result = await controller.create(
      { itemId: 10, message: 'This belongs to me.' },
      { user: { id: 3 } },
    );

    expect(claimsService.create).toHaveBeenCalledWith(
      { itemId: 10, message: 'This belongs to me.' },
      { id: 3 },
    );
    expect(result).toEqual({ id: 1, status: 'pending' });
  });

  it('returns claims for the current user', async () => {
    claimsService.findByUser.mockResolvedValue([{ id: 4 }]);

    const result = await controller.findMine({ user: { id: 12 } });

    expect(claimsService.findByUser).toHaveBeenCalledWith(12);
    expect(result).toEqual([{ id: 4 }]);
  });
});
