import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import aiConfig from '../config/ai.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [aiConfig],
      envFilePath: '.env',
    }),
    HttpModule.register({
      baseURL: process.env.API_BASE_URL || 'http://localhost:3002',
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
