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
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<{
    access_token: string;
    user: { id: number; email: string; role: UserRole };
  }> {
    const user = await this.createUser(data, data.role || UserRole.USER);
    const normalizedRole = String(user.role || UserRole.USER).toLowerCase() as UserRole;

    const payload = {
      id: user.id,
      sub: user.id,
      email: user.email,
      role: normalizedRole,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: normalizedRole,
      },
    };
  }

  async createUser(
    data: { name: string; email: string; password: string; role?: UserRole },
    role: UserRole = UserRole.USER,
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
    user: { id: number; email: string; role: UserRole };
  }> {
    const email = data.email.toLowerCase().trim();
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const normalizedRole = String(user.role || UserRole.USER).toLowerCase() as UserRole;
    const payload = {
      id: user.id,
      sub: user.id,
      email: user.email,
      role: normalizedRole,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: normalizedRole,
      },
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

}
