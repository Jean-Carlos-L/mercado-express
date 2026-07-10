import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma.service';
import { InventoryController } from './presentation/controllers/inventory.controller';
import { AdjustStockUseCase } from './application/use-cases/adjust-stock.use-case';
import { FindAlertsUseCase } from './application/use-cases/find-alerts.use-case';
import { INVENTORY_REPOSITORY } from './domain/repositories/inventory.repository';
import { ALERT_REPOSITORY } from './domain/repositories/alert.repository';
import { PrismaInventoryRepository } from './infrastructure/persistence/prisma-inventory.repository';
import { PrismaAlertRepository } from './infrastructure/persistence/prisma-alert.repository';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [ProductModule],
  controllers: [InventoryController],
  providers: [
    PrismaService,
    AdjustStockUseCase,
    FindAlertsUseCase,
    {
      provide: INVENTORY_REPOSITORY,
      useClass: PrismaInventoryRepository,
    },
    {
      provide: ALERT_REPOSITORY,
      useClass: PrismaAlertRepository,
    },
  ],
  exports: [AdjustStockUseCase, FindAlertsUseCase],
})
export class InventoryModule {}
