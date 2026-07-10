import { Category } from '../../domain/entities/category.entity';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../domain/repositories/category.repository';
import { Inject, Injectable } from '@nestjs/common';
import { PaginationMetadata } from 'src/shared/pagination/dto/pagination-metadata.response';

@Injectable()
export class FindAllCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(params: {
    page: number;
    pageSize: number;
  }): Promise<{ data: Category[]; metadata: PaginationMetadata }> {
    const { page, pageSize } = params;

    const { data, total } = await this.categoryRepository.findAll({
      page,
      pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      metadata: {
        page,
        pageSize,
        totalItems: total,
        totalPages,
      },
    };
  }
}
