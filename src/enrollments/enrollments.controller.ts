import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto';

@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post('enroll')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  enroll(@Body() createEnrollmentDto: CreateEnrollmentDto, @Request() req) {
    return this.enrollmentsService.enroll(createEnrollmentDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('my-enrollments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  findMyEnrollments(@Request() req) {
    return this.enrollmentsService.findByStudent(req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @Request() req,
  ) {
    return this.enrollmentsService.updateStatus(
      id,
      updateEnrollmentDto,
      req.user,
    );
  }

  @Delete('drop/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  drop(@Param('courseId', ParseIntPipe) courseId: number, @Request() req) {
    return this.enrollmentsService.drop(courseId, req.user);
  }
}
