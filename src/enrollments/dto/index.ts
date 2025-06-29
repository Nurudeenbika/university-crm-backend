import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../entities/enrollment.entity';

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsNumber()
  courseId: number;
}

export class UpdateEnrollmentDto {
  @ApiProperty({ enum: EnrollmentStatus })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  finalGrade?: number;
}
