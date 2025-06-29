import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, GradeAssignmentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto';

@ApiTags('Assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  create(@Body() createAssignmentDto: CreateAssignmentDto, @Request() req) {
    return this.assignmentsService.create(createAssignmentDto, req.user);
  }

  @Get('course/:courseId')
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req,
  ) {
    return this.assignmentsService.findByCourse(courseId, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id/grade')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  grade(
    @Param('id', ParseIntPipe) id: number,
    @Body() gradeAssignmentDto: GradeAssignmentDto,
    @Request() req,
  ) {
    return this.assignmentsService.grade(id, gradeAssignmentDto, req.user);
  }

  @Post(':id/upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  uploadFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.assignmentsService.uploadFile(id, file.path, req.user);
  }
}
