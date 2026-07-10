import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiProductAlreadyExistsError() {
  return applyDecorators(
    ApiResponse({
      status: 409,
      description: 'A product with the same SKU already exists.',
      schema: {
        example: {
          statusCode: 409,
          code: 'PRODUCT_ALREADY_EXISTS',
          message: 'Product already exists.',
          method: 'POST',
          path: '/products',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}
