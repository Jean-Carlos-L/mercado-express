import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainException } from '../../domain/errors/domain.exception';

const STATUS_MAP: Record<string, number> = {
  PRODUCT_ALREADY_EXISTS: HttpStatus.CONFLICT,
  PRODUCT_NOT_FOUND: HttpStatus.NOT_FOUND,
  INSUFFICIENT_STOCK: HttpStatus.BAD_REQUEST,
  CATEGORY_ALREADY_EXISTS: HttpStatus.CONFLICT,
  CATEGORY_NOT_FOUND: HttpStatus.NOT_FOUND,
  SUPPLIER_ALREADY_EXISTS: HttpStatus.CONFLICT,
  SUPPLIER_NOT_FOUND: HttpStatus.NOT_FOUND,
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = 'INTERNAL_SERVER_ERROR';
    let message: string = 'An unexpected error occurred.';

    if (exception instanceof DomainException) {
      statusCode = STATUS_MAP[exception.code] ?? HttpStatus.BAD_REQUEST;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as Record<string, unknown>;

        code = (body.error as string) ?? code;

        if (Array.isArray(body.message)) {
          message = body.message.join(', ');
        } else if (typeof body.message === 'string') {
          message = body.message;
        }
      }
    }

    if (statusCode >= 500) {
      this.logger.error(exception);
    } else {
      this.logger.warn(
        `${request.method} ${request.originalUrl} -> ${statusCode} ${message}`,
      );
    }

    response.status(statusCode).json({
      statusCode,
      code,
      message,
      method: request.method,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
