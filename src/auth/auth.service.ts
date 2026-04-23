import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultAdmin();
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
  }): Promise<Omit<User, 'password'>> {
    return this.createUser(data, 'user');
  }

  async createUser(
    data: { name: string; email: string; password: string; role?: 'admin' | 'user' },
    role: 'admin' | 'user' = 'user',
  ): Promise<Omit<User, 'password'>> {
    const email = data.email.toLowerCase().trim();
    const existingUser = await this.usersRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      name: data.name,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.sanitizeUser(savedUser);
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{
    access_token: string;
    token: string;
    user: Omit<User, 'password'>;
  }> {
    const email = data.email.toLowerCase().trim();
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      token: accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async getUserById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async getAllUsers(): Promise<Array<Omit<User, 'password'>>> {
    const users = await this.usersRepository.find({ order: { id: 'ASC' } });
    return users.map((user) => this.sanitizeUser(user));
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.usersRepository.delete(id);
    return !!result.affected;
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password: _password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private async ensureDefaultAdmin() {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = this.usersRepository.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await this.usersRepository.save(adminUser);
  }
}
