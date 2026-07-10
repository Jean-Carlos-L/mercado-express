import { ReceivePurchaseOrderUseCase } from './receive-purchase-order.use-case';
import { PurchaseOrderRepository } from '../../domain/repositories/purchase-order.repository';
import { AdjustStockUseCase } from 'src/modules/inventory/application/use-cases/adjust-stock.use-case';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { PurchaseOrderNotFoundError } from '../../domain/errors/purchase-order-not-found.error';
import { InvalidOrderStatusTransitionError } from '../../domain/errors/invalid-order-status-transition.error';

describe('ReceivePurchaseOrderUseCase', () => {
  let useCase: ReceivePurchaseOrderUseCase;
  let purchaseOrderRepository: jest.Mocked<PurchaseOrderRepository>;
  let adjustStockUseCase: jest.Mocked<AdjustStockUseCase>;

  const mockOrder = (overrides?: Partial<PurchaseOrder>): PurchaseOrder => {
    return {
      id: 'order-uuid',
      productId: 'prod-uuid',
      quantity: 20,
      supplierId: 'sup-uuid',
      status: 'APPROVED',
      source: 'MANUAL',
      alertId: null,
      createdAt: new Date(),
      rejectionReason: null,
      ...overrides,
    } as PurchaseOrder;
  };

  beforeEach(() => {
    purchaseOrderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findByFilters: jest.fn(),
    };

    adjustStockUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<AdjustStockUseCase>;

    useCase = new ReceivePurchaseOrderUseCase(
      purchaseOrderRepository,
      adjustStockUseCase,
    );
  });

  describe('when order is not found', () => {
    it('should throw PurchaseOrderNotFoundError', async () => {
      purchaseOrderRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent')).rejects.toThrow(
        PurchaseOrderNotFoundError,
      );
    });
  });

  describe('when order is in APPROVED status', () => {
    it('should receive the order, adjust stock, and update status', async () => {
      const order = mockOrder({ status: 'APPROVED' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      adjustStockUseCase.execute.mockResolvedValue({
        product: { id: 'prod-uuid', currentStock: 40 },
        transaction: { id: 'txn-uuid', createdAt: new Date() } as any,
        alert: null,
      });

      const updatedOrder = mockOrder({ status: 'RECEIVED' });
      purchaseOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

      const result = await useCase.execute('order-uuid');

      expect(adjustStockUseCase.execute).toHaveBeenCalledWith({
        productId: 'prod-uuid',
        type: 'INCOMING',
        quantity: 20,
        reason: 'Purchase order received: order-uuid',
      });

      expect(purchaseOrderRepository.updateStatus).toHaveBeenCalledWith(
        'order-uuid',
        'RECEIVED',
      );

      expect(result.order.status).toBe('RECEIVED');
      expect(result.stockAdjustment.product.currentStock).toBe(40);
    });

    it('should return alert data when alert is resolved', async () => {
      const order = mockOrder({ status: 'APPROVED' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      adjustStockUseCase.execute.mockResolvedValue({
        product: { id: 'prod-uuid', currentStock: 40 },
        transaction: { id: 'txn-uuid', createdAt: new Date() } as any,
        alert: { id: 'alert-uuid', status: 'RESOLVED' } as any,
      });

      const updatedOrder = mockOrder({ status: 'RECEIVED' });
      purchaseOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

      const result = await useCase.execute('order-uuid');

      expect(result.stockAdjustment.alert).toEqual({
        id: 'alert-uuid',
        status: 'RESOLVED',
      });
    });
  });

  describe('when order is not in APPROVED status', () => {
    it('should throw InvalidOrderStatusTransitionError from PENDING', async () => {
      const order = mockOrder({ status: 'PENDING' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-uuid')).rejects.toThrow(
        InvalidOrderStatusTransitionError,
      );
    });

    it('should throw InvalidOrderStatusTransitionError from REJECTED', async () => {
      const order = mockOrder({ status: 'REJECTED' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-uuid')).rejects.toThrow(
        InvalidOrderStatusTransitionError,
      );
    });

    it('should throw InvalidOrderStatusTransitionError from RECEIVED', async () => {
      const order = mockOrder({ status: 'RECEIVED' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-uuid')).rejects.toThrow(
        InvalidOrderStatusTransitionError,
      );
    });
  });
});
