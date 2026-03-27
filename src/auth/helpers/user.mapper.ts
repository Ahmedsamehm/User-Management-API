import { IUser } from 'src/common/interfaces/user.interfaces';
import { User } from 'src/user/entities/user.entity';

export class UserMapper {
  static toResponse(user: User): Partial<IUser> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  static toResponseArray(users: User[]): Partial<IUser>[] {
    return users.map((user) => this.toResponse(user));
  }
}
