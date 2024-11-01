import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderItemTopping } from './order-item-topping.entity';
import { CartItemTopping } from './cart-item-topping.entity';

@Entity('pizza_topping')
export class PizzaTopping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(
    () => OrderItemTopping,
    (orderItemTopping) => orderItemTopping.topping,
  )
  orderItemToppings: OrderItemTopping[];

  @OneToMany(
    () => CartItemTopping,
    (cartItemTopping) => cartItemTopping.topping,
  )
  cartItemToppings: CartItemTopping[];
}
