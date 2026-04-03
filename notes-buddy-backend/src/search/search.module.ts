import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { searchProvider } from './providers/search.provider';
import { DatabaseModule } from '../database/database.module';
import { NoteModule } from '../note/note.module';

@Module({
  controllers: [SearchController],
  providers: [SearchService, searchProvider],
  imports: [DatabaseModule, NoteModule],
})
export class SearchModule {}
