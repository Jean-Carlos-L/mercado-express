import { RejectPurchaseOrderUseCase } from './reject-purchase-order.use-case';
import { PurchaseOrderRepository } from '../../domain/repositories/purchase-order.repository';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { PurchaseOrderNotFoundError } from '../../domain/errors/purchase-order-not-found.error';
import { InvalidOrderStatusTransitionError } from '../../domain/errors/invalid-order-status-transition.error';
import { RejectPurchaseOrderDto } from '../dto/reject-purchase-order.dto';

describe('RejectPurchaseOrderUseCase', () => {
  let useCase: RejectPurchaseOrderUseCase;
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
    } as PurchaseOrder;
  };

  beforeEach(() => {
    purchaseOrderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findByFilters: jest.fn(),
    };

    useCase = new RejectPurchaseOrderUseCase(purchaseOrderRepository);
  });

  describe('when order is not found', () => {
    it('should throw PurchaseOrderNotFoundError', async () => {
      purchaseOrderRepository.findById.mockResolvedValue(null);

      const dto: RejectPurchaseOrderDto = {
        rejectionReason: 'Not needed',
      };

      await expect(useCase.execute('non-existent', dto)).rejects.toThrow(
        PurchaseOrderNotFoundError,
      );
    });
  });

  describe('when order is in PENDING status', () => {
    it('should reject the order with a reason', async () => {
      const order = mockOrder({ status: 'PENDING' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      const rejectedOrder = mockOrder({
        status: 'REJECTED',
        rejectionReason: 'Not needed',
      });
      purchaseOrderRepository.updateStatus.mockResolvedValue(rejectedOrder);

      const dto: RejectPurchaseOrderDto = {
        rejectionReason: 'Not needed',
      };

      const result = await useCase.execute('order-uuid', dto);

      expect(purchaseOrderRepository.updateStatus).toHaveBeenCalledWith(
        'order-uuid',
        'REJECTED',
        'Not needed',
      );
      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReason).toBe('Not needed');
    });
  });

  describe('when order is not in PENDING status', () => {
    it('should throw InvalidOrderStatusTransitionError from APPROVED', async () => {
      const order = mockOrder({ status: 'APPROVED' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      const dto: RejectPurchaseOrderDto = {
        rejectionReason: 'Changed mind',
      };

      await expect(useCase.execute('order-uuid', dto)).rejects.toThrow(
        InvalidOrderStatusTransitionError,
      );
    });

    it('should throw InvalidOrderStatusTransitionError from REJECTED', async () => {
      const order = mockOrder({ status: 'REJECTED' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      const dto: RejectPurchaseOrderDto = {
        rejectionReason: 'Already rejected',
      };

      await expect(useCase.execute('order-uuid', dto)).rejects.toThrow(
        InvalidOrderStatusTransitionError,
      );
    });

    it('should throw InvalidOrderStatusTransitionError from RECEIVED', async () => {
      const order = mockOrder({ status: 'RECEIVED' });
      purchaseOrderRepository.findById.mockResolvedValue(order);

      const dto: RejectPurchaseOrderDto = {
        rejectionReason: 'Too late',
      };

      await expect(useCase.execute('order-uuid', dto)).rejects.toThrow(
        InvalidOrderStatusTransitionError,
      );
    });
  });
});
