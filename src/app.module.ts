import { Module } from '@nestjs/common';
import { AppService } from './service/app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Paste, PasteSchema } from './schema/paste.schema';
import { User, UserSchema } from './schema/user.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { ObjectStorageService } from './service/object-storage.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controller/auth.controller';
import { AppController } from './controller/app.controller';  
import { UserPasteController } from './controller/user-paste.controller';
import { HealthController } from './controller/health.controller';
import { AuthService } from './service/auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { OptionalAccessTokenGuard } from './guards/optional-access-token.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('dbConfig.mongo_url'),
      }),
    }),
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: Paste.name, schema: PasteSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AppController, AuthController, UserPasteController, HealthController],
  providers: [
    AppService,
    AuthService,
    ObjectStorageService,
    AccessTokenGuard,
    OptionalAccessTokenGuard,
  ],
})
export class AppModule {}
