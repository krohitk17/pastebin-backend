import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AppService } from '../service/app.service';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthUser } from '../types/auth-user.type';
import { GetPasteResponseDto } from '../dto/response.dto';
import {
  PasteSummaryResponseDto,
  UpdatePasteRequestDto,
} from '../dto/user-paste.dto';

@Controller('users/pastes')
@UseGuards(AccessTokenGuard)
export class UserPasteController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getAllPastes(
    @CurrentUser() user: AuthUser,
  ): Promise<PasteSummaryResponseDto[]> {
    return this.appService.listUserPastes(user.sub);
  }

  @Get(':url')
  async getOwnedPaste(
    @CurrentUser() user: AuthUser,
    @Param('url') url: string,
  ): Promise<GetPasteResponseDto> {
    return this.appService.getUserPaste(user.sub, url);
  }

  @Patch(':url')
  async updatePaste(
    @CurrentUser() user: AuthUser,
    @Param('url') url: string,
    @Body() body: UpdatePasteRequestDto,
  ): Promise<GetPasteResponseDto> {
    return this.appService.updateUserPaste(user.sub, url, body);
  }

  @Delete(':url')
  async deletePaste(
    @CurrentUser() user: AuthUser,
    @Param('url') url: string,
  ): Promise<{ success: true }> {
    await this.appService.deleteUserPaste(user.sub, url);
    return { success: true };
  }
}
