import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NOTE_REPOSITORY } from '../constant/constants';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { ScannerService } from '../scanner/scanner.service';
import { StorageService } from '../storage/storage.service';
import { User } from '../user/entities/user.entity';
import { Not } from 'typeorm';
import { SearchNotesDto } from '../search/dto/search.dto';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(NoteService.name);

  constructor(
    @Inject(NOTE_REPOSITORY) private readonly noteRepository: Repository<Note>,
    private readonly scannerService: ScannerService,
    private readonly storageService: StorageService, // Fixed naming from storageModule to storageService
  ) {}

  async getNotesCount(): Promise<number> {
    return await this.noteRepository.count();
  }

  async uploadFile(
    file: Express.Multer.File,
    sem: number,
    topic: string,
    subject: string,
    session: string,
    user: User,
  ) {
    await this.scannerService.scanBuffer(file.buffer, file.originalname);

    try {
      const fileKey = await this.storageService.upload(file, user.id);

      // 3. Save Metadata to Postgres
      const newNote = {
        fileKey: fileKey,
        semester: sem,
        course: user.course,
        topic: topic,
        subject: subject,
        session: session,
        user: user,
        college: user.college,
      };

      return await this.noteRepository.save(newNote);
    } catch (error) {
      this.logger.error(
        `Failed to process upload for ${file.originalname}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new InternalServerErrorException(
        'Upload failed during storage or database sync.',
      );
    }
  }

  /**
   * Used for the "Funnel" download
   */
  async getNoteFile(noteId: number) {
    const note = await this.noteRepository.findOneBy({ id: noteId });
    if (!note) return null;

    const stream = await this.storageService.getFileStream(note.fileKey);
    return { stream, note };
  }

  async getUserNotes(user: User) {
    return await this.noteRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: {
        college: true,
        course: true,
      },
    });
  }

  async getCollegeNotes(college: string, currentUserId: number) {
    return await this.noteRepository.find({
      where: {
        user: {
          college: {
            college_name: college,
          },
          id: Not(currentUserId),
        },
      },
      order: {
        createdAt: 'DESC', // Good practice: show the newest college notes first
      },
      relations: {
        college: true,
        course: true,
      },
    });
  }

  async deleteNotes(id: number, userId: number): Promise<void> {
    try {
      const note = await this.noteRepository.findOne({
        where: {
          id: id,
          user: {
            id: userId,
          },
        },
      });

      if (!note) {
        throw new UnauthorizedException(
          'You are not authorized to delete this note.',
        );
      }
      const result = await this.noteRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Notes with ID ${id} not found.`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to delete notes with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while attempting to delete the notes.',
      );
    }
  }

  async updateNote(
    id: number,
    userId: number,
    updateData: Partial<Note>,
  ): Promise<Note> {
    try {
      const existingNote = await this.noteRepository.findOne({
        where: { id },
        relations: {
          user: true,
        },
      });

      if (!existingNote) {
        throw new NotFoundException(`Note with ID ${id} not found.`);
      }

      // 3. Authorization check (Now safe because user is loaded)
      if (existingNote.user.id !== userId) {
        throw new UnauthorizedException(
          'You are not authorized to update this note.',
        );
      }

      // 4. Merge the update data into the existing entity
      // This keeps the existing relations intact while overwriting fields
      const noteToUpdate = this.noteRepository.merge(existingNote, updateData);

      // 5. Persist the changes
      return await this.noteRepository.save(noteToUpdate);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(`Failed to update note with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while attempting to update the note.',
      );
    }
  }

  async searchNotes(queryDto: SearchNotesDto) {
    const {
      searchTerm,
      semester,
      subject,
      session,
      page = 1,
      limit = 10,
    } = queryDto;

    const query = this.noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.user', 'user')
      .leftJoinAndSelect('note.course', 'course')
      .leftJoinAndSelect('note.college', 'college'); // Join the relations

    // 1. Text Search (Matches Subject OR Topic)
    if (searchTerm) {
      query.andWhere(
        '(note.subject ILIKE :searchTerm OR note.topic ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    // 2. Exact Match Filters
    if (semester) {
      query.andWhere('note.semester = :semester', { semester });
    }
    if (subject) {
      query.andWhere('note.subject = :subject', { subject });
    }
    if (session) {
      query.andWhere('note.session = :session', { session });
    }

    // 3. Pagination & Ordering
    query.skip((page - 1) * limit).take(limit);
    query.orderBy('note.createdAt', 'DESC');

    // 4. Execute Query
    const [notes, total] = await query.getManyAndCount();

    return {
      data: notes,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async deleteAllNotes(): Promise<void> {
    await this.noteRepository.deleteAll();
    this.logger.log('⚠️ All notes deleted from database.');
  }
}
