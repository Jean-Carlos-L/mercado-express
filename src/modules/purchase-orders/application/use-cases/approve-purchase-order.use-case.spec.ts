import { ApprovePurchaseOrderUseCase } from './approve-purchase-order.use-case';
import { PurchaseOrderRepository } from '../../domain/repositories/purchase-order.repository';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { PurchaseOrderNotFoundError } from '../../domain/errors/purchase-order-not-found.error';
import { InvalidOrderStatusTransitionError } from '../../domain/errors/invalid-order-status-transition.error';

describe('ApprovePurchaseOrderUseCase', () => {
  let useCase: ApprovePurchaseOrderUseCase;
  let purchaseOrderRepository: jest.Mocked<PurchaseOrderRepository>;

  const mockOrder = (overrides?: Partial<PurchaseOrder>): PurchaseOrder => {
    return {
      id: 'order-uuid',
      productId: 'prod-uuid',
      quantity: 20,
      supplierId: 'sup-uuid',
      status: 'PENDING',
      source: 'MANUAL',
      alertId: null,
      createdAt: new Date(),
      rejectionReason: null,
      ...overrides,
    };
  };

  beforeEach(() => {
    purchaseOrderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findByFilters: jest.fn(),
    };

    useCase = new ApprovePurchaseOrderUseCase(purchaseOrderRepository);
  });

  describe('when order is not found', () => {
    it('should throw PurchaseOrderNotFoundError', async () => {
      purchaseOrderRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent')).rejects.toThrow(
        PurchaseOrderNotFoundError,
      );
    });
  });

  describe('when order is in PENDING status', () => {
    it('should approve the order', async () => {
      const order = mockOrder({ status: 'PENDING' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      const approvedOrder = mockOrder({ status: 'APPROVED' });
      purchaseOrderRepository.updateStatus.mockResolvedValue(approvedOrder);

      const result = await useCase.execute('order-uuid');

      expect(purchaseOrderRepository.updateStatus).toHaveBeenCalledWith(
        'order-uuid',
        'APPROVED',
      );
      expect(result.status).toBe('APPROVED');
    });
  });

  describe('when order is not in PENDING status', () => {
    it('should throw InvalidOrderStatusTransitionError from APPROVED', async () => {
      const order = mockOrder({ status: 'APPROVED' });
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
