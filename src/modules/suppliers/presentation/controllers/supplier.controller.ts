import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { CreateSupplierUseCase } from '../../application/use-cases/create-supplier.use-case';
import { FindAllSuppliersUseCase } from '../../application/use-cases/find-all-suppliers.use-case';
import { CreateSupplierRequest } from '../dto/create-supplier.request';
import { SupplierPresenter } from '../presenters/supplier.presenter';

import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupplierResponse } from '../dto/supplier.response';
import { ApiValidationErrors } from 'src/shared/presentation/decorators/api-validation-errors.decorator';
import { ApiSupplierAlreadyExistsError } from 'src/shared/presentation/decorators/api-supplier-already-exists.decorator';
import { ApiInternalServerError } from 'src/shared/presentation/decorators/api-internal-server-error.decorator';
import { PaginationRequest } from 'src/shared/pagination/dto/pagination.request';
import { PaginatedResponseType } from 'src/shared/pagination/dto/paginated-response';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SupplierController {
  constructor(
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly findAllSuppliersUseCase: FindAllSuppliersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new supplier',
    description:
      'Creates a new supplier. The name must be unique across all suppliers.',
  })
  @ApiCreatedResponse({
    description: 'Supplier created successfully.',
    type: SupplierResponse,
  })
  @ApiValidationErrors()
  @ApiSupplierAlreadyExistsError()
  @ApiInternalServerError()
  async create(@Body() request: CreateSupplierRequest) {
    const supplier = await this.createSupplierUseCase.execute(request);

    return SupplierPresenter.toResponse(supplier);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all suppliers with pagination',
    description:
      'Returns a paginated list of all suppliers. This is a read-only endpoint that does not produce domain errors.',
  })
  @ApiOkResponse({
    description: 'Paginated list of suppliers.',
    type: PaginatedResponseType(SupplierResponse),
  })
  @ApiInternalServerError()
  async findAll(@Query() pagination: PaginationRequest) {
    const { data, metadata } =
      await this.findAllSuppliersUseCase.execute(pagination);

    return {
      data: SupplierPresenter.toResponseList(data),
      metadata,
    };
  }
}
