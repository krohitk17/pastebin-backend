import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class OptionalAccessTokenGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAccessTokenGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined>; user?: AuthUser }>();

    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return true;
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      return true;
    }

    const accessSecret = this.configService.get<string>('authConfig.accessTokenSecret');
    if (!accessSecret) {
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token, {
        secret: accessSecret,
      });

      if (payload.type === 'access') {
        request.user = payload;
      }
    } catch (error) {
      this.logger.debug(
        `Invalid or expired access token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return true;
  }
}
