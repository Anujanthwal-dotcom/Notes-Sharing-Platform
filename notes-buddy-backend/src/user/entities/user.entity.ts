import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Check,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Search } from '../../search/entities/search.entity';
import { Note } from '../../note/entities/note.entity';
import { College } from '../../college/entities/college.entity';
import { Exclude } from 'class-transformer';
import { Course } from '../../course/entities/course.entity';

@Entity('users')
@Unique(['email'])
@Check(`"end_year" > "start_year"`)
export class User {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: number;

  @Column({ type: 'varchar', length: 100, default: 'ANONYMOUS' })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @ManyToOne(() => College, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'college_id' })
  college: College;

  @Column({ name: 'start_year', type: 'int' })
  startYear: number;

  @Column({ name: 'end_year', type: 'int' })
  endYear: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // --- Relationships ---
  @OneToMany(() => Search, (search) => search.user)
  searches: Search[];

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  // --- Auditing ---
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
