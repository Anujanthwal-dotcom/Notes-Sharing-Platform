import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('searches')
export class Search {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: string; // BigInt returns as string in JS

  @Column({ type: 'varchar', length: 255 })
  query: string;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User, (user) => user.searches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
