import { Category } from '../../domain/entities/category.entity';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../../domain/repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryAlreadyExistsError } from '../../domain/errors/category-already-exists.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(dto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findByName(dto.name);

    if (existingCategory) {
      throw new CategoryAlreadyExistsError();
    }

    const category = Category.create({ name: dto.name });

    await this.categoryRepository.save(category);

    return category;
  }
}
