import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';

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
      status: 'lost' | 'found';
      contact: string;
    },
    user: { id: number; role: 'admin' | 'user' },
  ) {
    const item = this.itemsRepository.create({
      title: data.title || data.name || 'Untitled item',
      description: data.description,
      location: data.location,
      image: data.image,
      status: data.status,
      contact: data.contact,
      reportedByUserId: user.id,
      approvalStatus: user.role === 'admin' ? 'approved' : 'pending',
    });

    return this.itemsRepository.save(item);
  }

  async findAll() {
    return this.itemsRepository.find({
      where: { approvalStatus: 'approved' },
      order: { id: 'DESC' },
    });
  }

  async findAllForAdmin() {
    return this.itemsRepository.find({
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

  async approve(id: number) {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    item.approvalStatus = 'approved';
    return this.itemsRepository.save(item);
  }

  async remove(id: number) {
    await this.itemsRepository.delete(id);
    return { deleted: true };
  }
}
