import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1788391903292 implements MigrationInterface {
    name = 'CreateTables1788391903292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."authors_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'BANNED')`);
        await queryRunner.query(`CREATE TABLE "authors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pen_name" character varying(255) NOT NULL, "biography" text, "website" character varying(255), "status" "public"."authors_status_enum" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reader_id" uuid NOT NULL, CONSTRAINT "UQ_4d6e96a94120b7d548a9f6a3f1b" UNIQUE ("pen_name"), CONSTRAINT "REL_5064b1842d13bd17251cfbce7f" UNIQUE ("reader_id"), CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "social_media_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reader_id" uuid NOT NULL, CONSTRAINT "UQ_ce44e62af46ed84b86a0e38047b" UNIQUE ("reader_id", "name"), CONSTRAINT "PK_b5c604dc454e8817fc5bfa230ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "readers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "email" character varying(100) NOT NULL, "username" character varying(200) NOT NULL, "name" character varying(150) NOT NULL, "image_url" text, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2e5d94878c0160669463db32a48" UNIQUE ("user_id"), CONSTRAINT "UQ_35aa5640d464bf2cb67e636aa5f" UNIQUE ("email"), CONSTRAINT "UQ_9f9b5be0416ee2d3269b3476be2" UNIQUE ("username"), CONSTRAINT "PK_4564309186c3e23496d65a80b4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "age_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "has_legal_age" boolean NOT NULL, "date_of_birth" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reader_id" uuid NOT NULL, CONSTRAINT "REL_3d90a369e8451c11d3b7235eb2" UNIQUE ("reader_id"), CONSTRAINT "PK_ac5c7c3b69a34f7d29ed3a1ab2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "processed_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "consumer" character varying(100) NOT NULL, "processed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a08d68aa0747daea9efd2ddea53" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_processed_event_consumer" ON "processed_events"  ("event_id", "consumer") `);
        await queryRunner.query(`ALTER TABLE "authors" ADD CONSTRAINT "FK_5064b1842d13bd17251cfbce7f6" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "social_media_links" ADD CONSTRAINT "FK_bbab910fcfb70961a38e059d09b" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "age_verifications" ADD CONSTRAINT "FK_3d90a369e8451c11d3b7235eb2e" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "age_verifications" DROP CONSTRAINT "FK_3d90a369e8451c11d3b7235eb2e"`);
        await queryRunner.query(`ALTER TABLE "social_media_links" DROP CONSTRAINT "FK_bbab910fcfb70961a38e059d09b"`);
        await queryRunner.query(`ALTER TABLE "authors" DROP CONSTRAINT "FK_5064b1842d13bd17251cfbce7f6"`);
        await queryRunner.query(`DROP INDEX "public"."uq_processed_event_consumer"`);
        await queryRunner.query(`DROP TABLE "processed_events"`);
        await queryRunner.query(`DROP TABLE "age_verifications"`);
        await queryRunner.query(`DROP TABLE "readers"`);
        await queryRunner.query(`DROP TABLE "social_media_links"`);
        await queryRunner.query(`DROP TABLE "authors"`);
        await queryRunner.query(`DROP TYPE "public"."authors_status_enum"`);
    }

}
