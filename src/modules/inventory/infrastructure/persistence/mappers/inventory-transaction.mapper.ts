import { InventoryTransaction as PrismaInventoryTransaction } from '@prisma/client';
import { InventoryTransaction } from '../../../domain/entities/inventory-transaction.entity';

export class InventoryTransactionMapper {
  static toDomain(
    prismaTransaction: PrismaInventoryTransaction,
  ): InventoryTransaction {
    return InventoryTransaction.restore({
      id: prismaTransaction.id,
      productId: prismaTransaction.product_id,
      quantity: prismaTransaction.quantity,
      reason: prismaTransaction.reason,
      transactionType: prismaTransaction.transaction_type,
      createdAt: prismaTransaction.created_at,
    });
  }

  static toPersistence(transaction: InventoryTransaction) {
    return {
      id: transaction.id,
      product_id: transaction.productId,
      quantity: transaction.quantity,
      reason: transaction.reason,
      transaction_type: transaction.transactionType,
      created_at: transaction.createdAt,
    };
  }
}
