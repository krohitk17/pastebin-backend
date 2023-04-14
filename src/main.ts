import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BodyValidationPipe } from './body.pipe';
import ServerlessHttp, { Handler } from 'serverless-http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
    new BodyValidationPipe(),
  );
  app.enableCors();

  await app.init();
  console.log(`Application is running on: ${await app.getUrl()}`);

  const expressApp = app.getHttpAdapter().getInstance();
  return ServerlessHttp(expressApp);
}

let serverHandler: Handler;
export const handler = async (event, context) => {
  if (!serverHandler) {
    serverHandler = await bootstrap();
  }
  return serverHandler(event, context);
};
