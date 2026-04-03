import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsDto {
  @IsNotEmpty({ message: 'User count is required' })
  @IsInt({ message: 'User count must be an integer' })
  @Min(0, { message: 'User count cannot be negative' })
  @Type(() => Number) // Ensures string "10" becomes number 10
  userCount: number;

  @IsNotEmpty({ message: 'Notes count is required' })
  @IsInt({ message: 'Notes count must be an integer' })
  @Min(0, { message: 'Notes count cannot be negative' })
  @Type(() => Number)
  notesCount: number;
}
