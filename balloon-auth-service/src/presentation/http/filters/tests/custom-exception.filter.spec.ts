import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { CustomExceptionFilter } from './custom-exception.filter';

describe('CustomExceptionFilter', () => {
  it('deve responder com o status e a mensagem da exceção usando o httpAdapter', () => {
    const reply = jest.fn();
    const adapterHost = {
      httpAdapter: { reply },
    } as unknown as HttpAdapterHost;
    const response = {};
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    const filter = new CustomExceptionFilter(adapterHost);
    const exception = new BadRequestException('Dados inválidos');

    filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      response,
      {
        statusCode: 400,
        message: 'Dados inválidos',
      },
      400,
    );
  });
});
