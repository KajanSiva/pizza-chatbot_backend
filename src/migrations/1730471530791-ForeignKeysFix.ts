import { MigrationInterface, QueryRunner } from 'typeorm';

export class ForeignKeysFix1730471530791 implements MigrationInterface {
  name = 'ForeignKeysFix1730471530791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "addressId"`);
    await queryRunner.query(
      `ALTER TABLE "order_item_toppings" DROP COLUMN "orderItemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_toppings" DROP COLUMN "toppingId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item_toppings" DROP COLUMN "cartItemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item_toppings" DROP COLUMN "toppingId"`,
    );
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "cartId"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "pizzaId"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "sizeId"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "orderId"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "pizzaId"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "sizeId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "sizeId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "pizzaId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "orderId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "sizeId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "pizzaId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "cartId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item_toppings" ADD "toppingId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item_toppings" ADD "cartItemId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_toppings" ADD "toppingId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_toppings" ADD "orderItemId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "addressId" uuid NOT NULL`,
    );
  }
}
