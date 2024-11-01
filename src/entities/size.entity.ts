import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { CartItem } from './cart-item.entity';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  priceMultiplier: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.size)
  orderItems: OrderItem[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.size)
  cartItems: CartItem[];
}
