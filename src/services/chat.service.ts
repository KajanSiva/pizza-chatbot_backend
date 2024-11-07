import { Injectable } from '@nestjs/common';
import { ChatRequestDto } from '../dtos/chat.dto';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

@Injectable()
export class ChatService {
  private chatModel: ChatOpenAI;

  constructor() {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini-2024-07-18',
    });
  }

  async process(chatRequest: ChatRequestDto): Promise<any> {
    const humanMessage = new HumanMessage(chatRequest.message);
    const response = await this.chatModel.invoke([humanMessage]);
    return {
      message: response.content,
    };
  }
}
