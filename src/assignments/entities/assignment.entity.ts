import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column()
  studentId: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  weight: number;

  @Column({ nullable: true })
  feedback: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @ManyToOne(() => Course, course => course.assignments)
  @JoinColumn({ name: 'courseId' })
  course: Promise<Course>;

  @ManyToOne(() => User, user => user.assignments)
  @JoinColumn({ name: 'studentId' })
  student: Promise<User>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
