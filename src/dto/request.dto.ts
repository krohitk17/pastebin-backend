import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GetBodyDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @MaxLength(24)
  password: string;
}

export class PostBodyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @MaxLength(24)
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  burnOnRead: boolean;

  @IsString()
  @IsNotEmpty()
  syntax: string;

  @IsString()
  @IsNotEmpty()
  expiresAt: string;
}
