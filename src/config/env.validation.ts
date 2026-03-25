import { plainToInstance, Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  ValidationError,
  validateSync,
} from 'class-validator';

const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      const constraintMessages = Object.values(error.constraints).join(', ');
      messages.push(`${error.property}: ${constraintMessages}`);
    }

    if (error.children && error.children.length > 0) {
      messages.push(...formatValidationErrors(error.children));
    }
  }

  return messages;
}

class EnvironmentVariables {
  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUrl({ require_tld: false })
  APP_URL?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUrl({ require_tld: false })
  CORS_ORIGIN?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^mongodb(\+srv)?:\/\/.+$/, {
    message: 'MONGO_URL must be a valid mongodb:// or mongodb+srv:// URI',
  })
  MONGO_URL: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Matches(/^(0|\d+[mhdwM])$/, {
    message: 'EXPIRATION_TIME must be 0 or match <number><m|h|d|w|M>',
  })
  EXPIRATION_TIME?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(10)
  @Max(20)
  BCRYPT_ROUNDS?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRES_IN?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN?: string;

  @IsString()
  @IsNotEmpty()
  S3_BUCKET: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  S3_REGION?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUrl({ require_tld: false })
  S3_ENDPOINT?: string;

  @IsString()
  @IsNotEmpty()
  S3_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  S3_SECRET_ACCESS_KEY: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsIn(['true', 'false'])
  S3_FORCE_PATH_STYLE?: string;
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    const formattedErrors = formatValidationErrors(errors);
    throw new Error(
      `Environment validation failed:\n- ${formattedErrors.join('\n- ')}`,
    );
  }

  return config;
}
