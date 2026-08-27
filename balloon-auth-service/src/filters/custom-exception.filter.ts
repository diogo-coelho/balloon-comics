import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Response } from "express";

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {

  constructor(private adapterHost: HttpAdapterHost) {}
  
  catch(exception: HttpException, host: ArgumentsHost) {

    const { httpAdapter } = this.adapterHost;

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;

    httpAdapter.reply(response, {
      statusCode: status,
      message: message,
    }, status);
  }

}
