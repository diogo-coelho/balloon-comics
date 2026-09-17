import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConsumerAggregateVersionTable1789180073221 implements MigrationInterface {
    name = 'CreateConsumerAggregateVersionTable1789180073221'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "consumer_aggregate_versions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aggregate_id" uuid NOT NULL, "consumer" character varying(100) NOT NULL, "last_applied_version" integer NOT NULL DEFAULT '0', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd8f2ef5f648a721c15231af1b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_consumer_aggregate_version" ON "consumer_aggregate_versions"  ("aggregate_id", "consumer") `);
        await queryRunner.query(`ALTER TABLE "social_media_links" DROP CONSTRAINT "UQ_ce44e62af46ed84b86a0e38047b"`);
        await queryRunner.query(`ALTER TABLE "social_media_links" DROP COLUMN "name"`);
        await queryRunner.query(`CREATE TYPE "public"."social_media_links_name_enum" AS ENUM('Facebook', 'Twitter', 'Instagram', 'YouTube', 'TikTok', 'Patreon', 'Bluesky', 'Discord', 'Twitch', 'Catarse', 'Apoia.se', 'LinkedIn', 'Website')`);
        await queryRunner.query(`ALTER TABLE "social_media_links" ADD "name" "public"."social_media_links_name_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "social_media_links" ADD CONSTRAINT "UQ_ce44e62af46ed84b86a0e38047b" UNIQUE ("reader_id", "name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_links" DROP CONSTRAINT "UQ_ce44e62af46ed84b86a0e38047b"`);
        await queryRunner.query(`ALTER TABLE "social_media_links" DROP COLUMN "name"`);
        await queryRunner.query(`DROP TYPE "public"."social_media_links_name_enum"`);
        await queryRunner.query(`ALTER TABLE "social_media_links" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "social_media_links" ADD CONSTRAINT "UQ_ce44e62af46ed84b86a0e38047b" UNIQUE ("name", "reader_id")`);
        await queryRunner.query(`DROP INDEX "public"."uq_consumer_aggregate_version"`);
        await queryRunner.query(`DROP TABLE "consumer_aggregate_versions"`);
    }

}
