import { UserRole } from 'src/user/enums/userRoles';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string; // اختياري عشان الـ Serialization
}

export interface IActiveUser {
  sub: string;
  email: string;
  role: UserRole;
}
