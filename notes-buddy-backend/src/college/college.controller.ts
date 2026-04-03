import { Controller } from '@nestjs/common';
import { CollegeService } from './college.service';
import { Get } from '@nestjs/common';

@Controller('college')
export class CollegeController {
  constructor(private readonly collegeService: CollegeService) {}

  @Get('list')
  async getColleges(){
    return await this.collegeService.getAllCollege();
  }
}
