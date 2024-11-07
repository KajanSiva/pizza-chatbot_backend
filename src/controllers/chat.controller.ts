import { Controller, Post, Body } from '@nestjs/common';
import { ChatRequestDto } from '../dtos/chat.dto';
import { ChatService } from '../services/chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async process(@Body() chatRequest: ChatRequestDto) {
    return this.chatService.process(chatRequest);
  }
}
