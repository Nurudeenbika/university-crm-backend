import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsNumber()
  courseId: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class GradeAssignmentDto {
  @ApiProperty()
  @IsNumber()
  grade: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  feedback?: string;
}
