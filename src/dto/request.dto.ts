import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class GetBodyDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  password: string;
}

export class PostBodyDto {
  @IsString()
  @IsNotEmpty()
  formData: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  burnOnRead?: boolean;
}

export class UpdateBodyDto {
  @IsString()
  @IsNotEmpty()
  formData: string;

  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}
