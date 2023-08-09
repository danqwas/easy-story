import { Qualification } from 'src/social/qualification/entities/qualification.entity';
import { User } from '../../../auth/entities/user.entity';
import { Comment } from '../../comment/entities/comment.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bookmark } from 'src/bookmark/entities/bookmark.entity';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    nullable: false,
  })
  title: string;

  @Column('text', {
    default: '',
  })
  content: string;

  @Column('text', {
    default: '',
  })
  imageUrl: string;

  @Column('text', {
    default: '',
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments?: Comment[];

  @OneToMany(() => Qualification, (qualification) => qualification.post)
  qualifications?: Qualification[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.post)
  bookmarks?: Bookmark[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
