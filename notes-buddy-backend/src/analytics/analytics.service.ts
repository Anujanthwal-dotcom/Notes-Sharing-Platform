import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { NoteService } from '../note/note.service';
import { AnalyticsDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly userService: UserService,
    private readonly notesService: NoteService,
  ) {}

  async get(): Promise<AnalyticsDto> {
    const userCount = await this.userService.getUserCount();
    const notesCount = await this.notesService.getNotesCount();
    return {
      userCount,
      notesCount,
    };
  }
}
