import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AdjustStockUseCase } from 'src/modules/inventory/application/use-cases/adjust-stock.use-case';
import { AdjustStockRequest } from 'src/modules/inventory/presentation/dto/adjust-stock.request';
import { InventoryPresenter } from 'src/modules/inventory/presenters/inventory.presenter';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdjustStockResponse } from 'src/modules/inventory/presentation/dto/adjust-stock.response';
import { ApiDefaultErrors } from 'src/shared/presentation/decorators/api-default-errors.decorator';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly adjustStockUseCase: AdjustStockUseCase) {}

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
}
