import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { FindAllCategoriesUseCase } from '../../application/use-cases/find-all-categories.use-case';
import { CreateCategoryRequest } from '../dto/create-category.request';
import { CategoryPresenter } from '../presenters/category.presenter';

import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryResponse } from '../dto/category.response';
import { ApiValidationErrors } from 'src/shared/presentation/decorators/api-validation-errors.decorator';
import { ApiCategoryAlreadyExistsError } from 'src/shared/presentation/decorators/api-category-already-exists.decorator';
import { ApiInternalServerError } from 'src/shared/presentation/decorators/api-internal-server-error.decorator';
import { PaginationRequest } from 'src/shared/pagination/dto/pagination.request';
import { PaginatedResponseType } from 'src/shared/pagination/dto/paginated-response';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Creates a new category. The name must be unique across all categories.',
  })
  @ApiCreatedResponse({
    description: 'Category created successfully.',
    type: CategoryResponse,
  })
  @ApiValidationErrors()
  @ApiCategoryAlreadyExistsError()
  @ApiInternalServerError()
  async create(@Body() request: CreateCategoryRequest) {
    const category = await this.createCategoryUseCase.execute(request);

    return CategoryPresenter.toResponse(category);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all categories with pagination',
    description:
      'Returns a paginated list of all categories. This is a read-only endpoint that does not produce domain errors.',
  })
  @ApiOkResponse({
    description: 'Paginated list of categories.',
    type: PaginatedResponseType(CategoryResponse),
  })
  @ApiInternalServerError()
  async findAll(@Query() pagination: PaginationRequest) {
    const { data, metadata } =
      await this.findAllCategoriesUseCase.execute(pagination);

    return {
      data: CategoryPresenter.toResponseList(data),
      metadata,
    };
  }
}
