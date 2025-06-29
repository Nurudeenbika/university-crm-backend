// src/ai/dto/index.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class RecommendCoursesDto {
  @IsString()
  interests: string;

  @IsOptional()
  @IsNumber()
  maxRecommendations?: number = 5;
  completedCourses?: string[];
}

export class GenerateSyllabusDto {
  @IsString()
  courseTitle: string;
  topic: string;
  duration: string;
  level: string;

  @IsString()
  courseDescription: string;

  @IsOptional()
  @IsNumber()
  credits?: number = 3;

  @IsOptional()
  @IsNumber()
  weeks?: number = 16;

  @IsOptional()
  @IsString()
  difficulty?: string = 'intermediate';
  courseName: any;
  // duration: string;
  // level: string;
}

export class CourseRecommendationDto {
  id: number;
  title: string;
  description: string;
  credits: number;
  matchScore: number;
  reason: string;
}

export class SyllabusDto {
  courseTitle: string;
  courseDescription: string;
  credits: number;
  weeks: number;
  learningObjectives: string[];
  weeklyTopics: WeeklyTopicDto[];
  assessmentMethods: AssessmentMethodDto[];
  requiredMaterials: string[];
  gradingScale: GradingScaleDto[];
}

export class WeeklyTopicDto {
  week: number;
  topic: string;
  description: string;
  activities: string[];
}

export class AssessmentMethodDto {
  type: string;
  weight: number;
  description: string;
}

export class GradingScaleDto {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
}

export class PlagiarismCheckDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  courseId?: number;

  @IsOptional()
  @IsNumber()
  assignmentId?: number;
}

export class PlagiarismResultDto {
  similarity: number;
  sources: PlagiarismSourceDto[];
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
}

export class PlagiarismSourceDto {
  source: string;
  similarity: number;
  matchedText: string[];
}

// import { IsString, IsArray, IsOptional } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class RecommendCoursesDto {
//   @ApiProperty()
//   @IsString()
//   interests: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   completedCourses?: string[];
// }

// export class GenerateSyllabusDto {
//   @ApiProperty()
//   @IsString()
//   courseName: string;

//   @ApiProperty()
//   @IsString()
//   topic: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   duration?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   level?: string;
// }
