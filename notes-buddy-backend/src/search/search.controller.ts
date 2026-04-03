// src/search/search.controller.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { NoteService } from '../note/note.service';
import { SearchNotesDto } from './dto/search.dto';
import type { Request } from 'express';

@Controller('search')
// @UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly noteService: NoteService, // Injected NoteService
  ) {}

  @Get()
  async executeSearch(@Query() queryDto: SearchNotesDto, @Req() req: Request) {
    const user = req.user!;

    // 1. Log the query asynchronously (Fire and forget)
    if (queryDto.searchTerm && user) {
      this.searchService.logSearch(user, queryDto.searchTerm).catch(() => {});
    }

    // 2. Return the matching notes
    return await this.noteService.searchNotes(queryDto);
  }

  @Get('history')
  async getSearchHistory(@Req() req: Request) {
    const user = req.user!;
    return await this.searchService.getRecentSearches(user);
  }
}
