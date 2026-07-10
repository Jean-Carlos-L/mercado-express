import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { CreateProductRequest } from '../dto/create-product.request';
import { ProductPresenter } from '../presenters/product.presenter';

import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductResponse } from '../dto/product.response';
import { ApiValidationErrors } from 'src/shared/presentation/decorators/api-validation-errors.decorator';
import { ApiProductAlreadyExistsError } from 'src/shared/presentation/decorators/api-product-already-exists.decorator';
import { ApiInternalServerError } from 'src/shared/presentation/decorators/api-internal-server-error.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Creates a new product. The SKU must be unique across all products.',
  })
  @ApiCreatedResponse({
    description: 'Product created successfully.',
    type: ProductResponse,
  })
  @ApiValidationErrors()
  @ApiProductAlreadyExistsError()
  @ApiInternalServerError()
  async create(@Body() request: CreateProductRequest) {
    const product = await this.createProductUseCase.execute(request);

    return ProductPresenter.toResponse(product);
  }
}
