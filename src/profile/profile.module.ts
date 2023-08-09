import { Module, forwardRef } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { AuthModule } from '../auth/auth.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Profile]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService, TypeOrmModule],
})
export class ProfileModule {}
