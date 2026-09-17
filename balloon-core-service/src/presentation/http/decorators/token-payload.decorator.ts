import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayloadDto } from '../dtos/token-payload.dto';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constant';

export const TokenPayloadParam = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TokenPayloadDto => {
    const request = context.switchToHttp().getRequest();
    return request[REQUEST_TOKEN_PAYLOAD_KEY];
  },
);
