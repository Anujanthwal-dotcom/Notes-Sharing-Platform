import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { College } from '../../college/entities/college.entity';
import { Exclude } from 'class-transformer';
import { Course } from '../../course/entities/course.entity';

@Entity('notes')
@Check(`"semester" > 0 AND "semester" < 12`)
export class Note {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: number;

  @Column({ type: 'smallint' })
  semester: number;

  @Column({ type: 'varchar', length: 150 })
  @Index()
  subject: string;

  @Column({ type: 'varchar', length: 255 })
  topic: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @Column({ nullable: false, type: 'varchar' })
  @Exclude()
  fileKey: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ nullable: false, type: 'varchar' })
  session: string;

  @ManyToOne(() => College)
  @JoinColumn({ name: 'college_id' })
  college: College;

  @ManyToOne(() => User, (user) => user.notes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
