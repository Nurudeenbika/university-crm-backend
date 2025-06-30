import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

export async function seedDefaultUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Check if users already exist
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@university.edu' },
  });

  if (existingAdmin) {
    console.log('Default users already exist, skipping seed');
    return;
  }

  const defaultUsers = [
    {
      email: 'admin@university.edu',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.admin,
    },
    {
      email: 'lecturer@university.edu',
      password: await bcrypt.hash('lecturer123', 10),
      firstName: 'John',
      lastName: 'Lecturer',
      role: UserRole.lecturer,
    },
    {
      email: 'student@university.edu',
      password: await bcrypt.hash('student123', 10),
      firstName: 'Jane',
      lastName: 'Student',
      role: UserRole.student,
    },
  ];

  for (const userData of defaultUsers) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
    console.log(`Created user: ${userData.email} (${userData.role})`);
  }
}
