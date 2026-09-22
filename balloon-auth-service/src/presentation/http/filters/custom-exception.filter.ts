import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';
import InvalidCredentialsError from '../../../domain/auth/errors/invalid-credentials.error';
import EmailAlreadyInUseError from '../../../domain/user/errors/email-already-in-use.error';
import UserNotAllowedError from '../../../domain/user/errors/user-not-allowed.error';
import UserNotFoundError from '../../../domain/user/errors/user-not-found.error';
import InvalidRefreshTokenError from '../../../domain/auth/errors/invalid-refresh-token.error';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const { status, message } = this.resolveException(exception);

    httpAdapter.reply(
      response,
      {
        statusCode: status,
        message: message,
      },
      status,
    );
  }

  private resolveException(exception: unknown): {
    status: number;
    message: string;
  } {
    console.error('exception: ', exception);

    if (exception instanceof InvalidCredentialsError) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: exception.message,
      };
    }

    if (exception instanceof EmailAlreadyInUseError) {
      return {
        status: HttpStatus.CONFLICT,
        message: exception.message,
      };
    }

    if (exception instanceof UserNotAllowedError) {
      return {
        status: HttpStatus.FORBIDDEN,
        message: exception.message,
      };
    }

    if (exception instanceof UserNotFoundError) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: exception.message,
      };
    }

    if (exception instanceof InvalidRefreshTokenError) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      return {
        status: exception.getStatus(),
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : typeof exceptionResponse?.['message'] === 'string'
              ? exceptionResponse['message']
              : 'Request failed',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
