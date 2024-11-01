import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem, CartItemTopping, Pizza } from '../entities';
import { CartItemDto } from '../dtos/order.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(CartItemTopping)
    private cartItemToppingRepository: Repository<CartItemTopping>,
    @InjectRepository(Pizza)
    private pizzaRepository: Repository<Pizza>,
  ) {}

  async getCart(cartId: string) {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.pizza',
        'items.size',
        'items.toppings',
        'items.toppings.topping',
      ],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async createCart() {
    const cart = this.cartRepository.create();
    await this.cartRepository.save(cart);
    return { cartId: cart.id };
  }

  async addItem(cartId: string, itemData: CartItemDto) {
    const cart = await this.cartRepository.findOne({ where: { id: cartId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const pizza = await this.pizzaRepository.findOne({
      where: { id: itemData.pizzaId },
    });

    if (!pizza) {
      throw new NotFoundException('Pizza not found');
    }

    if (pizza.stock < itemData.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cartItem = this.cartItemRepository.create({
      cart,
      pizza,
      size: { id: itemData.sizeId },
      quantity: itemData.quantity,
    });

    await this.cartItemRepository.save(cartItem);

    // Add toppings
    if (itemData.toppings?.length) {
      const toppingEntities = itemData.toppings.map((toppingId) =>
        this.cartItemToppingRepository.create({
          cartItem,
          topping: { id: toppingId },
        }),
      );
      await this.cartItemToppingRepository.save(toppingEntities);
    }

    return this.getCart(cartId);
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { id: cartId } },
      relations: ['pizza'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.pizza.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.cartItemRepository.update(itemId, { quantity });
    return this.getCart(cartId);
  }

  async removeItem(cartId: string, itemId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { id: cartId } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);
    return this.getCart(cartId);
  }

  async clearCart(cartId: string) {
    const items = await this.cartItemRepository.find({
      where: { cart: { id: cartId } },
    });
    await this.cartItemRepository.remove(items);
    return { success: true };
  }
}
