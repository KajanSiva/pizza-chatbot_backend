import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Pizza } from './pizza.entity';
import { Size } from './size.entity';
import { OrderItemTopping } from './order-item-topping.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitPrice: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Pizza, (pizza) => pizza.orderItems)
  @JoinColumn({ name: 'pizza_id' })
  pizza: Pizza;

  @ManyToOne(() => Size, (size) => size.orderItems)
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @OneToMany(() => OrderItemTopping, (topping) => topping.orderItem)
  toppings: OrderItemTopping[];
}
