import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../crypto/crypto.service';
import { User } from '../user/entities/user.entity';
import type {
  AuthResponseDto,
  RegistrationTokenDto,
  SignupDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EmailService } from '../email/email.service';
import * as otpGenerator from 'otp-generator';
import type { Cache } from 'cache-manager';
import { CollegeService } from '../college/college.service';
import { CourseService } from '../course/course.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly collegeService: CollegeService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private emailService: EmailService,
    private readonly courseService: CourseService,
  ) {}

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.userService.findOne(email);

    if (
      email === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const payload = { role: 'admin', email };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    }

    if (!user) {
      throw new BadRequestException('No user exists with the mentioned email.');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid Password');
    }
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signup(data: SignupDto): Promise<AuthResponseDto> {
    const name = data.name;
    const collegeName = data.collegeName.toLocaleLowerCase();
    const collegeCode = data.collegeCode;
    const password = data.password;
    const regToken = data.registration_token;
    const startYear = data.startYear;
    const endYear = data.endYear;

    try {
      const payload: { email: string; otp: string } =
        await this.jwtService.verifyAsync(regToken);
      const college = await this.collegeService.saveCollege(
        collegeName,
        collegeCode,
      );
      const course = await this.courseService.saveCourse(data.course);
      const user = {
        name,
        email: payload.email,
        password: password,
        course,
        startYear,
        endYear,
        college: college,
      };

      const dbUser = await this.userService.register(user as User);

      // save in frontend as access_token
      return {
        access_token: await this.jwtService.signAsync({
          email: dbUser.email,
          sub: dbUser.id,
        }),
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Registration Token is Invalid or expired.',
        error,
      );
    }

    // const dbUser = await this.userService.register(user);
    // const payload = { sub: dbUser.id, email: dbUser.email };
    // return {
    //   access_token: await this.jwtService.signAsync(payload),
    // };
  }

  async sendOTP(email: string): Promise<boolean> {
    const otp = otpGenerator.generate(8, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    await this.emailService.sendOtpEmail(email, otp);
    await this.cacheManager.set(email, otp, 600000);
    return true;
  }

  async verifyOTP(email: string, otp: string): Promise<RegistrationTokenDto> {
    const cacheOtp = await this.cacheManager.get<string>(email);

    if (!cacheOtp) {
      throw new InternalServerErrorException(
        'No OTP associated with this email.',
      );
    }

    if (otp != cacheOtp) {
      throw new BadRequestException('Invalid OTP is provided.');
    }

    //save this in frontend
    return {
      registration_token: await this.jwtService.signAsync({
        email: email,
        otp: otp,
      }),
    };
  }
}
