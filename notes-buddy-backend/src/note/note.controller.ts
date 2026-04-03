import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  Param,
  NotFoundException,
  InternalServerErrorException,
  Delete,
  Patch,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { Note } from './entities/note.entity';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadNotes(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('semester', ParseIntPipe) sem: number,
    @Body('topic') topic: string,
    @Body('subject') subject: string,
    @Body('session') session: string,
    @Req() req: Request,
  ) {
    return await this.noteService.uploadFile(
      file,
      sem,
      topic,
      subject,
      session,
      req.user!,
    );
  }

  @Get('my-notes')
  async getUserNotes(@Req() req: Request) {
    return await this.noteService.getUserNotes(req.user!);
  }

  @Get('download/:id')
  async downloadNote(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const result = await this.noteService.getNoteFile(id);

    if (!result) {
      throw new NotFoundException('The requested note does not exist.');
    }

    const { stream, note } = result;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${note.topic || 'note'}.pdf"`,
    });

    stream.pipe(res);
  }

  //this is going to be used for recommendation at home page.
  @Get('college-notes')
  async getCollegeNotes(@Req() req: Request) {
    if (!req.user) {
      throw new InternalServerErrorException('Cannot find user data.');
    }
    return await this.noteService.getCollegeNotes(
      req.user.college.college_name,
      req.user.id,
    );
  }

  @Patch(':id')
  async updateNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Note>,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new NotFoundException('Cannot find the user data.');
    }
    return await this.noteService.updateNote(id, req.user.id, updateData);
  }

  @Delete(':id')
  async deleteNotes(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    if (!req.user) {
      throw new NotFoundException('Cannot find the user data.');
    }
    await this.noteService.deleteNotes(id, req.user.id);

    return {
      message: `User with ID ${id} was successfully deleted.`,
    };
  }
}
