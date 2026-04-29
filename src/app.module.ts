import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';

import { ItemsModule } from './items/items.module';
import { ClaimsModule } from './claims/claims.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { User } from './entities/user.entity';
import { Item } from './entities/item.entity';
import { Claim } from './entities/claim.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Item, Claim],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ItemsModule,
    ClaimsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
