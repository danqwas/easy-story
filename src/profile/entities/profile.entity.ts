import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  userName: string;

  @Column('text', {
    default: '',
  })
  biography: string;

  @Column('text')
  url: string;

  @OneToOne(() => User, (user) => user.profile, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  user: User;
}
