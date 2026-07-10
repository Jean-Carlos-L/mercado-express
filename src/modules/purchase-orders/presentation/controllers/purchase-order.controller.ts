import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePurchaseOrderUseCase } from 'src/modules/purchase-orders/application/use-cases/create-purchase-order.use-case';
import { ApprovePurchaseOrderUseCase } from 'src/modules/purchase-orders/application/use-cases/approve-purchase-order.use-case';
import { RejectPurchaseOrderUseCase } from 'src/modules/purchase-orders/application/use-cases/reject-purchase-order.use-case';
import { ReceivePurchaseOrderUseCase } from 'src/modules/purchase-orders/application/use-cases/receive-purchase-order.use-case';
import { FindPurchaseOrdersUseCase } from 'src/modules/purchase-orders/application/use-cases/find-purchase-orders.use-case';
import { CreatePurchaseOrderRequest } from 'src/modules/purchase-orders/presentation/dto/create-purchase-order.request';
import { RejectPurchaseOrderRequest } from 'src/modules/purchase-orders/presentation/dto/reject-purchase-order.request';
import { FindPurchaseOrdersRequest } from 'src/modules/purchase-orders/presentation/dto/find-purchase-orders.request';
import { PurchaseOrderPresenter } from 'src/modules/purchase-orders/presenters/purchase-order.presenter';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PurchaseOrderResponse } from 'src/modules/purchase-orders/presentation/dto/purchase-order.response';
import { ApiValidationErrors } from 'src/shared/presentation/decorators/api-validation-errors.decorator';
import { ApiProductNotFoundError } from 'src/shared/presentation/decorators/api-product-not-found.decorator';
import { ApiAlertIdNotAllowedForManualError } from 'src/shared/presentation/decorators/api-alert-id-not-allowed-for-manual.decorator';
import { ApiAlertNotActiveError } from 'src/shared/presentation/decorators/api-alert-not-active.decorator';
import { ApiInvalidQuantityForOrderError } from 'src/shared/presentation/decorators/api-invalid-quantity-for-order.decorator';
import { ApiPurchaseOrderNotFoundError } from 'src/shared/presentation/decorators/api-purchase-order-not-found.decorator';
import { ApiInvalidOrderStatusTransitionError } from 'src/shared/presentation/decorators/api-invalid-order-status-transition.decorator';
import { ApiInternalServerError } from 'src/shared/presentation/decorators/api-internal-server-error.decorator';
import { PaginatedResponseType } from 'src/shared/pagination/dto/paginated-response';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(
    private readonly createPurchaseOrderUseCase: CreatePurchaseOrderUseCase,
    private readonly approvePurchaseOrderUseCase: ApprovePurchaseOrderUseCase,
    private readonly rejectPurchaseOrderUseCase: RejectPurchaseOrderUseCase,
    private readonly receivePurchaseOrderUseCase: ReceivePurchaseOrderUseCase,
    private readonly findPurchaseOrdersUseCase: FindPurchaseOrdersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new purchase order',
    description:
      'Creates a new purchase order. Use source MANUAL for user-created orders (alertId must not be provided). Use source LOW_STOCK_ALERT for system-generated orders (alertId is required and must be active).',
  })
  @ApiCreatedResponse({
    description: 'Purchase order created successfully.',
    type: PurchaseOrderResponse,
  })
  @ApiValidationErrors()
  @ApiProductNotFoundError()
  @ApiAlertIdNotAllowedForManualError()
  @ApiAlertNotActiveError()
  @ApiInvalidQuantityForOrderError()
  @ApiInternalServerError()
  async create(
    @Body() request: CreatePurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> {
    const order = await this.createPurchaseOrderUseCase.execute(request);

    return PurchaseOrderPresenter.toResponse(order);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List purchase orders with optional filters',
    description:
      'Returns a paginated list of purchase orders with optional filters by product, supplier, and status.',
  })
  @ApiOkResponse({
    description: 'Paginated list of purchase orders.',
    type: PaginatedResponseType(PurchaseOrderResponse),
  })
  @ApiInternalServerError()
  async findAll(@Query() filters: FindPurchaseOrdersRequest) {
    const { data, metadata } =
      await this.findPurchaseOrdersUseCase.execute(filters);

    return {
      data: PurchaseOrderPresenter.toResponseList(data),
      metadata,
    };
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a pending purchase order',
    description:
      'Approves a purchase order that is in PENDING status. Orders in other statuses cannot be approved.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Purchase order approved successfully.',
    type: PurchaseOrderResponse,
  })
  @ApiPurchaseOrderNotFoundError()
  @ApiInvalidOrderStatusTransitionError()
  @ApiInternalServerError()
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PurchaseOrderResponse> {
    const order = await this.approvePurchaseOrderUseCase.execute(id);

    return PurchaseOrderPresenter.toResponse(order);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a pending purchase order',
    description:
      'Rejects a purchase order that is in PENDING status. Requires a rejectionReason. Orders in other statuses cannot be rejected.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Purchase order rejected successfully.',
    type: PurchaseOrderResponse,
  })
  @ApiValidationErrors()
  @ApiPurchaseOrderNotFoundError()
  @ApiInvalidOrderStatusTransitionError()
  @ApiInternalServerError()
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() request: RejectPurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> {
    const order = await this.rejectPurchaseOrderUseCase.execute(id, request);

    return PurchaseOrderPresenter.toResponse(order);
  }

  @Patch(':id/receive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive an approved purchase order',
    description:
      'Receives an approved purchase order (status must be APPROVED). Updates product stock and records an inventory transaction.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description:
      'Purchase order received. Stock updated and inventory transaction recorded.',
  })
  @ApiPurchaseOrderNotFoundError()
  @ApiInvalidOrderStatusTransitionError()
  @ApiInternalServerError()
  async receive(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.receivePurchaseOrderUseCase.execute(id);

    return {
      order: PurchaseOrderPresenter.toResponse(result.order),
      stockAdjustment: result.stockAdjustment,
    };
  }
}
