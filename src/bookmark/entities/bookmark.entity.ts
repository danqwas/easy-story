import { User } from 'src/auth/entities/user.entity';
import { Post } from 'src/social/post/entities/post.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'bookmarks' })
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bookmarks, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Post, (post) => post.bookmarks, {
    eager: true,
    onDelete: 'CASCADE',
  })
  post: Post;
}
