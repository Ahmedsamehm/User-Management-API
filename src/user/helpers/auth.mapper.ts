import { UserMapper } from 'src/auth/helpers/user.mapper';
import { User } from 'src/user/entities/user.entity';

export class AuthMapper {
  static toLoginResponse(user: User, accessToken: string, refreshToken: string) {
    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    };
  }
}
