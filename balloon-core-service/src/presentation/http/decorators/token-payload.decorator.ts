import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { TokenPayloadDto } from '../dtos/token-payload.dto';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constant';

export const TokenPayloadParam = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TokenPayloadDto => {
    const request = context
      .switchToHttp()
      .getRequest<
        Request & Record<typeof REQUEST_TOKEN_PAYLOAD_KEY, TokenPayloadDto>
      >();
    return request[REQUEST_TOKEN_PAYLOAD_KEY];
  },
);
