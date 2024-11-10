import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const apiPort = process.env.API_PORT || 3002;
  await app.listen(apiPort);
  console.log(`API service running on port ${apiPort}`);
}
bootstrap();
