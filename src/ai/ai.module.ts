// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Course, Enrollment, User]),
    CoursesModule,
    EnrollmentsModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
