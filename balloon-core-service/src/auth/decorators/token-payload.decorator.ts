import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { REQUEST_TOKEN_PAYLOAD_KEY } from "../constants/auth.constants";
import { JwtPayloadDto } from "../dtos/jwt-payload.dto";

export const TokenPayloadParam = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayloadDto => {
    const request = context.switchToHttp().getRequest();
    return request[REQUEST_TOKEN_PAYLOAD_KEY];
  },
);
