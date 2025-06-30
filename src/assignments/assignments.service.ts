import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, IsNull } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto, GradeAssignmentDto } from './dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/dto';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EnrollmentStatus } from '../enrollments/entities/enrollment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    private coursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    createAssignmentDto: CreateAssignmentDto,
    user: User,
  ): Promise<Assignment> {
    const course = await this.coursesService.findOne(
      createAssignmentDto.courseId,
    );

    // Check if student is enrolled in the course
    const enrollments = await this.enrollmentsService.findByStudent(user.id);
    const enrollment = enrollments.find(
      e =>
        e.courseId === createAssignmentDto.courseId &&
        e.status === EnrollmentStatus.APPROVED,
    );

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    const assignment = this.assignmentsRepository.create({
      ...createAssignmentDto,
      studentId: user.id,
      submittedAt: new Date(),
    });

    const savedAssignment = await this.assignmentsRepository.save(assignment);

    // Send notification to lecturer
    this.notificationsGateway.sendToUser(course.lecturerId, {
      type: 'assignment_submitted',
      message: `New assignment submitted for ${course.title}`,
      data: savedAssignment,
    });

    return savedAssignment;
  }

  async findByCourse(courseId: number, user: User): Promise<Assignment[]> {
    const course = await this.coursesService.findOne(courseId);

    // Check access permissions
    if (user.role === UserRole.student) {
      return this.assignmentsRepository.find({
        where: { courseId, studentId: user.id },
        relations: ['course'],
      });
    } else if (
      user.role === UserRole.lecturer &&
      course.lecturerId !== user.id
    ) {
      throw new ForbiddenException(
        'You can only view assignments for your courses',
      );
    }

    return this.assignmentsRepository.find({
      where: { courseId },
      relations: ['student', 'course'],
    });
  }

  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
      relations: ['student', 'course'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async grade(
    id: number,
    gradeAssignmentDto: GradeAssignmentDto,
    user: User,
  ): Promise<Assignment> {
    const assignment = await this.findOne(id);

    const course = await assignment.course;

    if (user.role !== UserRole.admin && course.lecturerId !== user.id) {
      throw new ForbiddenException(
        'You can only grade assignments for your courses',
      );
    }

    await this.assignmentsRepository.update(id, gradeAssignmentDto);
    const gradedAssignment = await this.findOne(id);

    // Calculate and update course final grade
    await this.updateCourseGrade(assignment.courseId, assignment.studentId);

    // Send notification to student
    this.notificationsGateway.sendToUser(assignment.studentId, {
      type: 'assignment_graded',
      message: `Assignment "${assignment.title}" has been graded`,
      data: gradedAssignment,
    });

    return gradedAssignment;
  }

  async uploadFile(
    id: number,
    filePath: string,
    user: User,
  ): Promise<Assignment> {
    const assignment = await this.findOne(id);

    if (assignment.studentId !== user.id) {
      throw new ForbiddenException(
        'You can only upload files to your own assignments',
      );
    }

    await this.assignmentsRepository.update(id, { filePath });
    return this.findOne(id);
  }

  private async updateCourseGrade(
    courseId: number,
    studentId: number,
  ): Promise<void> {
    const assignments = await this.assignmentsRepository.find({
      where: { courseId, studentId, grade: Not(IsNull()) },
    });

    if (assignments.length === 0) return;

    const totalWeightedScore = assignments.reduce(
      (sum, assignment) => sum + assignment.grade * assignment.weight,
      0,
    );
    const totalWeight = assignments.reduce(
      (sum, assignment) => sum + assignment.weight,
      0,
    );

    const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // Update enrollment with final grade
    const enrollments = await this.enrollmentsService.findByStudent(studentId);
    const enrollment = enrollments.find(e => e.courseId === courseId);

    if (enrollment) {
      await this.enrollmentsService.updateStatus(
        enrollment.id,
        {
          status: enrollment.status,
          finalGrade,
        },
        { role: UserRole.admin } as User,
      );
    }
  }
}
