import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ResponseDataDto {
  @IsString()
  @IsNotEmpty()
  formData: string;

  @IsBoolean()
  @IsNotEmpty()
  burnOnRead: boolean;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}

export class ResponseUrlDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}
