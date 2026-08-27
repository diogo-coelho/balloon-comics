import { ExecutionContext } from '@nestjs/common';

import { TokenPayloadParam } from '../decorators/token-payload.decorator';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constant';

const ROUTE_ARGS_METADATA = '__routeArguments__';

const getParamDecoratorFactory = (decorator: any) => {
  class TestDecorator {
    public test(@decorator() _value: unknown) {}
  }

  const args = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestDecorator,
    'test',
  );

  return args[Object.keys(args)[0]].factory;
};

describe('TokenPayloadParam', () => {
  it('deve retornar o payload do token anexado à requisição', () => {
    const factory = getParamDecoratorFactory(TokenPayloadParam);
    const tokenPayload = { sub: 'user-id', email: 'usuario@teste.com' };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          [REQUEST_TOKEN_PAYLOAD_KEY]: tokenPayload,
        }),
      }),
    } as unknown as ExecutionContext;

    const result = factory(undefined, context);

    expect(result).toBe(tokenPayload);
  });
});
