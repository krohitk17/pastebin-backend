import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppService } from '../service/app.service';
import { CreatePasteRequestDto, GetPasteRequestDto } from '../dto/request.dto';
import { CreatePasteResponseDto, GetPasteResponseDto } from '../dto/response.dto';
import { OptionalAccessTokenGuard } from '../guards/optional-access-token.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthUser } from '../types/auth-user.type';

@Controller('paste')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Post()
  async getPaste(@Body() body: GetPasteRequestDto): Promise<GetPasteResponseDto> {
    this.logger.debug(`Received POST request for paste: ${body.url}`);
    const data = await this.appService.getPaste(body);
    this.logger.debug('Sending paste response');
    return data;
  }

  @Post('create')
  @UseGuards(OptionalAccessTokenGuard)
  async createPaste(
    @Body() body: CreatePasteRequestDto,
    @CurrentUser() user?: AuthUser,
  ): Promise<CreatePasteResponseDto> {
    this.logger.debug('Received POST request to create paste');
    const userId = user?.sub || undefined;
    const url = await this.appService.createPaste(body, userId);
    this.logger.debug(`Paste saved with URL: ${url.url}`);
    return url;
  }
}
