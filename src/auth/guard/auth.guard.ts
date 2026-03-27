import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      // 1. verify access token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch (err) {
      // 2. if access token expired
      const refreshToken = request.headers['x-refresh-token'];

      if (!refreshToken) throw new UnauthorizedException('Token expired');

      try {
        // 3. refresh token
        const newTokens = await this.authService.refreshTokens(refreshToken);

        // 4. send new access token in response headers
        response.setHeader('x-new-access-token', newTokens.accessToken);

        // 5. verify new access token to continue the request
        const payload = await this.jwtService.verifyAsync(
          newTokens.accessToken,
        );
        request['user'] = payload;
      } catch {
        throw new UnauthorizedException('Session expired, please login again');
      }
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
