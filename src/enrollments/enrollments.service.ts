import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from './dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/dto';
import { CoursesService } from '../courses/courses.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    private coursesService: CoursesService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async enroll(
    createEnrollmentDto: CreateEnrollmentDto,
    user: User,
  ): Promise<Enrollment> {
    const course = await this.coursesService.findOne(
      createEnrollmentDto.courseId,
    );

    const existingEnrollment = await this.enrollmentsRepository.findOne({
      where: {
        courseId: createEnrollmentDto.courseId,
        studentId: user.id,
        status: EnrollmentStatus.APPROVED,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    const enrollment = this.enrollmentsRepository.create({
      ...createEnrollmentDto,
      studentId: user.id,
    });

    const savedEnrollment = await this.enrollmentsRepository.save(enrollment);

    // Send real-time notification
    this.notificationsGateway.sendToUser(user.id, {
      type: 'enrollment_created',
      message: `Enrollment request sent for course: ${course.title}`,
      data: savedEnrollment,
    });

    return savedEnrollment;
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      relations: ['student', 'course', 'course.lecturer'],
    });
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { studentId },
      relations: ['course', 'course.lecturer'],
    });
  }

  async updateStatus(
    id: number,
    updateEnrollmentDto: UpdateEnrollmentDto,
    user: User,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['student', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update enrollment status');
    }

    await this.enrollmentsRepository.update(id, updateEnrollmentDto);
    const updatedEnrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['student', 'course'],
    });

    if (!updatedEnrollment) {
      throw new NotFoundException('Enrollment not found after update');
    }

    // Send real-time notification
    this.notificationsGateway.sendToUser(enrollment.studentId, {
      type: 'enrollment_updated',
      message: `Enrollment status updated to: ${updateEnrollmentDto.status}`,
      data: updatedEnrollment,
    });

    return updatedEnrollment;
  }

  async drop(courseId: number, user: User): Promise<void> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: {
        courseId,
        studentId: user.id,
        status: EnrollmentStatus.APPROVED,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.enrollmentsRepository.update(enrollment.id, {
      status: EnrollmentStatus.DROPPED,
    });

    // Send real-time notification
    this.notificationsGateway.sendToUser(user.id, {
      type: 'enrollment_dropped',
      message: `Successfully dropped from course`,
      data: { courseId },
    });
  }
}
