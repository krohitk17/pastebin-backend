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
}

export class UpdateBodyDto {
  @IsString()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @MaxLength(24)
  oldPassword: string;

  @IsString()
  @MaxLength(24)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  syntax: string;
}
