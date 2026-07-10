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
import { ApiDefaultErrors } from 'src/shared/presentation/decorators/api-default-errors.decorator';
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
  })
  @ApiCreatedResponse({
    description: 'Supplier created successfully.',
    type: SupplierResponse,
  })
  @ApiDefaultErrors()
  async create(@Body() request: CreateSupplierRequest) {
    const supplier = await this.createSupplierUseCase.execute(request);

    return SupplierPresenter.toResponse(supplier);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all suppliers with pagination',
  })
  @ApiOkResponse({
    description: 'Paginated list of suppliers.',
    type: PaginatedResponseType(SupplierResponse),
  })
  @ApiDefaultErrors()
  async findAll(@Query() pagination: PaginationRequest) {
    const { data, metadata } =
      await this.findAllSuppliersUseCase.execute(pagination);

    return {
      data: SupplierPresenter.toResponseList(data),
      metadata,
    };
  }
}
