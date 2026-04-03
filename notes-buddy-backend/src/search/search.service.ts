// src/search/search.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { SEARCH_REPOSITORY } from '../constant/constants';
import { Repository } from 'typeorm';
import { Search } from './entities/search.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(SEARCH_REPOSITORY)
    private readonly searchRepository: Repository<Search>,
  ) {}

  async logSearch(user: User, searchTerm: string): Promise<void> {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;

    try {
      const existingSearch = await this.searchRepository.findOne({
        // Matches your entity's column name 'query'
        where: { query: term, user: { id: user.id } },
      });

      if (existingSearch) {
        // Update the timestamp to bring it to the top of recent searches
        existingSearch.timestamp = new Date();
        await this.searchRepository.save(existingSearch);
      } else {
        const newSearch = this.searchRepository.create({
          query: term,
          user: user,
        });
        await this.searchRepository.save(newSearch);
      }
    } catch (error) {
      this.logger.error(
        `Failed to log search for user ${user.id}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
    }
  }

  async getRecentSearches(user: User, limit: number = 5): Promise<string[]> {
    const searches = await this.searchRepository.find({
      where: { user: { id: user.id } },
      order: { timestamp: 'DESC' }, // Matches your 'timestamp' column
      take: limit,
    });

    // Return an array of strings to the frontend
    return searches.map((s) => s.query);
  }
}
