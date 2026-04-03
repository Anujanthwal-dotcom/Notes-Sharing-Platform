import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { COLLEGE_REPOSITORY } from '../constant/constants';
import { Repository } from 'typeorm';
import { College } from './entities/college.entity';

@Injectable()
export class CollegeService {
  private readonly logger = new Logger(CollegeService.name);

  constructor(
    @Inject(COLLEGE_REPOSITORY)
    private readonly collegeRepository: Repository<College>,
  ) {}

  async saveCollege(college: string, code: string): Promise<College> {
    try {
      const existingCollege = await this.collegeRepository.findOne({
        where: {
          college_name: college,
        },
      });

      if (existingCollege) {
        return existingCollege;
      }

      const obj = new College();
      obj.college_name = college;
      obj.college_code = code;

      return await this.collegeRepository.save(obj);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to save college: ${college}`, error.stack);

      throw new InternalServerErrorException(
        'An error occurred while trying to save the college.',
      );
    }
  }

  async getAllCollege(): Promise<College[]> {
    try {
      return await this.collegeRepository.find();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error('Failed to retrieve colleges', error.stack);
      throw new InternalServerErrorException(
        'Could not fetch colleges from the database at this time.',
      );
    }
  }

  async deleteAllColleges(): Promise<void> {
    await this.collegeRepository.deleteAll();
    this.logger.log('⚠️ All users deleted from database.');
  }
}
