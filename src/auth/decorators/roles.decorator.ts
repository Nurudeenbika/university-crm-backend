import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../dto';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
