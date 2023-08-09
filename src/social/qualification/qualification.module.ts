import { Module } from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { QualificationController } from './qualification.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Qualification } from './entities/qualification.entity';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Qualification]),
    AuthModule,
    PostModule,
  ],
  controllers: [QualificationController],
  providers: [QualificationService],
  exports: [QualificationService, TypeOrmModule],
})
export class QualificationModule {}
