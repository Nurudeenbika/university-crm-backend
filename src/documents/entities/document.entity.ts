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

export enum DocumentType {
  SYLLABUS = 'syllabus',
  ASSIGNMENT = 'assignment',
  TRANSCRIPT = 'transcript',
  GENERAL = 'general',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  filepath: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.GENERAL,
  })
  type: DocumentType;

  @Column({ nullable: true })
  description: string;

  @Column()
  uploadedById: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
