import {
  IsEmail,
  IsString,
  IsInt,
  Min,
  Max,
  Length,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { College } from '../../college/entities/college.entity';
import { Course } from '../../course/entities/course.entity';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(1, 100)
  email: string;

  @IsNotEmpty()
  college: College;

  @IsNotEmpty()
  course: Course;

  @IsInt()
  @Min(1900)
  @Max(2100)
  startYear: number;

  @IsInt()
  @Min(1900)
  @Max(2100)
  endYear: number;
}
