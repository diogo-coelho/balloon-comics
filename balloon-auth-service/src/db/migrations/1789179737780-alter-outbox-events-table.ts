import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterOutboxEventsTable1789179737780 implements MigrationInterface {
    name = 'AlterOutboxEventsTable1789179737780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outbox_events" ADD "aggregate_version" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "event_version" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_outbox_events_producer" ON "outbox_events"  ("user_id", "aggregate_version") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_outbox_events_producer"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "event_version"`);
        await queryRunner.query(`ALTER TABLE "outbox_events" DROP COLUMN "aggregate_version"`);
    }

}
