import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { GetBodyDto, PostBodyDto } from './dto/request.dto';
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
    console.log('Call Get Request ' + body.url);
    const data = await this.appService.getData(body);
    console.log('Sending ');
    console.log(data);
    return data;
  }

  @Post('save')
  async saveData(@Body() body: PostBodyDto): Promise<ResponseUrlDto> {
    console.log('Call Post Request');
    console.log(body);
    const url = await this.appService.createData(body);
    console.log('Generated URL ' + url);
    return url;
  }
}
