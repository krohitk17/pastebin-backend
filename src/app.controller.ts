import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { GetBodyDto, PostBodyDto, UpdateBodyDto } from './dto/request.dto';
import { ResponseDataDto, ResponseUrlDto } from './dto/response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  test(): string {
    return 'App is working';
  }

  @Get('get')
  async getData(@Query() body: GetBodyDto): Promise<ResponseDataDto> {
    console.log('Call Get Request ' + body);
    const data = await this.appService.getData(body);
    console.log('Sending ' + data);
    return data;
  }

  @Post('save')
  async saveData(@Body() body: PostBodyDto): Promise<ResponseUrlDto> {
    console.log('Call Post Request ' + body);
    const url = await this.appService.createData(body);
    console.log('Generated URL ' + url);
    return url;
  }

  @Post('update')
  async updateData(@Body() body: UpdateBodyDto): Promise<ResponseDataDto> {
    console.log('Call Update Request ' + body);
    const newData = await this.appService.updateData(body);
    console.log('Updated data ' + newData);
    return newData;
  }
}
