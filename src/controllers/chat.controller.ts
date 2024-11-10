import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatRequestDto } from '../dtos/chat.dto';
import { ChatService } from '../services/chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async process(@Body() chatRequest: ChatRequestDto) {
    if (!chatRequest.sessionId) {
      throw new BadRequestException('sessionId is required');
    }
    return this.chatService.process(chatRequest);
  }
}
