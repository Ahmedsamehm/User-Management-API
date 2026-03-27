import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { IUser } from 'src/common/interfaces/user.interfaces';
import { LoginAuthDto } from './dto/login-auth-dto';
import { Public } from 'src/common/decorators/public.decorator';
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto): Promise<IUser> {
    return this.authService.register(createAuthDto);
  }
  @Public()
  @Post('login')
  async login(
    @Body() loginAuthDto: LoginAuthDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(loginAuthDto);
  }
}
