import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AdjustStockUseCase } from 'src/modules/inventory/application/use-cases/adjust-stock.use-case';
import { FindAlertsUseCase } from 'src/modules/inventory/application/use-cases/find-alerts.use-case';
import { FindInventoryUseCase } from 'src/modules/inventory/application/use-cases/find-inventory.use-case';
import { AdjustStockRequest } from 'src/modules/inventory/presentation/dto/adjust-stock.request';
import { FindAlertsRequest } from 'src/modules/inventory/presentation/dto/find-alerts.request';
import { FindInventoryRequest } from 'src/modules/inventory/presentation/dto/find-inventory.request';
import { InventoryPresenter } from 'src/modules/inventory/presenters/inventory.presenter';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdjustStockResponse } from 'src/modules/inventory/presentation/dto/adjust-stock.response';
import { AlertResponse } from 'src/modules/inventory/presentation/dto/alert.response';
import { InventoryProductResponse } from 'src/modules/inventory/presentation/dto/inventory-product.response';
import { ApiValidationErrors } from 'src/shared/presentation/decorators/api-validation-errors.decorator';
import { ApiProductNotFoundError } from 'src/shared/presentation/decorators/api-product-not-found.decorator';
import { ApiInsufficientStockError } from 'src/shared/presentation/decorators/api-insufficient-stock.decorator';
import { ApiInternalServerError } from 'src/shared/presentation/decorators/api-internal-server-error.decorator';
import { PaginatedResponseType } from 'src/shared/pagination/dto/paginated-response';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly adjustStockUseCase: AdjustStockUseCase,
    private readonly findAlertsUseCase: FindAlertsUseCase,
    private readonly findInventoryUseCase: FindInventoryUseCase,
  ) {}

  @Post('adjustments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adjust product stock (incoming or outgoing)',
    description:
      'Adjusts the stock of a product. Use INCOMING to add stock or OUTGOING to remove stock. OUTGOING adjustments will fail if there is insufficient stock.',
  })
  @ApiOkResponse({
    description: 'Stock adjusted successfully.',
    type: AdjustStockResponse,
  })
  @ApiValidationErrors()
  @ApiProductNotFoundError()
  @ApiInsufficientStockError()
  @ApiInternalServerError()
  async adjust(
    @Body() request: AdjustStockRequest,
  ): Promise<AdjustStockResponse> {
    const result = await this.adjustStockUseCase.execute(request);

    return InventoryPresenter.toAdjustStockResponse(result);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Query inventory with optional filters',
    description:
      'Returns a paginated list of products with optional filters by category, supplier, stock range, or active alerts.',
  })
  @ApiOkResponse({
    description: 'Paginated list of products matching the filters.',
    type: PaginatedResponseType(InventoryProductResponse),
  })
  @ApiInternalServerError()
  async findInventory(@Query() filters: FindInventoryRequest) {
    const { data, metadata } = await this.findInventoryUseCase.execute(filters);

    return {
      data: InventoryPresenter.toInventoryProductResponseList(data),
      metadata,
    };
  }

  @Get('alerts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List alerts with optional filters',
    description:
      'Returns a paginated list of inventory alerts with optional filters by product and status.',
  })
  @ApiOkResponse({
    description: 'Paginated list of alerts.',
    type: PaginatedResponseType(AlertResponse),
  })
  @ApiInternalServerError()
  async findAlerts(@Query() filters: FindAlertsRequest) {
    const { data, metadata } = await this.findAlertsUseCase.execute(filters);

    return {
      data: InventoryPresenter.toAlertResponseList(data),
      metadata,
    };
  }
}
