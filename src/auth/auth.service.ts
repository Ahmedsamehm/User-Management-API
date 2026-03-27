import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { IActiveUser, IUser } from 'src/common/interfaces/user.interfaces';
import { UserService } from 'src/user/user.service';
import { LoginAuthDto } from './dto/login-auth-dto';
import { CryptoUtil } from 'src/common/utils/crypto.util';
import { JwtService } from '@nestjs/jwt';
import { AuthMapper } from 'src/user/helpers/auth.mapper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly cryptoUtil: CryptoUtil,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: IActiveUser) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
  async refreshTokens(refreshToken: string) {
    try {
      // 1. verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // 2. get new user data
      const activeUser: IActiveUser = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // 3. generate new tokens
      return await this.generateTokens(activeUser);
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }
  async register(createAuthDto: CreateAuthDto): Promise<IUser> {
    const { password, rePassword } = createAuthDto;
    if (password !== rePassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const user = await this.userService.createUser(createAuthDto);

    return user;
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{ accessToken: string }> {
    const { email, password } = loginAuthDto;
    const user = await this.userService.findOneByEmail(email);

    const isPasswordMatch = await this.cryptoUtil.compare(
      password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new NotFoundException('Email or password incorrect');
    }

    const payload: IActiveUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const { accessToken, refreshToken } = await this.generateTokens(payload);
    return AuthMapper.toLoginResponse(user, accessToken, refreshToken);
  }
}
