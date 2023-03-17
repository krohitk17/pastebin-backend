import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ResponseDataDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  syntax: string;

  @IsBoolean()
  @IsNotEmpty()
  burnOnRead: boolean;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;
}

export class ResponseUrlDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}
