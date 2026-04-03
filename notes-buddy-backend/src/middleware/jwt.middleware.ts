import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }
    const token = authHeader.split(' ')[1];

    try {
      const payload: { sub: number; email: string } =
        await this.jwtService.verifyAsync(token);

      const user = await this.userService.findOne(payload.email);

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }
      req.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', error);
    }
  }
}
