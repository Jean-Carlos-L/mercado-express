import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma.service';
import { InventoryController } from './presentation/controllers/inventory.controller';
import { AdjustStockUseCase } from './application/use-cases/adjust-stock.use-case';
import { INVENTORY_REPOSITORY } from './domain/repositories/inventory.repository';
import { PrismaInventoryRepository } from './infrastructure/persistence/prisma-inventory.repository';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [ProductModule],
  controllers: [InventoryController],
  providers: [
    PrismaService,
    AdjustStockUseCase,
    {
      provide: INVENTORY_REPOSITORY,
      useClass: PrismaInventoryRepository,
    },
  ],
  exports: [AdjustStockUseCase],
})
export class InventoryModule {}
