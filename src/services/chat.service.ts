import { Injectable } from '@nestjs/common';
import { ChatRequestDto } from '../dtos/chat.dto';
import { ChatOpenAI } from '@langchain/openai';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';

@Injectable()
export class ChatService {
  private chatModel: ChatOpenAI;
  private messageHistories: Map<string, InMemoryChatMessageHistory>;
  private chainWithHistory: RunnableWithMessageHistory<any, any>;

  constructor() {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini-2024-07-18',
    });
    this.messageHistories = new Map();

    this.chainWithHistory = new RunnableWithMessageHistory({
      runnable: this.chatModel,
      getMessageHistory: (sessionId) => this.getMessageHistory(sessionId),
    });
  }

  private getMessageHistory(sessionId: string): InMemoryChatMessageHistory {
    if (!this.messageHistories.has(sessionId)) {
      this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());
    }
    return this.messageHistories.get(sessionId);
  }

  async process(chatRequest: ChatRequestDto): Promise<any> {
    const { message, sessionId } = chatRequest;

    const response = await this.chainWithHistory.invoke(message, {
      configurable: { sessionId },
    });

    return {
      message: response.content,
      sessionId,
    };
  }

  async clearHistory(sessionId: string): Promise<void> {
    const history = this.getMessageHistory(sessionId);
    await history.clear();
    this.messageHistories.delete(sessionId);
  }
}
