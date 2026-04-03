import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('course') // Explicitly naming the table 'course'
export class Course {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  course: string;
}
