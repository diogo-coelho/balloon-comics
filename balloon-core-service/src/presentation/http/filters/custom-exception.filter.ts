import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';
import ReaderNotFoundError from '../../../domain/reader/errors/reader-not-found.error';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.adapterHost;

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const { status, message } = this.resolveException(exception)

    httpAdapter.reply(
      response,
      {
        statusCode: status,
        message: message,
      },
      status,
    );
  }

  private resolveException(exception: unknown): { status: number, message: string } {
    console.error("exception: ", exception);

    if (exception instanceof ReaderNotFoundError) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: typeof exception.getResponse() === 'string' ?
                  exception.getResponse() :
                  exception.getResponse()?.['message']

      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error'
    }
  }
}
