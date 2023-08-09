import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { CommonModule } from './common/common.module';
import { PostModule } from './social/post/post.module';
import { CommentModule } from './social/comment/comment.module';
import { QualificationModule } from './social/qualification/qualification.module';
import { BookmarkModule } from './bookmark/bookmark.module';
@Module({
  imports: [
    ConfigModule.forRoot({}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DB_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,

    ProfileModule,

    CommonModule,

    PostModule,

    CommentModule,

    QualificationModule,

    BookmarkModule,
  ],
})
export class AppModule {}
