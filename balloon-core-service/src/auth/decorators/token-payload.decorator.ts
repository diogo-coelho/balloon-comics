import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { REQUEST_TOKEN_PAYLOAD_KEY } from '../../constants/auth.constants';
import { TokenPayloadDto } from '../dtos/request/token-payload.dto';

export const TokenPayloadParam = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TokenPayloadDto => {
    const request = context.switchToHttp().getRequest();
    return request[REQUEST_TOKEN_PAYLOAD_KEY];
  },
);
