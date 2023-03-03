import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(configuration().port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
