import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { CreateProductRequest } from '../dto/create-product.request';
import { ProductPresenter } from '../presenters/product.presenter';

import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductResponse } from '../dto/product.response';
import { ApiDefaultErrors } from 'src/shared/presentation/decorators/api-default-errors.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
  })
  @ApiCreatedResponse({
    description: 'Product created successfully.',
    type: ProductResponse,
  })
  @ApiDefaultErrors()
  async create(@Body() request: CreateProductRequest) {
    const product = await this.createProductUseCase.execute(request);

    return ProductPresenter.toResponse(product);
  }
}
