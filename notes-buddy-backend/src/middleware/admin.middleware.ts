import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload: { role: string; email: string } =
        await this.jwtService.verifyAsync(token);
      if (
        payload.email !== process.env.ADMIN_USERNAME ||
        payload.role !== 'admin'
      ) {
        throw new UnauthorizedException(
          'You are not authorized on these routes.',
        );
      }
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', error);
    }
  }
}
