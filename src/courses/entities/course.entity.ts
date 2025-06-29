import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  credits: number;

  @Column({ nullable: true })
  syllabusPath: string;

  @Column()
  lecturerId: number;

  @ManyToOne(() => User, user => user.courses)
  @JoinColumn({ name: 'lecturerId' })
  lecturer: Promise<User>;

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Promise<Enrollment[]>;

  @OneToMany(() => Assignment, assignment => assignment.course)
  assignments: Promise<Assignment[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
