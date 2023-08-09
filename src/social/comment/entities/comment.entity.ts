import { User } from 'src/auth/entities/user.entity';
import { Post } from '../../post/entities/post.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false })
  content: string;

  @ManyToOne(() => Post, (post) => post.comments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  post: Post;
  @ManyToOne(() => User, (user) => user.comments)
  user: User;
}
