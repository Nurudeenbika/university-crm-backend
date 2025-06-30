import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { RecommendCoursesDto, GenerateSyllabusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto';

@ApiTags('AI Assistant')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('recommend')
  @UseGuards(RolesGuard)
  @Roles(UserRole.student)
  recommendCourses(@Body() recommendDto: RecommendCoursesDto, @Request() req) {
    return this.aiService.recommendCourses(recommendDto, req.user);
  }

  @Post('syllabus')
  @UseGuards(RolesGuard)
  @Roles(UserRole.lecturer, UserRole.admin)
  generateSyllabus(@Body() syllabusDto: GenerateSyllabusDto) {
    return this.aiService.generateSyllabus(syllabusDto);
  }
}
