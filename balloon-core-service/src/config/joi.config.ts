import * as Joi from 'joi';

export function getJoiConfig() {
  return Joi.object({
    PORT: Joi.number().default(8082),
    PG_DATABASE_HOST: Joi.string().required(),
    PG_DATABASE_PORT: Joi.number().required(),
    PG_DATABASE_NAME: Joi.string().required(),
    PG_DATABASE_USERNAME: Joi.string().required(),
    PG_DATABASE_PASSWORD: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_TOKEN_AUDIENCE: Joi.string().required(),
    JWT_TOKEN_ISSUER: Joi.string().required(),
    JWT_TOKEN_EXPIRATION: Joi.number().default(3600),
    RABBITMQ_URL: Joi.string().required(),
    RABBITMQ_EXCHANGE: Joi.string().required(),
    RABBITMQ_QUEUE: Joi.string().required(),
    RABBITMQ_QUEUE_KEY: Joi.string().required(),
    RABBITMQ_DEAD_LETTER_EXCHANGE: Joi.string().required(),
    RABBITMQ_DEAD_LETTER_ROUTING_KEY: Joi.string().required(),
  });
}