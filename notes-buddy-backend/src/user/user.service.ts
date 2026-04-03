import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../constant/constants';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
      relations: {
        college: true,
        course: true,
      },
    });
  }

  async register(user: User): Promise<User> {
    user.password = await this.cryptoService.encrypt(user.password);
    return await this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to delete user with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while attempting to delete the user.',
      );
    }
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    try {
      if (updateData.password) {
        updateData.password = await this.cryptoService.encrypt(
          updateData.password,
        );
      }
      const userToUpdate = await this.userRepository.preload({
        id: id,
        ...updateData,
      });

      if (!userToUpdate) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      return await this.userRepository.save(userToUpdate);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to update user with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while attempting to update the user.',
      );
    }
  }

  async getUserCount(): Promise<number> {
    return await this.userRepository.count();
  }

  async deleteAllUsers(): Promise<void> {
    await this.userRepository.deleteAll();
    this.logger.log('⚠️ All users deleted from database.');
  }
}
