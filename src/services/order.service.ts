import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  Address,
  OrderItem,
  OrderItemTopping,
  Pizza,
} from '../entities';
import { CreateOrderDto } from '../dtos/order.dto';
import { CartService } from './cart.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderItemTopping)
    private orderItemToppingRepository: Repository<OrderItemTopping>,
    @InjectRepository(Pizza)
    private pizzaRepository: Repository<Pizza>,
    private cartService: CartService,
  ) {}

  async createOrder(data: CreateOrderDto) {
    const cart = await this.cartService.getCart(data.cartId);

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    // Create address
    const address = this.addressRepository.create(data.address);
    await this.addressRepository.save(address);

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum, item) =>
        sum + item.pizza.price * item.quantity * item.size.priceMultiplier,
      0,
    );

    // Create order
    const order = this.orderRepository.create({
      clientName: data.clientName,
      addressId: address.id,
      status: 'pending',
      totalAmount,
    });

    await this.orderRepository.save(order);

    // Create order items
    for (const cartItem of cart.items) {
      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        pizzaId: cartItem.pizzaId,
        sizeId: cartItem.sizeId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.pizza.price,
      });

      await this.orderItemRepository.save(orderItem);

      // Create order item toppings
      const toppingEntities = cartItem.toppings.map((topping) =>
        this.orderItemToppingRepository.create({
          orderItemId: orderItem.id,
          toppingId: topping.toppingId,
        }),
      );

      await this.orderItemToppingRepository.save(toppingEntities);

      // Update pizza stock
      await this.pizzaRepository.update(cartItem.pizzaId, {
        stock: () => `stock - ${cartItem.quantity}`,
      });
    }

    // Clear the cart
    await this.cartService.clearCart(data.cartId);

    return this.findOne(order.id);
  }

  async findAll({
    limit = 10,
    offset = 0,
    status,
    sort,
  }: {
    limit: number;
    offset: number;
    status?: string;
    sort?: string;
  }) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.address', 'address')
      .take(limit)
      .skip(offset);

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    if (sort) {
      queryBuilder.orderBy(`order.${sort}`, 'DESC');
    } else {
      queryBuilder.orderBy('order.createdAt', 'DESC');
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.pizza',
        'items.size',
        'items.toppings',
        'address',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(id: string) {
    const order = await this.findOne(id);

    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    // Return stock
    for (const item of order.items) {
      await this.pizzaRepository.update(item.pizzaId, {
        stock: () => `stock + ${item.quantity}`,
      });
    }

    await this.orderRepository.update(id, { status: 'cancelled' });

    return this.findOne(id);
  }
}
