import * as Joi from 'joi';

export function getJoiConfig() {
  return Joi.object({
    PORT: Joi.number().default(8081),
    JWT_PRIVATE_KEY: Joi.string().required(),
    JWT_PUBLIC_KEY: Joi.string().required(),
    JWT_TOKEN_AUDIENCE: Joi.string().required(),
    JWT_TOKEN_ISSUER: Joi.string().required(),
    JWT_TOKEN_EXPIRATION: Joi.number().default(3600),
    JWT_REFRESH_TOKEN_EXPIRATION: Joi.number().default(86400),
    PG_DATABASE_HOST: Joi.string().required(),
    PG_DATABASE_PORT: Joi.number().required(),
    PG_DATABASE_NAME: Joi.string().required(),
    PG_DATABASE_USERNAME: Joi.string().required(),
    PG_DATABASE_PASSWORD: Joi.string().required(),
    NEXT_URL: Joi.string().required(),
    RABBITMQ_DEFAULT_USER: Joi.string().required(),
    RABBITMQ_DEFAULT_PASS: Joi.string().required(),
    RABBITMQ_URL: Joi.string().required(),
  });
}