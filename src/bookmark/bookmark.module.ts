import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PostModule } from 'src/social/post/post.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Bookmark]),
    AuthModule,
    PostModule,
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService, TypeOrmModule],
})
export class BookmarkModule {}
