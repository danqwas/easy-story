import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature([Comment]),
    PostModule,
    AuthModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService, TypeOrmModule],
})
export class CommentModule {}
