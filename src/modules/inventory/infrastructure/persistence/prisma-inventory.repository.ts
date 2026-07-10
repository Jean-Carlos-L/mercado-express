import { InventoryTransaction } from 'src/modules/inventory/domain/entities/inventory-transaction.entity';
import { InventoryRepository } from 'src/modules/inventory/domain/repositories/inventory.repository';
import { PrismaService } from 'src/shared/database/prisma.service';
import { InventoryTransactionMapper } from './mappers/inventory-transaction.mapper';
import { Injectable } from '@nestjs/common';

type AdjustStockResult = {
  product: { id: string; currentStock: number };
  transaction: InventoryTransaction;
};

@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async adjustStock(params: {
    productId: string;
    quantity: number;
    type: 'INCOMING' | 'OUTGOING';
    reason: string;
  }): Promise<AdjustStockResult | null> {
    const result = await this.prisma.$transaction(async (tx) => {
      const affectedRows = await tx.$executeRawUnsafe(
        `UPDATE products
         SET current_stock = current_stock + $1
         WHERE id = $2 AND (current_stock + $1) >= 0`,
        params.quantity,
        params.productId,
      );

      if (affectedRows === 0) {
        return null;
      }

      const transaction = await tx.inventoryTransaction.create({
        data: {
          product_id: params.productId,
          quantity: params.quantity,
          reason: params.reason,
          transaction_type: params.type,
        },
      });

      const product = await tx.product.findUniqueOrThrow({
        where: { id: params.productId },
        select: { id: true, current_stock: true },
      });

      return {
        product: { id: product.id, currentStock: product.current_stock },
        transaction: InventoryTransactionMapper.toDomain(transaction),
      };
    });

    return result ?? null;
  }
}
