import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiProductNotFoundError() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'The specified product does not exist.',
      schema: {
        example: {
          statusCode: 400,
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.',
          method: 'POST',
          path: '/inventory/adjustments',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}
