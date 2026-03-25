import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { uid } from 'rand-token';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePasteRequestDto, GetPasteRequestDto } from '../dto/request.dto';
import { CreatePasteResponseDto, GetPasteResponseDto } from '../dto/response.dto';
import * as bcrypt from 'bcrypt';
import { ObjectStorageService } from './object-storage.service';
import { Paste, PasteDocument } from '../schema/paste.schema';
import {
  DEFAULT_PASTE_TTL_MS,
  S3_PASTE_KEY_PREFIX,
} from '../constants';
import {
  PasteSummaryResponseDto,
  UpdatePasteRequestDto,
} from '../dto/user-paste.dto';

function parseTimeString(timeString: string): Date {
  const unit = timeString.slice(-1);
  const value = parseInt(timeString.slice(0, -1));
  const now = new Date();
  switch (unit) {
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'd':
      now.setDate(now.getDate() + value);
      break;
    case 'w':
      now.setDate(now.getDate() + value * 7);
      break;
    case 'M':
      now.setMonth(now.getMonth() + value);
      break;
  }
  return now;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Paste.name) private readonly dataModel: Model<PasteDocument>,
    private readonly objectStorageService: ObjectStorageService,
    private readonly configService: ConfigService,
  ) {}

  async getPaste(authData: GetPasteRequestDto): Promise<GetPasteResponseDto> {
    const data = await this.dataModel.findOne({ url: authData.url }).exec();
    if (!data) {
      this.logger.debug(`Paste not found: ${authData.url}`);
      throw new NotFoundException('Data not found');
    }
    this.logger.debug(`Paste found: ${data.url}`);

    if (data.password) {
      if (!authData.password) {
        this.logger.warn(`Missing password for protected paste: ${authData.url}`);
        throw new UnauthorizedException();
      }

      if ((await bcrypt.compare(authData.password, data.password)) === false) {
        this.logger.warn(`Invalid password attempt for paste: ${authData.url}`);
        throw new UnauthorizedException();
      }
    }

    const body = await this.objectStorageService.getTextObject(data.objectKey);

    if (data.burnOnRead) {
      this.logger.debug(`Deleting burn-on-read paste: ${data.url}`);
      await data.delete();
      try {
        await this.objectStorageService.deleteObject(data.objectKey);
      } catch {
        this.logger.warn(
          `Failed to delete object ${data.objectKey} for URL ${data.url}`,
        );
      }

      return {
        title: data.title,
        body,
        syntax: data.syntax,
        createdAt: data.createdAt,
        expiresAt: new Date(),
      };
    }

    const response: GetPasteResponseDto = {
      title: data.title,
      body,
      syntax: data.syntax,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
    };

    return response;
  }

  async createPaste(
    data: CreatePasteRequestDto,
    ownerId?: string,
  ): Promise<CreatePasteResponseDto> {
    const newData = new this.dataModel();
    newData.url = uid(6);
    newData.objectKey = `${S3_PASTE_KEY_PREFIX}/${newData.url}.txt`;
    newData.ownerId = ownerId || '';
    newData.title = data.title;
    newData.password = data.password
      ? await bcrypt.hash(data.password, this.configService.get<number>('securityConfig.bcryptRounds') || 12)
      : '';
    newData.syntax = data.syntax;
    if (data.expiresAt === '0') {
      newData.expiresAt = new Date(Date.now() + DEFAULT_PASTE_TTL_MS);
      newData.burnOnRead = true;
    } else {
      newData.expiresAt = parseTimeString(data.expiresAt);
      newData.burnOnRead = false;
    }

    await this.objectStorageService.uploadTextObject(newData.objectKey, data.body);

    try {
      await newData.save();
    } catch (error: unknown) {
      this.logger.error(
        `Failed to save paste metadata for URL: ${newData.url}`,
        error instanceof Error ? error.stack : undefined,
      );
      await this.objectStorageService.deleteObject(newData.objectKey);
      throw error;
    }

    this.logger.debug(`Paste created with URL: ${newData.url}`);
    return { url: newData.url };
  }

  async listUserPastes(userId: string): Promise<PasteSummaryResponseDto[]> {
    const pastes = await this.dataModel
      .find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .exec();

    return pastes.map((paste) => ({
      url: paste.url,
      title: paste.title,
      syntax: paste.syntax,
      burnOnRead: paste.burnOnRead,
      isPasswordProtected: Boolean(paste.password),
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
    }));
  }

  async getUserPaste(userId: string, url: string): Promise<GetPasteResponseDto> {
    const paste = await this.findOwnedPaste(userId, url);
    const body = await this.objectStorageService.getTextObject(paste.objectKey);

    return {
      title: paste.title,
      body,
      syntax: paste.syntax,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
    };
  }

  async updateUserPaste(
    userId: string,
    url: string,
    updateData: UpdatePasteRequestDto,
  ): Promise<GetPasteResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No update fields provided');
    }

    const paste = await this.findOwnedPaste(userId, url);

    if (typeof updateData.title === 'string') {
      paste.title = updateData.title;
    }

    if (typeof updateData.syntax === 'string') {
      paste.syntax = updateData.syntax;
    }

    if (typeof updateData.body === 'string') {
      await this.objectStorageService.uploadTextObject(paste.objectKey, updateData.body);
    }

    if (updateData.clearPassword === true) {
      paste.password = '';
    } else if (typeof updateData.password === 'string') {
      const rounds =
        this.configService.get<number>('securityConfig.bcryptRounds') || 12;
      paste.password = await bcrypt.hash(updateData.password, rounds);
    }

    if (typeof updateData.expiresAt === 'string') {
      if (updateData.expiresAt === '0') {
        paste.expiresAt = new Date(Date.now() + DEFAULT_PASTE_TTL_MS);
        paste.burnOnRead = true;
      } else {
        paste.expiresAt = parseTimeString(updateData.expiresAt);
        paste.burnOnRead = false;
      }
    }

    await paste.save();

    return this.getUserPaste(userId, url);
  }

  async deleteUserPaste(userId: string, url: string): Promise<void> {
    const paste = await this.findOwnedPaste(userId, url);

    await paste.delete();
    try {
      await this.objectStorageService.deleteObject(paste.objectKey);
    } catch {
      this.logger.warn(
        `Failed to delete object ${paste.objectKey} for URL ${paste.url}`,
      );
    }
  }

  private async findOwnedPaste(
    userId: string,
    url: string,
  ): Promise<PasteDocument> {
    const paste = await this.dataModel.findOne({ ownerId: userId, url }).exec();
    if (!paste) {
      throw new NotFoundException('Paste not found');
    }

    return paste;
  }
}
