import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma.service';
import { PurchaseOrderController } from './presentation/controllers/purchase-order.controller';
import { CreatePurchaseOrderUseCase } from './application/use-cases/create-purchase-order.use-case';
import { ApprovePurchaseOrderUseCase } from './application/use-cases/approve-purchase-order.use-case';
import { RejectPurchaseOrderUseCase } from './application/use-cases/reject-purchase-order.use-case';
import { ReceivePurchaseOrderUseCase } from './application/use-cases/receive-purchase-order.use-case';
import { FindPurchaseOrdersUseCase } from './application/use-cases/find-purchase-orders.use-case';
import { PURCHASE_ORDER_REPOSITORY } from './domain/repositories/purchase-order.repository';
import { PrismaPurchaseOrderRepository } from './infrastructure/persistence/prisma-purchase-order.repository';
import { ProductModule } from '../products/product.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [ProductModule, InventoryModule],
  controllers: [PurchaseOrderController],
  providers: [
    PrismaService,
    CreatePurchaseOrderUseCase,
    ApprovePurchaseOrderUseCase,
    RejectPurchaseOrderUseCase,
    ReceivePurchaseOrderUseCase,
    FindPurchaseOrdersUseCase,
    {
      provide: PURCHASE_ORDER_REPOSITORY,
      useClass: PrismaPurchaseOrderRepository,
    },
  ],
  exports: [CreatePurchaseOrderUseCase],
})
export class PurchaseOrderModule {}
