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
import { CreateOrderDto } from '../../dtos/order.dto';

@Injectable()
export class ChatService {
  private chatModel: ChatOpenAI;
  private messageHistories: Map<string, InMemoryChatMessageHistory>;
  private cartSessions: Map<string, string>;
  private orderSessions: Map<string, string[]>;
  private agentExecutor: AgentExecutor;
  private runnableWithHistory: RunnableWithMessageHistory<any, any>;
  private currentSessionId: string;

  constructor(private readonly httpService: HttpService) {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini-2024-07-18',
      temperature: 0.5,
    });
    this.messageHistories = new Map();
    this.cartSessions = new Map();
    this.orderSessions = new Map();
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

  private createCartTool = tool(
    async () => {
      try {
        const response = await firstValueFrom(
          this.httpService.post('/api/carts'),
        );
        const cartId = response.data.cartId;
        console.log('Created new cart with ID:', cartId);
        return JSON.stringify({
          message: 'Cart created successfully',
          cartId,
          action: 'create_cart',
        });
      } catch (error) {
        throw new Error(`Error creating cart: ${error.message}`);
      }
    },
    {
      name: 'createCart',
      description:
        'Creates a new shopping cart. IMPORTANT: Only use when explicitly confirmed that no cart exists for the session. Check getCartId first before creating a new cart.',
      schema: z.object({}),
    },
  );

  private getCartTool = tool(
    async ({ cartId }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`/api/carts/${cartId}`),
        );
        return JSON.stringify(response.data);
      } catch (error) {
        throw new Error(`Error fetching cart: ${error.message}`);
      }
    },
    {
      name: 'getCart',
      description:
        'Gets the current cart contents. Use when user asks about their cart or current order.',
      schema: z.object({
        cartId: z.string(),
      }),
    },
  );

  private addItemToCartTool = tool(
    async ({ cartId, pizzaId, sizeId, quantity, toppings }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.post(`/api/carts/${cartId}/items`, {
            pizzaId, // This should be a UUID
            sizeId, // This should be a UUID
            quantity,
            toppings,
          }),
        );
        return JSON.stringify({
          success: true,
          message: 'Item added to cart successfully',
          data: response.data,
        });
      } catch (error) {
        let errorMessage =
          'An unexpected error occurred while adding the item to cart.';

        if (error.response) {
          switch (error.response.status) {
            case 400:
              errorMessage = 'Invalid pizza or size ID provided.';
              break;
            case 404:
              errorMessage = 'Pizza, size, or cart not found.';
              break;
            case 422:
              errorMessage = 'Invalid request format.';
              break;
          }
        }

        return JSON.stringify({
          success: false,
          error: errorMessage,
          details: error.response?.data?.message || error.message,
        });
      }
    },
    {
      name: 'addItemToCart',
      description: `Adds a pizza to the cart. Before using this:
      1. Get the pizza UUID using getPizzaIdByName
      2. Get the size UUID using getSizeIdByName
      3. Use the returned UUIDs in this tool
      Always check the response's 'success' field and handle errors appropriately.
      If success is false, explain the error to the user using the 'error' message.`,
      schema: z.object({
        cartId: z.string(),
        pizzaId: z.string(), // Changed to string for UUID
        sizeId: z.string(), // Changed to string for UUID
        quantity: z.number().default(1),
        toppings: z.array(z.string()).optional(),
      }),
    },
  );

  private updateCartItemQuantityTool = tool(
    async ({ cartId, itemId, quantity }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.put(`/api/carts/${cartId}/items/${itemId}`, {
            quantity,
          }),
        );
        return JSON.stringify(response.data);
      } catch (error) {
        throw new Error(`Error updating cart item: ${error.message}`);
      }
    },
    {
      name: 'updateCartItemQuantity',
      description: `Updates the quantity of an item in the cart. Use when user wants to change the quantity of a pizza.
      IMPORTANT: Before using this tool:
      1. First use getCart to fetch the current cart contents
      2. Find the specific pizza item in the cart items array
      3. Extract that item's UUID from the cart item
      4. Use that UUID as the itemId parameter`,
      schema: z.object({
        cartId: z.string(),
        itemId: z.string().uuid(),
        quantity: z.number().min(0),
      }),
    },
  );

  private removeCartItemTool = tool(
    async ({ cartId, itemId }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.delete(`/api/carts/${cartId}/items/${itemId}`),
        );
        return JSON.stringify(response.data);
      } catch (error) {
        throw new Error(`Error removing item from cart: ${error.message}`);
      }
    },
    {
      name: 'removeCartItem',
      description: `Removes an item from the cart. Use when user wants to remove a specific pizza from their order.
      IMPORTANT: Before using this tool:
      1. First use getCart to fetch the current cart contents
      2. Find the item's UUID from the cart items array
      3. Use that UUID as the itemId parameter`,
      schema: z.object({
        cartId: z.string(),
        itemId: z.string().uuid(),
      }),
    },
  );

  private clearCartTool = tool(
    async ({ cartId }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.delete(`/api/carts/${cartId}`),
        );
        return JSON.stringify(response.data);
      } catch (error) {
        throw new Error(`Error clearing cart: ${error.message}`);
      }
    },
    {
      name: 'clearCart',
      description:
        'Clears all items from the cart. Use when user wants to start over or empty their cart.',
      schema: z.object({
        cartId: z.string(),
      }),
    },
  );

  private createOrderTool = tool(
    async ({ cartId, clientName, address }) => {
      try {
        const orderData: CreateOrderDto = {
          cartId,
          clientName,
          address: {
            street: address.street,
            number: address.number,
            complement: address.complement,
            city: address.city,
            postalCode: address.postalCode,
          },
        };

        const response = await firstValueFrom(
          this.httpService.post('/api/orders', orderData),
        );

        if (response.data.id) {
          const sessionId = this.currentSessionId;
          this.addOrderId(sessionId, response.data.id);
        }

        return JSON.stringify({
          success: true,
          message: 'Order created successfully',
          data: response.data,
        });
      } catch (error) {
        let errorMessage =
          'An unexpected error occurred while creating the order.';

        if (error.response) {
          switch (error.response.status) {
            case 400:
              errorMessage =
                error.response.data.message || 'Cart not found or is empty.';
              break;
          }
        }

        return JSON.stringify({
          success: false,
          error: errorMessage,
          details: error.response?.data?.message || error.message,
        });
      }
    },
    {
      name: 'createOrder',
      description: `Creates a new order from the current cart contents. 
      IMPORTANT: 
      1. Verify cart has items using getCart before creating order
      2. Address must be provided with all required fields:
         - street: the street name without the number
         - number: the street number
         - city: the city name
         - postalCode: in format 12345 or 12345-6789
         - complement: optional additional address info
      3. Cart will be cleared after successful order creation
      4. Check response's 'success' field and handle errors appropriately`,
      schema: z.object({
        cartId: z.string(),
        clientName: z.string().min(2).max(100),
        address: z.object({
          street: z.string().min(3).max(100),
          number: z.string().max(10),
          complement: z.string().max(100).optional(),
          city: z.string().min(2).max(100),
          postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
        }),
      }),
    },
  );

  private getOrderTool = tool(
    async ({ orderId }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`/api/orders/${orderId}`),
        );
        return JSON.stringify({
          success: true,
          data: response.data,
        });
      } catch (error) {
        let errorMessage =
          'An unexpected error occurred while fetching the order.';

        if (error.response?.status === 404) {
          errorMessage = 'Order not found.';
        }

        return JSON.stringify({
          success: false,
          error: errorMessage,
          details: error.response?.data?.message || error.message,
        });
      }
    },
    {
      name: 'getOrder',
      description:
        'Gets details of a specific order by its ID. Use when user asks about their order status or details.',
      schema: z.object({
        orderId: z.string(),
      }),
    },
  );

  private cancelOrderTool = tool(
    async ({ orderId }) => {
      try {
        const response = await firstValueFrom(
          this.httpService.put(`/api/orders/${orderId}/cancel`),
        );
        return JSON.stringify({
          success: true,
          message: 'Order cancelled successfully',
          data: response.data,
        });
      } catch (error) {
        let errorMessage =
          'An unexpected error occurred while cancelling the order.';

        if (error.response) {
          switch (error.response.status) {
            case 400:
              errorMessage =
                'Order cannot be cancelled (may not be in pending status).';
              break;
            case 404:
              errorMessage = 'Order not found.';
              break;
          }
        }

        return JSON.stringify({
          success: false,
          error: errorMessage,
          details: error.response?.data?.message || error.message,
        });
      }
    },
    {
      name: 'cancelOrder',
      description: `Cancels an existing order. 
      IMPORTANT:
      1. Only pending orders can be cancelled
      2. Check response's 'success' field
      3. If cancellation fails, explain the reason to the user`,
      schema: z.object({
        orderId: z.string(),
      }),
    },
  );

  private setCartId(sessionId: string, cartId: string): void {
    console.log(`Setting cartId ${cartId} for session ${sessionId}`);
    this.cartSessions.set(sessionId, cartId);
  }

  private getCartId(sessionId: string): string | undefined {
    const cartId = this.cartSessions.get(sessionId);
    console.log(`Getting cartId for session ${sessionId}:`, cartId);
    return cartId;
  }

  private addOrderId(sessionId: string, orderId: string): void {
    const orders = this.orderSessions.get(sessionId) || [];
    orders.push(orderId);
    this.orderSessions.set(sessionId, orders);
    console.log(`Added orderId ${orderId} for session ${sessionId}`);
  }

  private getOrderIds(sessionId: string): string[] {
    return this.orderSessions.get(sessionId) || [];
  }

  async onModuleInit() {
    const tools = [
      this.getPizzasTool,
      this.getPizzaByIdTool,
      this.getToppingsTool,
      this.getSizesTool,
      this.createCartTool,
      this.getCartTool,
      this.addItemToCartTool,
      this.updateCartItemQuantityTool,
      this.removeCartItemTool,
      this.clearCartTool,
      this.createOrderTool,
      this.getOrderTool,
      this.cancelOrderTool,
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a helpful pizza ordering assistant. Follow these guidelines:
        
        1. Only use tools when specifically needed to answer the user's question
        2. For cart operations:
           - NEVER create a new cart if a cartId already exists
           - Only use createCart if you've confirmed no cartId exists
           - When adding items to cart:
             a. Use the EXISTING cartId if available
             b. Only create a new cart if no cartId exists
             c. Use getPizzas to find the pizza and get its UUID
             d. Use getSizes to find the size and get its UUID
             e. Use addItemToCart with the correct UUIDs
           - Always check tool responses for success/error status
           - If a tool returns an error, explain the issue to the user and suggest solutions
        3. For order operations:
           - Store order IDs after successful order creation
           - When user asks about order status:
             a. Use the most recent order ID by default
             b. If user asks about a specific order, verify it exists in their order history
           - For order cancellation, verify the order belongs to the user's session
        4. Format responses in a user-friendly way (don't show raw JSON)
        5. Guide users through the ordering process step by step
        6. Error handling:
           - Always check responses for errors
           - If an error occurs, explain the issue to the user and suggest solutions
           - Suggest alternatives or next steps when errors occur
           - Be empathetic when explaining errors
        7. Address handling:
           - When collecting delivery address:
             a. If user provides a full address like "123 Main Street, New York, 12345":
                - Extract street number (123) and name (Main Street) separately
                - Identify city and postal code
             b. If information is incomplete, ask for missing details one at a time:
                - Street number and name (if not clearly separated)
                - City (if missing)
                - Postal code (if missing or in wrong format)
           - Ensure postal code is in format: 12345 or 12345-6789
           - Before creating order, confirm all address components are correct
           - Example of complete address structure:
             street: "Main Street"
             number: "123"
             city: "New York"
             postalCode: "12345"
        
        Current cart ID: {cartId}
        Available order IDs: {orderIds}`,
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
      returnIntermediateSteps: true,
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
    this.currentSessionId = sessionId;

    try {
      const cartId = this.getCartId(sessionId);
      const orderIds = this.getOrderIds(sessionId);
      console.log(
        'Starting process with cartId:',
        cartId,
        'orderIds:',
        orderIds,
      );

      const response = await this.runnableWithHistory.invoke(
        {
          input: message,
          cartId,
          orderIds,
        },
        {
          configurable: { sessionId },
        },
      );

      if (response.intermediateSteps) {
        for (const step of response.intermediateSteps) {
          try {
            const toolResult = JSON.parse(step.observation);
            console.log('Tool result:', toolResult);
            if (toolResult.action === 'create_cart' && toolResult.cartId) {
              console.log('Found cartId in tool result:', toolResult.cartId);
              this.setCartId(sessionId, toolResult.cartId);
              break;
            }
          } catch {
            continue;
          }
        }
      }

      // TODO: remove that part?
      if (!this.getCartId(sessionId) && typeof response.output === 'string') {
        try {
          const responseObj = JSON.parse(response.output);
          if (responseObj.cartId) {
            console.log('Found cartId in response output:', responseObj.cartId);
            this.setCartId(sessionId, responseObj.cartId);
          }
        } catch {
          const cartIdMatch = response.output.match(/"cartId":\s*"([^"]+)"/);
          if (cartIdMatch && cartIdMatch[1]) {
            console.log('Found cartId via regex:', cartIdMatch[1]);
            this.setCartId(sessionId, cartIdMatch[1]);
          }
        }
      }

      const finalCartId = this.getCartId(sessionId);
      console.log('Ending process with cartId:', finalCartId);

      return {
        message: response.output,
        sessionId,
        cartId: finalCartId,
        orderIds: this.getOrderIds(sessionId),
      };
    } finally {
      this.currentSessionId = undefined;
    }
  }

  async clearHistory(sessionId: string): Promise<void> {
    const history = this.getMessageHistory(sessionId);
    await history.clear();
    this.messageHistories.delete(sessionId);
    this.cartSessions.delete(sessionId);
    this.orderSessions.delete(sessionId);
  }
}
