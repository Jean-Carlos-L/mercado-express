import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiValidationErrors() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Validation failed. One or more request fields are invalid.',
      schema: {
        example: {
          statusCode: 400,
          error: 'Bad Request',
          message: [
            'name must be longer than or equal to 3 characters',
            'sku must be longer than or equal to 6 characters',
          ],
        },
      },
    }),
  );
}
