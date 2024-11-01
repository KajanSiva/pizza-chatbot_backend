import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './order.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  street: string;

  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Column({ type: 'varchar', nullable: true })
  complement: string;

  @Column({ type: 'varchar', nullable: false })
  city: string;

  @Column({ type: 'varchar', nullable: false })
  postalCode: string;

  @OneToMany(() => Order, (order) => order.address)
  orders: Order[];
}
