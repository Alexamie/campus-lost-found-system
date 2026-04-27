import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { Item } from '../entities/item.entity';
import { User } from '../entities/user.entity';

type ClaimStatus = 'pending' | 'approved' | 'rejected';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private readonly claimsRepository: Repository<Claim>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    data: { itemId: number; message: string },
    user: { id: number },
  ) {
    const item = await this.itemsRepository.findOne({
      where: { id: data.itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== 'found' || item.approvalStatus !== 'approved') {
      throw new BadRequestException('Only approved found items can be claimed');
    }

    const existingClaim = await this.claimsRepository.findOne({
      where: {
        itemId: data.itemId,
        userId: user.id,
      },
      order: { id: 'DESC' },
    });

    if (existingClaim && existingClaim.status === 'pending') {
      throw new BadRequestException('You already have a pending claim for this item');
    }

    const claim = this.claimsRepository.create({
      itemId: data.itemId,
      userId: user.id,
      message: data.message,
      status: 'pending',
    });

    const savedClaim = await this.claimsRepository.save(claim);
    return this.mapClaim(savedClaim, item);
  }

  async findAll() {
    const claims = await this.claimsRepository.find({
      order: { id: 'DESC' },
    });
    return this.mapClaims(claims);
  }

  async findByUser(userId: number) {
    const claims = await this.claimsRepository.find({
      where: { userId },
      order: { id: 'DESC' },
    });
    return this.mapClaims(claims);
  }

  async updateStatus(id: number, status: ClaimStatus) {
    const claim = await this.claimsRepository.findOne({ where: { id } });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    claim.status = status;
    const savedClaim = await this.claimsRepository.save(claim);
    return this.mapClaim(savedClaim);
  }

  async approve(id: number) {
    return this.updateStatus(id, 'approved');
  }

  async reject(id: number) {
    return this.updateStatus(id, 'rejected');
  }

  async remove(id: number) {
    const claim = await this.claimsRepository.findOne({ where: { id } });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    await this.claimsRepository.remove(claim);
    return { deleted: true };
  }

  private async mapClaims(claims: Claim[]) {
    if (!claims.length) {
      return [];
    }

    const itemIds = [...new Set(claims.map((claim) => claim.itemId))];
    const userIds = [...new Set(claims.map((claim) => claim.userId))];

    const [items, users] = await Promise.all([
      this.itemsRepository.find({
        where: { id: In(itemIds) },
      }),
      this.usersRepository.find({
        where: { id: In(userIds) },
      }),
    ]);

    const itemsById = new Map(items.map((item) => [item.id, item]));
    const usersById = new Map(users.map((user) => [user.id, user]));

    return claims.map((claim) =>
      this.mapClaim(
        claim,
        itemsById.get(claim.itemId),
        usersById.get(claim.userId),
      ),
    );
  }

  private mapClaim(claim: Claim, item?: Item, user?: User) {
    return {
      ...claim,
      itemTitle: item?.title ?? null,
      itemDescription: item?.description ?? null,
      itemStatus: item?.status ?? null,
      claimantName: user?.name ?? null,
      claimantEmail: user?.email ?? null,
    };
  }
}
