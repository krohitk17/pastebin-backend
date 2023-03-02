import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GetBodyDto, PostBodyDto } from './body.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  test(): string {
    return 'App is working';
  }

  @Get('get')
  async getData(@Body() body: GetBodyDto) {
    console.log('Call Get Request ' + body);
    const data = await this.appService.getData(body);
    console.log('Sending ' + data);
    return data;
  }

  @Post('save')
  async saveData(@Body() body: PostBodyDto) {
    console.log('Call Post Request ' + body);
    const url = await this.appService.saveData(body);
    console.log('Generated URL ' + url);
    return { url };
  }
}
