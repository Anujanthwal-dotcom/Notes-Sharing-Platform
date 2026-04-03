import {
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  NotFoundException,
  Req,
  Patch,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { Request } from 'express';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('data')
  getUserData(@Req() req: Request): User {
    if (!req.user) {
      throw new NotFoundException('Cannot find the user data.');
    }
    return req.user;
  }

  @Delete('delete')
  async deleteUser(@Req() req: Request): Promise<{ message: string }> {
    if (!req.user) {
      throw new NotFoundException('User not found');
    }
    await this.userService.deleteUser(req.user.id);
    return {
      message: `User with ID ${req.user.id} was successfully deleted.`,
    };
  }

  @Patch('update')
  async updateUser(
    @Body() updateData: Partial<UserDto>,
    @Req() req: Request,
  ): Promise<UserDto> {
    if (!req.user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.userService.updateUser(
      req.user.id,
      updateData,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as UserDto;
  }
}
