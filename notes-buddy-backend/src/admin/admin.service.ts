// src/admin/admin.service.ts
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { NoteService } from '../note/note.service';
import { StorageService } from '../storage/storage.service';
import { AnalyticsDto } from '../analytics/dto/analytics.dto';
import { CollegeService } from '../college/college.service'; // ✅ Correct package
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../constant/constants';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly userService: UserService,
    private readonly notesService: NoteService,
    private readonly collegeService: CollegeService,
    private readonly storageService: StorageService,
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  async getAnalytics(): Promise<AnalyticsDto> {
    const userCount = await this.userService.getUserCount();
    const notesCount = await this.notesService.getNotesCount();

    return {
      userCount,
      notesCount,
    };
  }

  async resetApplication(): Promise<{ message: string }> {
    this.logger.warn('🚨 Application reset initiated!');

    try {
      // 1. Wipe Physical Files (MinIO)
      await this.storageService.emptyBucket();

      // 2. Wipe Database Records (Child first, Parent second)
      // await this.notesService.deleteAllNotes();
      // await this.userService.deleteAllUsers();
      // await this.collegeService.deleteAllColleges();

      await this.dataSource.query(`
        TRUNCATE TABLE "notes", "users", "colleges", "course" RESTART IDENTITY CASCADE;
      `);
      this.logger.log('✅ Application reset successful.');
      return {
        message: 'Application data and storage have been completely reset.',
      };
    } catch (error) {
      this.logger.error(
        'CRITICAL: Application reset failed mid-process',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to complete application reset. System may be in unstable state.',
      );
    }
  }
}
