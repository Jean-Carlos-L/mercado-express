import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiPurchaseOrderNotFoundError() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: 'The specified purchase order does not exist.',
      schema: {
        example: {
          statusCode: 404,
          code: 'PURCHASE_ORDER_NOT_FOUND',
          message: 'Purchase order not found.',
          method: 'PATCH',
          path: '/purchase-orders/550e8400-e29b-41d4-a716-446655440000/approve',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}
