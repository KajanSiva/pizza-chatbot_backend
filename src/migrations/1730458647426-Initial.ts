import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1730458647426 implements MigrationInterface {
  name = 'Initial1730458647426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "street" character varying NOT NULL, "number" character varying NOT NULL, "complement" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "postalCode" character varying NOT NULL, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientName" character varying NOT NULL, "addressId" uuid NOT NULL, "status" character varying NOT NULL, "totalAmount" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "address_id" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item_toppings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderItemId" uuid NOT NULL, "toppingId" uuid NOT NULL, "order_item_id" uuid, "topping_id" uuid, CONSTRAINT "PK_6ca3b53c7387ef22bdd26d31be2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pizza_topping" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8e567fb464827f1fee817b845cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_item_toppings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cartItemId" uuid NOT NULL, "toppingId" uuid NOT NULL, "cart_item_id" uuid, "topping_id" uuid, CONSTRAINT "PK_62ae7f06bc33b36efe85c76dd80" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cartId" uuid NOT NULL, "pizzaId" uuid NOT NULL, "sizeId" uuid NOT NULL, "quantity" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "cart_id" uuid, "pizza_id" uuid, "size_id" uuid, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pizza" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cb1970bd1d17619fd6bc1ec7414" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "pizzaId" uuid NOT NULL, "sizeId" uuid NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "order_id" uuid, "pizza_id" uuid, "size_id" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sizes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "priceMultiplier" numeric(10,2) NOT NULL, CONSTRAINT "PK_09ffc681886e25eb5ce3b319fab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_d39c53244703b8534307adcd073" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_toppings" ADD CONSTRAINT "FK_884547c2532a17550752c8a2bee" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_toppings" ADD CONSTRAINT "FK_bc1cea5a424274fcbbfb35834fc" FOREIGN KEY ("topping_id") REFERENCES "pizza_topping"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item_toppings" ADD CONSTRAINT "FK_1216bc643cba005c6169ffd2cb0" FOREIGN KEY ("cart_item_id") REFERENCES "cart_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item_toppings" ADD CONSTRAINT "FK_5f5f08ca709e3a5fe4566e7bb1c" FOREIGN KEY ("topping_id") REFERENCES "pizza_topping"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_6385a745d9e12a89b859bb25623" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_6e01cf96e1b7ed3a4a5850388f4" FOREIGN KEY ("pizza_id") REFERENCES "pizza"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_17f9c2d96a6fbdc6274c9cc487a" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_4bf292cb815a69aa1c01dd11f64" FOREIGN KEY ("pizza_id") REFERENCES "pizza"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_0b0a262143ce8403f03ba2e9e57" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_0b0a262143ce8403f03ba2e9e57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_4bf292cb815a69aa1c01dd11f64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_17f9c2d96a6fbdc6274c9cc487a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_6e01cf96e1b7ed3a4a5850388f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_6385a745d9e12a89b859bb25623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item_toppings" DROP CONSTRAINT "FK_5f5f08ca709e3a5fe4566e7bb1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item_toppings" DROP CONSTRAINT "FK_1216bc643cba005c6169ffd2cb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_toppings" DROP CONSTRAINT "FK_bc1cea5a424274fcbbfb35834fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_toppings" DROP CONSTRAINT "FK_884547c2532a17550752c8a2bee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_d39c53244703b8534307adcd073"`,
    );
    await queryRunner.query(`DROP TABLE "sizes"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "pizza"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "cart_item_toppings"`);
    await queryRunner.query(`DROP TABLE "pizza_topping"`);
    await queryRunner.query(`DROP TABLE "order_item_toppings"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
  }
}
