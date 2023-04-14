import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './configuration';
import { BodyValidationPipe } from './body.pipe';

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

  await app.listen(configuration().port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
