import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiInvalidOrderStatusTransitionError() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description:
        'The requested status transition is not allowed from the current status.',
      schema: {
        example: {
          statusCode: 400,
          code: 'INVALID_ORDER_STATUS_TRANSITION',
          message: 'Cannot transition from PENDING to RECEIVED.',
          method: 'PATCH',
          path: '/purchase-orders/550e8400-e29b-41d4-a716-446655440000/receive',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}
