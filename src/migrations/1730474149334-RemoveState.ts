import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveState1730474149334 implements MigrationInterface {
  name = 'RemoveState1730474149334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "state"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "state" character varying NOT NULL`,
    );
  }
}
