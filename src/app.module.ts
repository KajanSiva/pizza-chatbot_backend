import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import {
  PizzaController,
  ToppingController,
  SizeController,
} from './controllers/pizza.controller';
import { CartController } from './controllers/cart.controller';
import { OrderController } from './controllers/order.controller';
import { PizzaService } from './services/pizza.service';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import {
  Pizza,
  PizzaTopping,
  Size,
  Cart,
  CartItem,
  CartItemTopping,
  Order,
  OrderItem,
  OrderItemTopping,
  Address,
} from './entities';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import aiConfig from './config/ai.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, aiConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Pizza,
      PizzaTopping,
      Size,
      Cart,
      CartItem,
      CartItemTopping,
      Order,
      OrderItem,
      OrderItemTopping,
      Address,
    ]),
  ],
  controllers: [
    PizzaController,
    ToppingController,
    SizeController,
    CartController,
    OrderController,
    ChatController,
  ],
  providers: [PizzaService, CartService, OrderService, ChatService],
})
export class AppModule {}
