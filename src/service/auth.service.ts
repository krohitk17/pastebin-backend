import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  AuthTokensResponseDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from '../dto/auth.dto';
import { User, UserDocument } from '../schema/user.schema';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: RegisterRequestDto): Promise<AuthTokensResponseDto> {
    const existing = await this.userModel.findOne({ email: data.email.toLowerCase() }).exec();
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const rounds = this.configService.get<number>('securityConfig.bcryptRounds') || 12;
    const passwordHash = await bcrypt.hash(data.password, rounds);

    const user = await this.userModel.create({
      email: data.email.toLowerCase(),
      passwordHash,
    });

    const tokens = await this.issueTokens(user.id, user.email);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async login(data: LoginRequestDto): Promise<AuthTokensResponseDto> {
    const user = await this.userModel.findOne({ email: data.email.toLowerCase() }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(data: RefreshTokenRequestDto): Promise<AuthTokensResponseDto> {
    const refreshSecret = this.configService.get<string>('authConfig.refreshTokenSecret');
    if (!refreshSecret) {
      throw new UnauthorizedException('Refresh token secret is not configured');
    }

    let payload: AuthUser;
    try {
      payload = await this.jwtService.verifyAsync<AuthUser>(data.refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    const user = await this.userModel.findById(payload.sub).exec();
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    const matches = await bcrypt.compare(data.refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: '' }).exec();
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokensResponseDto> {
    const accessSecret = this.configService.get<string>('authConfig.accessTokenSecret');
    const refreshSecret = this.configService.get<string>('authConfig.refreshTokenSecret');

    if (!accessSecret || !refreshSecret) {
      throw new UnauthorizedException('Token secrets are not configured');
    }

    const accessExpiresIn = this.configService.get<string>('authConfig.accessTokenExpiresIn') || '15m';
    const refreshExpiresIn = this.configService.get<string>('authConfig.refreshTokenExpiresIn') || '7d';

    const accessPayload: AuthUser = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshPayload: AuthUser = {
      sub: userId,
      email,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as unknown as number,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as unknown as number,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshTokenHash(userId: string, refreshToken: string): Promise<void> {
    const rounds = this.configService.get<number>('securityConfig.bcryptRounds') || 12;
    const refreshTokenHash = await bcrypt.hash(refreshToken, rounds);

    await this.userModel
      .findByIdAndUpdate(userId, { refreshTokenHash })
      .exec();
  }
}
