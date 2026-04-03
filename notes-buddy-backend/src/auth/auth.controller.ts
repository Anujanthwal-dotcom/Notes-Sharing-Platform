import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, AuthResponseDto, SignupDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() data: AuthDto): Promise<AuthResponseDto> {
    return await this.authService.login(data.email, data.password);
  }

  @Post('signup')
  async signup(
    @Body()
    data: SignupDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.signup(data);
  }

  @Post('get-otp')
  async getOTP(@Body() data: { email: string }) {
    return await this.authService.sendOTP(data.email);
  }

  @Post('verify-otp')
  async verifyOTP(@Body() data: { email: string; otp: string }) {
    return await this.authService.verifyOTP(data.email, data.otp);
  }
}
