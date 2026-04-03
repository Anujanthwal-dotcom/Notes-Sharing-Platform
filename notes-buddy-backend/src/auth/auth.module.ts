import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { CryptoModule } from '../crypto/crypto.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { CollegeModule } from '../college/college.module';
import { CourseModule } from '../course/course.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UserModule,
    CryptoModule,
    EmailModule,
    CollegeModule,
    CourseModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SALT'),
        signOptions: {
          expiresIn: '1y',
        },
      }),
    }),
  ],
})
export class AuthModule {}
