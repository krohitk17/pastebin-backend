import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const MAX_PASTE_TITLE_LENGTH = 500;
const MAX_PASTE_BODY_LENGTH = 10000;

export class UpdatePasteRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_PASTE_TITLE_LENGTH)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_PASTE_BODY_LENGTH)
  body?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  syntax?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  clearPassword?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0|\d+[mhdwM])$/, {
    message: 'expiresAt must be 0 or match <number><m|h|d|w|M>',
  })
  expiresAt?: string;
}

export class PasteSummaryResponseDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  syntax: string;

  @IsBoolean()
  burnOnRead: boolean;

  @IsBoolean()
  isPasswordProtected: boolean;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;
}
