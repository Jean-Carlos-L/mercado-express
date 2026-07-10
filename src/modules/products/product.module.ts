import { Module } from '@nestjs/common';

import { PrismaService } from 'src/shared/database/prisma.service';

import { ProductController } from './presentation/controllers/product.controller';

import { CreateProductUseCase } from './application/use-cases/create-product.use-case';

import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository';

import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';

@Module({
  controllers: [ProductController],

  providers: [
    PrismaService,

    CreateProductUseCase,

    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],

  exports: [CreateProductUseCase, PRODUCT_REPOSITORY],
})
export class ProductModule {}
