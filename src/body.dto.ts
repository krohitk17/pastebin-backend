import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class GetBodyDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  password?: string;
}

export class PostBodyDto {
  @IsString()
  @IsNotEmpty()
  formData: string;

  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsBoolean()
  @IsNotEmpty()
  burnOnRead?: boolean;
}
