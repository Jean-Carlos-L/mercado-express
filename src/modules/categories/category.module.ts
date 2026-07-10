import { Module } from '@nestjs/common';

import { PrismaService } from 'src/shared/database/prisma.service';

import { CategoryController } from './presentation/controllers/category.controller';

import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { FindAllCategoriesUseCase } from './application/use-cases/find-all-categories.use-case';

import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository';

import { PrismaCategoryRepository } from './infrastructure/persistence/prisma-category.repository';

@Module({
  controllers: [CategoryController],

  providers: [
    PrismaService,

    CreateCategoryUseCase,
    FindAllCategoriesUseCase,

    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
  ],

  exports: [CreateCategoryUseCase, FindAllCategoriesUseCase],
})
export class CategoryModule {}
