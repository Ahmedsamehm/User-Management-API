export interface IUser {
  id: string;
  email: string;
  name: string;
  //   role: UserRole;
  password: string; // اختياري عشان الـ Serialization
}
