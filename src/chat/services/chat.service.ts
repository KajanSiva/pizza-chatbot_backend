import { Injectable } from '@nestjs/common';
import { ChatRequestDto } from '../dtos/chat.dto';
import { ChatOpenAI } from '@langchain/openai';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { HttpService } from '@nestjs/axios';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';

@Injectable()
export class ChatService {
  private chatModel: ChatOpenAI;
  private messageHistories: Map<string, InMemoryChatMessageHistory>;
  private agentExecutor: AgentExecutor;
  private runnableWithHistory: RunnableWithMessageHistory<any, any>;

  constructor(private readonly httpService: HttpService) {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini-2024-07-18',
      temperature: 0.5,
    });
    this.messageHistories = new Map();
  }

  private getPizzasTool = tool(
    async ({ inStock, sort }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.get('/api/pizzas', { params: { inStock, sort } }),
        );
        return JSON.stringify(response.data);
      } catch (error) {
        throw new Error(`Error fetching pizzas: ${error.message}`);
      }
    },
    {
      name: 'getPizzas',
      description:
        'Gets list of available pizzas. Only use when the user explicitly asks about the menu, available pizzas, or pizza options.',
      schema: z.object({
        inStock: z.boolean().optional(),
        sort: z.string().optional(),
      }),
    },
  );

  private getPizzaByIdTool = tool(
    async ({ id }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`/api/pizzas/${id}`),
        );
        return JSON.stringify(response.data);
      } catch (error) {
        throw new Error(`Error fetching pizza details: ${error.message}`);
      }
    },
    {
      name: 'getPizzaById',
      description:
        'Gets details of a specific pizza by its ID. Use when the user asks about a specific pizza.',
      schema: z.object({
        id: z.number().or(z.string()),
      }),
    },
  );

  private getToppingsTool = tool(
    async () => {
      try {
        const response = await firstValueFrom(
          this.httpService.get('/api/toppings'),
        );
        return JSON.stringify(response.data);
      } catch (error) {
        throw new Error(`Error fetching toppings: ${error.message}`);
      }
    },
    {
      name: 'getToppings',
      description:
        'Gets list of available pizza toppings. Use when the user asks about available toppings or customization options.',
      schema: z.object({}),
    },
  );

  private getSizesTool = tool(
    async () => {
      try {
        const response = await firstValueFrom(
          this.httpService.get('/api/sizes'),
        );
        return JSON.stringify(response.data);
      } catch (error) {
        throw new Error(`Error fetching pizza sizes: ${error.message}`);
      }
    },
    {
      name: 'getSizes',
      description:
        'Gets available pizza sizes. Use when the user asks about available sizes or size options.',
      schema: z.object({}),
    },
  );

  async onModuleInit() {
    const tools = [
      this.getPizzasTool,
      this.getPizzaByIdTool,
      this.getToppingsTool,
      this.getSizesTool,
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a helpful pizza ordering assistant. Follow these guidelines:
        
        1. Only use tools when specifically needed to answer the user's question
        2. If the user's question isn't about pizzas, menu, or ordering, respond naturally without using tools
        3. Consider the conversation history when responding
        4. Keep responses friendly but concise
        5. If you use a tool, format the response in a user-friendly way (don't show raw JSON)`,
      ],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const agent = await createToolCallingAgent({
      llm: this.chatModel,
      tools,
      prompt,
    });

    this.agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
    });

    // Create runnable with history
    this.runnableWithHistory = new RunnableWithMessageHistory({
      runnable: this.agentExecutor,
      getMessageHistory: (sessionId) => this.getMessageHistory(sessionId),
      inputMessagesKey: 'input',
      historyMessagesKey: 'chat_history',
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

    try {
      // Use the runnable with history instead of direct agent execution
      const response = await this.runnableWithHistory.invoke(
        {
          input: message,
        },
        {
          configurable: { sessionId },
        },
      );

      return {
        message: response.output,
        sessionId,
      };
    } catch (error) {
      console.error('Error processing chat request:', error);
      return {
        message:
          "I'm sorry, I encountered an error processing your request. Could you please try again?",
        sessionId,
      };
    }
  }

  async clearHistory(sessionId: string): Promise<void> {
    const history = this.getMessageHistory(sessionId);
    await history.clear();
    this.messageHistories.delete(sessionId);
  }
}
