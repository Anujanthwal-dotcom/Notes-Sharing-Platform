import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class RegistrationTokenDto {
  @IsString()
  @IsNotEmpty()
  registration_token: string;
}

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  collegeCode: string;

  @IsNotEmpty()
  @IsString()
  collegeName: string;

  @IsNotEmpty()
  @IsString()
  course: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  startYear: number;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  endYear: number;

  @IsNotEmpty()
  @IsString()
  registration_token: string;
}

export class AuthResponseDto {
  @IsString()
  access_token: string;
}
