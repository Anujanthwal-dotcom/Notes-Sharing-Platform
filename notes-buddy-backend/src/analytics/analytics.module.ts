import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { UserModule } from '../user/user.module';
import { NoteModule } from '../note/note.module';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  imports: [UserModule, NoteModule],
})
export class AnalyticsModule {}
