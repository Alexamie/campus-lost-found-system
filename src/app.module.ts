import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ItemsModule } from './items/items.module';
import { ClaimsModule } from './claims/claims.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
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