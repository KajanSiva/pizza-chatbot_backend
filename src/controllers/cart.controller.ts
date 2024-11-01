import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddCartItemDto, UpdateCartItemQuantityDto } from '../dtos/cart.dto';

@Controller('api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':cartId')
  async getCart(@Param('cartId') cartId: string) {
    return this.cartService.getCart(cartId);
  }

  @Post()
  async createCart() {
    return this.cartService.createCart();
  }

  @Post(':cartId/items')
  async addItem(@Param('cartId') cartId: string, @Body() item: AddCartItemDto) {
    return this.cartService.addItem(cartId, item);
  }

  @Put(':cartId/items/:itemId')
  async updateItemQuantity(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() update: UpdateCartItemQuantityDto,
  ) {
    return this.cartService.updateItemQuantity(cartId, itemId, update.quantity);
  }

  @Delete(':cartId/items/:itemId')
  async removeItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(cartId, itemId);
  }

  @Delete(':cartId')
  async clearCart(@Param('cartId') cartId: string) {
    return this.cartService.clearCart(cartId);
  }
}
