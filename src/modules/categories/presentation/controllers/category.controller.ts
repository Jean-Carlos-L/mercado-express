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
import { ApiDefaultErrors } from 'src/shared/presentation/decorators/api-default-errors.decorator';
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
  })
  @ApiCreatedResponse({
    description: 'Category created successfully.',
    type: CategoryResponse,
  })
  @ApiDefaultErrors()
  async create(@Body() request: CreateCategoryRequest) {
    const category = await this.createCategoryUseCase.execute(request);

    return CategoryPresenter.toResponse(category);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all categories with pagination',
  })
  @ApiOkResponse({
    description: 'Paginated list of categories.',
    type: PaginatedResponseType(CategoryResponse),
  })
  @ApiDefaultErrors()
  async findAll(@Query() pagination: PaginationRequest) {
    const { data, metadata } =
      await this.findAllCategoriesUseCase.execute(pagination);

    return {
      data: CategoryPresenter.toResponseList(data),
      metadata,
    };
  }
}
