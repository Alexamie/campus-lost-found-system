import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AdminController } from './admin.controller';
import { UserController } from './user.controller';
import { User } from '../entities/user.entity';
import { Item } from '../entities/item.entity';
import { ItemsService } from '../items/items.service';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Item]),
    JwtModule.register({
      secret: 'your-secret-key', // Use env
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, AdminController, UserController],
  providers: [AuthService, JwtStrategy, ItemsService, RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}
