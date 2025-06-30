import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto, user: User): Promise<Course> {
    const course = this.coursesRepository.create({
      ...createCourseDto,
      lecturerId: user.id,
    });
    return this.coursesRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find({
      relations: ['lecturer'],
    });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['lecturer', 'enrollments', 'enrollments.student'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    user: User,
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (user.role !== UserRole.admin && course.lecturerId !== user.id) {
      throw new ForbiddenException('You can only update your own courses');
    }

    await this.coursesRepository.update(id, updateCourseDto);
    return this.findOne(id);
  }

  async remove(id: number, user: User): Promise<void> {
    const course = await this.findOne(id);

    if (user.role !== UserRole.admin && course.lecturerId !== user.id) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.coursesRepository.delete(id);
  }

  async uploadSyllabus(
    id: number,
    filePath: string,
    user: User,
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (user.role !== UserRole.admin && course.lecturerId !== user.id) {
      throw new ForbiddenException(
        'You can only upload syllabus to your own courses',
      );
    }

    await this.coursesRepository.update(id, { syllabusPath: filePath });
    return this.findOne(id);
  }
}
