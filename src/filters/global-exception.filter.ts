import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let exception_message = '';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response_data = exception.getResponse();
      const msg =
        typeof response_data === 'object' && 'message' in response_data
          ? (response_data as { message: string | string[] }).message
          : exception.message;
      message = Array.isArray(msg) ? msg.join(', ') : msg;
    } else if (exception instanceof Error) {
      exception_message = exception.message;
      message = exception.message || message;
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.path} - ${statusCode} - ${exception_message || message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.path} - ${statusCode} - ${message}`,
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.path,
    };

    response.status(statusCode).json(errorResponse);
  }
}
