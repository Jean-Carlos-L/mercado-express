import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiCategoryAlreadyExistsError() {
  return applyDecorators(
    ApiResponse({
      status: 409,
      description: 'A category with the same name already exists.',
      schema: {
        example: {
          statusCode: 409,
          code: 'CATEGORY_ALREADY_EXISTS',
          message: 'Category already exists.',
          method: 'POST',
          path: '/categories',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}
