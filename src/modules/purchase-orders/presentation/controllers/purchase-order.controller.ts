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
  ApiTags,
} from '@nestjs/swagger';
import { PurchaseOrderResponse } from 'src/modules/purchase-orders/presentation/dto/purchase-order.response';
import { ApiDefaultErrors } from 'src/shared/presentation/decorators/api-default-errors.decorator';
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
  })
  @ApiCreatedResponse({
    description: 'Purchase order created successfully.',
    type: PurchaseOrderResponse,
  })
  @ApiDefaultErrors()
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
  })
  @ApiOkResponse({
    description: 'Paginated list of purchase orders.',
    type: PaginatedResponseType(PurchaseOrderResponse),
  })
  @ApiDefaultErrors()
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
  })
  @ApiOkResponse({
    description: 'Purchase order approved successfully.',
    type: PurchaseOrderResponse,
  })
  @ApiDefaultErrors()
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
  })
  @ApiOkResponse({
    description: 'Purchase order rejected successfully.',
    type: PurchaseOrderResponse,
  })
  @ApiDefaultErrors()
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
  })
  @ApiOkResponse({
    description:
      'Purchase order received. Stock updated and inventory transaction recorded.',
  })
  @ApiDefaultErrors()
  async receive(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.receivePurchaseOrderUseCase.execute(id);

    return {
      order: PurchaseOrderPresenter.toResponse(result.order),
      stockAdjustment: result.stockAdjustment,
    };
  }
}
