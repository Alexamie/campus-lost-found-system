import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Item } from '../entities/item.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async getDashboard(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const reports = await this.itemsRepository.find({
      where: { reportedByUserId: userId },
      order: { createdAt: 'DESC' },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      reports: reports.map(report => ({
        id: report.id,
        title: report.title,
        status: report.status,
        location: report.location,
        contact: report.contact,
        description: report.description,
        approvalStatus: report.approvalStatus,
        createdAt: report.createdAt,
      })),
    };
  }

  async findAll() {
    return this.usersRepository.find({ order: { id: 'ASC' } });
  }

  async findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: { name: string; email: string; password: string; role?: UserRole }) {
    const user = this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || UserRole.USER,
    });
    return this.usersRepository.save(user);
  }
}
