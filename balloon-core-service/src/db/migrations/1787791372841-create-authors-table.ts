import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthorsTable1787791372841 implements MigrationInterface {
    name = 'CreateAuthorsTable1787791372841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authors" ADD "reader_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "authors" ADD CONSTRAINT "UQ_5064b1842d13bd17251cfbce7f6" UNIQUE ("reader_id")`);
        await queryRunner.query(`ALTER TABLE "authors" ADD CONSTRAINT "FK_5064b1842d13bd17251cfbce7f6" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authors" DROP CONSTRAINT "FK_5064b1842d13bd17251cfbce7f6"`);
        await queryRunner.query(`ALTER TABLE "authors" DROP CONSTRAINT "UQ_5064b1842d13bd17251cfbce7f6"`);
        await queryRunner.query(`ALTER TABLE "authors" DROP COLUMN "reader_id"`);
    }

}
