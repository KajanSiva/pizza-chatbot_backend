import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { PizzaTopping } from './pizza-topping.entity';

@Entity('order_item_toppings')
export class OrderItemTopping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.toppings)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => PizzaTopping, (topping) => topping.orderItemToppings)
  @JoinColumn({ name: 'topping_id' })
  topping: PizzaTopping;
}
