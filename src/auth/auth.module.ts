import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserController } from './user.controller';
import { User } from '../entities/user.entity';
import { RolesGuard } from './roles.guard';
import { ItemsModule } from '../items/items.module';
import { ClaimsModule } from '../claims/claims.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    ItemsModule,
    ClaimsModule,
    JwtModule.register({
      secret: 'your-secret-key', // Use env
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}
