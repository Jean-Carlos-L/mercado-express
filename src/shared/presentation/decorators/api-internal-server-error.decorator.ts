import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiInternalServerError() {
  return applyDecorators(
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        example: {
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred.',
          method: 'GET',
          path: '/resource',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}
