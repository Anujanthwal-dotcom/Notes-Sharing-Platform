import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('colleges')
export class College {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  college_name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  college_code: string;
}
