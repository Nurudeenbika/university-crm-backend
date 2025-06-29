import { DataSource } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

export async function seedSampleCourses(dataSource: DataSource): Promise<void> {
  const courseRepository = dataSource.getRepository(Course);
  const userRepository = dataSource.getRepository(User);

  // Check if courses already exist
  const existingCourses = await courseRepository.count();
  if (existingCourses > 0) {
    console.log('Sample courses already exist, skipping seed');
    return;
  }

  // Get lecturer
  const lecturer = await userRepository.findOne({
    where: { role: UserRole.LECTURER as unknown as User['role'] },
  });

  if (!lecturer) {
    console.log('No lecturer found, skipping course seed');
    return;
  }

  const sampleCourses = [
    {
      title: 'Introduction to Computer Science',
      description:
        'Fundamental concepts of computer science including programming, algorithms, and data structures.',
      credits: 4,
      lecturerId: lecturer.id,
    },
    {
      title: 'Database Management Systems',
      description:
        'Design and implementation of database systems, SQL, and database optimization.',
      credits: 3,
      lecturerId: lecturer.id,
    },
    {
      title: 'Web Development',
      description:
        'Modern web development using HTML, CSS, JavaScript, and popular frameworks.',
      credits: 3,
      lecturerId: lecturer.id,
    },
    {
      title: 'Data Structures and Algorithms',
      description:
        'Advanced study of data structures, algorithm design, and complexity analysis.',
      credits: 4,
      lecturerId: lecturer.id,
    },
    {
      title: 'Software Engineering',
      description:
        'Software development lifecycle, design patterns, and project management.',
      credits: 3,
      lecturerId: lecturer.id,
    },
  ];

  for (const courseData of sampleCourses) {
    const course = courseRepository.create(courseData);
    await courseRepository.save(course);
    console.log(`Created course: ${courseData.title}`);
  }
}
