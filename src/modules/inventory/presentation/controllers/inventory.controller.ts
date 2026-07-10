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
import { ApiDefaultErrors } from 'src/shared/presentation/decorators/api-default-errors.decorator';
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
  })
  @ApiOkResponse({
    description: 'Stock adjusted successfully.',
    type: AdjustStockResponse,
  })
  @ApiDefaultErrors()
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
  })
  @ApiOkResponse({
    description: 'Paginated list of products matching the filters.',
    type: PaginatedResponseType(InventoryProductResponse),
  })
  @ApiDefaultErrors()
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
  })
  @ApiOkResponse({
    description: 'Paginated list of alerts.',
    type: PaginatedResponseType(AlertResponse),
  })
  @ApiDefaultErrors()
  async findAlerts(@Query() filters: FindAlertsRequest) {
    const { data, metadata } = await this.findAlertsUseCase.execute(filters);

    return {
      data: InventoryPresenter.toAlertResponseList(data),
      metadata,
    };
  }
}
