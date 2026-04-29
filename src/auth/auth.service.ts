import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../users/roles.enum';

const DEMO_ADMIN_EMAILS = ['admin@gmail.com'];

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // ✅ REGISTER
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    const user = await this.createUser(
      data,
      this.resolveRoleForEmail(data.email, data.role || Role.USER),
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      role: user.role, // ✅ frontend uses this
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ✅ CREATE USER
  async createUser(
    data: { name: string; email: string; password: string; role?: Role },
    role: Role = Role.USER,
  ) {
    const email = data.email.toLowerCase().trim();

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

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

    return this.usersRepository.save(user);
  }

  // ✅ LOGIN (FIXED + CLEAN)
  async login(data: { email: string; password: string }) {
    const email = data.email.toLowerCase().trim();

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const expectedRole = this.resolveRoleForEmail(email, user.role);
    if (user.role !== expectedRole) {
      user.role = expectedRole;
      await this.usersRepository.save(user);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      role: user.role, // ✅ IMPORTANT for frontend redirect
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ✅ GET USER
  async getUserById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
    });

    return users.map((u) => this.sanitizeUser(u));
  }

  async deleteUser(id: number) {
    const result = await this.usersRepository.delete(id);
    return !!result.affected;
  }

  // ✅ CLEAN OUTPUT
  private sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }

  private resolveRoleForEmail(email: string, fallbackRole: Role) {
    return DEMO_ADMIN_EMAILS.includes(email.toLowerCase().trim())
      ? Role.ADMIN
      : fallbackRole;
  }
}
