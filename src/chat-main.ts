import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);
  app.useGlobalPipes(new ValidationPipe());

  const chatPort = process.env.CHAT_PORT || 3001;
  await app.listen(chatPort);
  console.log(`Chat service running on port ${chatPort}`);
}
bootstrap();
