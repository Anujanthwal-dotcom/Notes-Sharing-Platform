import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { NoteModule } from '../note/note.module';
import { StorageModule } from '../storage/storage.module';
import { CollegeModule } from '../college/college.module';
import { DatabaseModule } from '../database/database.module';
import { DataSource } from 'typeorm';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
    UserModule,
    NoteModule,
    StorageModule,
    CollegeModule,
    DatabaseModule,
  ],
})
export class AdminModule {}
