import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Pizza } from './pizza.entity';
import { Size } from './size.entity';
import { CartItemTopping } from './cart-item-topping.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  cartId: string;

  @Column({ type: 'uuid', nullable: false })
  pizzaId: string;

  @Column({ type: 'uuid', nullable: false })
  sizeId: string;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Pizza, (pizza) => pizza.cartItems)
  @JoinColumn({ name: 'pizza_id' })
  pizza: Pizza;

  @ManyToOne(() => Size, (size) => size.cartItems)
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @OneToMany(() => CartItemTopping, (topping) => topping.cartItem)
  toppings: CartItemTopping[];
}
