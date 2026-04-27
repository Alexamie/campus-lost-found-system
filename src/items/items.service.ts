import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';

type ItemStatus = 'lost' | 'found';
type UserRole = 'user';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(
    data: {
      title?: string;
      name?: string;
      description: string;
      location: string;
      image?: string;
      status: ItemStatus;
      contact: string;
    },
    user: { id: number; role: UserRole },
  ) {
    const item = this.itemsRepository.create({
      title: data.title || data.name || 'Untitled item',
      description: data.description,
      location: data.location,
      image: data.image,
      status: data.status,
      contact: data.contact,
      reportedByUserId: user.id,
      approvalStatus: 'approved',
    });

    return this.itemsRepository.save(item);
  }

  async findAll() {
    return this.itemsRepository.find({
      where: { approvalStatus: 'approved' },
      order: { id: 'DESC' },
    });
  }

  async findByReporter(userId: number) {
    return this.itemsRepository.find({
      where: { reportedByUserId: userId },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const item = await this.itemsRepository.findOne({
      where: { id, approvalStatus: 'approved' },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async findOneForActor(id: number, actor: { id: number; role: UserRole }) {
    const item = await this.itemsRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const canAccess =
      item.approvalStatus === 'approved' ||
      item.reportedByUserId === actor.id;

    if (!canAccess) {
      throw new UnauthorizedException('You do not have access to this item');
    }

    return item;
  }

  async approve(id: number) {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    item.approvalStatus = 'approved';
    return this.itemsRepository.save(item);
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      location: string;
      image?: string;
      status: ItemStatus;
      contact: string;
      approvalStatus: 'pending' | 'approved';
    }>,
  ) {
    const item = await this.itemsRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    Object.assign(item, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.location !== undefined ? { location: data.location } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.contact !== undefined ? { contact: data.contact } : {}),
      ...(data.approvalStatus !== undefined
        ? { approvalStatus: data.approvalStatus }
        : {}),
    });

    return this.itemsRepository.save(item);
  }

  async remove(id: number) {
    const result = await this.itemsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Item not found');
    }

    return { deleted: true };
  }
}
