import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import aiConfig from '../config/ai.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [aiConfig],
      envFilePath: '.env',
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
