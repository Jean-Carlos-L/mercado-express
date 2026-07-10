import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ErrorResponse } from 'src/shared/domain/errors/dto/error-response.dto';

export function ApiDefaultErrors() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      type: ErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Resource Not Found',
      type: ErrorResponse,
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict',
      type: ErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      type: ErrorResponse,
    }),
  );
}
