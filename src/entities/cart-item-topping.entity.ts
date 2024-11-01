import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { PizzaTopping } from './pizza-topping.entity';

@Entity('cart_item_toppings')
export class CartItemTopping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartItem, (cartItem) => cartItem.toppings)
  @JoinColumn({ name: 'cart_item_id' })
  cartItem: CartItem;

  @ManyToOne(() => PizzaTopping, (topping) => topping.cartItemToppings)
  @JoinColumn({ name: 'topping_id' })
  topping: PizzaTopping;
}
