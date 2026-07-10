import { Module } from '@nestjs/common';

import { PrismaService } from 'src/shared/database/prisma.service';

import { SupplierController } from './presentation/controllers/supplier.controller';

import { CreateSupplierUseCase } from './application/use-cases/create-supplier.use-case';
import { FindAllSuppliersUseCase } from './application/use-cases/find-all-suppliers.use-case';

import { SUPPLIER_REPOSITORY } from './domain/repositories/supplier.repository';

import { PrismaSupplierRepository } from './infrastructure/persistence/prisma-supplier.repository';

@Module({
  controllers: [SupplierController],

  providers: [
    PrismaService,

    CreateSupplierUseCase,
    FindAllSuppliersUseCase,

    {
      provide: SUPPLIER_REPOSITORY,
      useClass: PrismaSupplierRepository,
    },
  ],

  exports: [CreateSupplierUseCase, FindAllSuppliersUseCase],
})
export class SupplierModule {}
