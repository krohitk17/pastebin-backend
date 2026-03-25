import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const MAX_PASTE_TITLE_LENGTH = 500;
const MAX_PASTE_BODY_LENGTH = 10000;

export class GetPasteRequestDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class CreatePasteRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_PASTE_TITLE_LENGTH)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_PASTE_BODY_LENGTH)
  body: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty()
  syntax: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0|\d+[mhdwM])$/, {
    message: 'expiresAt must be 0 or match <number><m|h|d|w|M>',
  })
  expiresAt: string;
}
