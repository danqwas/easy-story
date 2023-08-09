import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QualificationValue } from '../interfaces/qualification-value.interface';
import { Post } from 'src/social/post/entities/post.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity({ name: 'qualifications' })
export class Qualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric', { default: 0, nullable: false })
  value: QualificationValue;

  @ManyToOne(() => Post, (post) => post.qualifications, {
    eager: true,
    onDelete: 'CASCADE',
  })
  post: Post;

  @ManyToOne(() => User, (user) => user.qualifications, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;
}
