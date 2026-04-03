import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { noteProvider } from './providers/note.provider';
import { DatabaseModule } from '../database/database.module';
import { ScannerModule } from '../scanner/scanner.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  controllers: [NoteController],
  providers: [NoteService, noteProvider],
  imports: [DatabaseModule, ScannerModule, StorageModule],
  exports: [NoteService],
})
export class NoteModule {}
