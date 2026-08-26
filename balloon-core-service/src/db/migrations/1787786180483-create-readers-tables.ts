import { text } from "stream/consumers";
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReadersTables1787786180483 implements MigrationInterface {
    name = 'CreateReadersTables1787786180483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE "processed_events" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "event_id" uuid NOT NULL, 
            "consumer" character varying(100) NOT NULL, 
            "processed_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_a08d68aa0747daea9efd2ddea53" PRIMARY KEY ("id")
          )`);
        await queryRunner.query(`
          CREATE UNIQUE INDEX "uq_processed_event_consumer" 
            ON "processed_events"  ("event_id", "consumer") 
          `);
        await queryRunner.query(`
          CREATE TABLE "readers" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "user_id" uuid NOT NULL, 
            "email" character varying(100) NOT NULL, 
            "username" character varying(200) NOT NULL, 
            "name" character varying(150) NOT NULL, 
            "image_url" text, 
            "description" text, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_2e5d94878c0160669463db32a48" UNIQUE ("user_id"), 
            CONSTRAINT "UQ_35aa5640d464bf2cb67e636aa5f" UNIQUE ("email"), 
            CONSTRAINT "UQ_9f9b5be0416ee2d3269b3476be2" UNIQUE ("username"), 
            CONSTRAINT "PK_4564309186c3e23496d65a80b4d" PRIMARY KEY ("id")
          )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "readers"`);
        await queryRunner.query(`DROP INDEX "public"."uq_processed_event_consumer"`);
        await queryRunner.query(`DROP TABLE "processed_events"`);
    }

}
