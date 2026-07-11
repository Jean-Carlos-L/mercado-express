import { CreatePurchaseOrderUseCase } from './create-purchase-order.use-case';
import { PurchaseOrderRepository } from '../../domain/repositories/purchase-order.repository';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';
import { AlertRepository } from 'src/modules/inventory/domain/repositories/alert.repository';
import { Product } from 'src/modules/products/domain/entities/product.entity';
import { ProductNotFoundError } from 'src/modules/products/domain/errors/product-not-found.error';
import { AlertIdNotAllowedForManualError } from '../../domain/errors/alert-id-not-allowed-for-manual.error';
import { AlertNotActiveError } from '../../domain/errors/alert-not-active.error';
import { InvalidQuantityForOrderError } from '../../domain/errors/invalid-quantity-for-order.error';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';

describe('CreatePurchaseOrderUseCase', () => {
  let useCase: CreatePurchaseOrderUseCase;
  let purchaseOrderRepository: jest.Mocked<PurchaseOrderRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let alertRepository: jest.Mocked<AlertRepository>;

  const mockProduct = (overrides?: Partial<Product>): Product => {
    return {
      id: 'prod-uuid',
      name: 'Test Product',
      sku: 'SKU-001',
      categoryId: 'cat-uuid',
      supplierId: 'sup-uuid',
      price: 10,
      currentStock: 20,
      minStock: 5,
      increaseStock: jest.fn(),
      decreaseStock: jest.fn(),
      hasLowStock: jest.fn(),
      ...overrides,
    };
  };

  const mockAlert = (overrides?: { id?: string; productId?: string }) => ({
    id: overrides?.id ?? 'alert-uuid',
    productId: overrides?.productId ?? 'prod-uuid',
    type: 'LOW_STOCK' as const,
    status: 'ACTIVE' as const,
  });

  beforeEach(() => {
    purchaseOrderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findByFilters: jest.fn(),
    };

    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findByFilters: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    alertRepository = {
      findActiveByProductId: jest.fn(),
      findByFilters: jest.fn(),
    };

    useCase = new CreatePurchaseOrderUseCase(
      purchaseOrderRepository,
      productRepository,
      alertRepository,
    );
  });

  describe('when product is not found', () => {
    it('should throw ProductNotFoundError', async () => {
      productRepository.findById.mockResolvedValue(null);

      const dto: CreatePurchaseOrderDto = {
        productId: 'non-existent',
        supplierId: 'sup-uuid',
        quantity: 20,
        source: 'MANUAL',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(ProductNotFoundError);
    });
  });

  describe('when source is MANUAL', () => {
    it('should throw AlertIdNotAllowedForManualError if alertId is provided', async () => {
      productRepository.findById.mockResolvedValue(mockProduct());

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 20,
        source: 'MANUAL',
        alertId: 'some-alert',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        AlertIdNotAllowedForManualError,
      );
    });

    it('should create order without alertId', async () => {
      const product = mockProduct();
      productRepository.findById.mockResolvedValue(product);

      const savedOrder = {
        id: 'order-uuid',
        productId: 'prod-uuid',
        quantity: 20,
        supplierId: 'sup-uuid',
        status: 'PENDING',
        source: 'MANUAL',
        alertId: null,
        createdAt: new Date(),
        rejectionReason: null,
      };
      purchaseOrderRepository.save.mockResolvedValue(savedOrder as any);

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 20,
        source: 'MANUAL',
      };

      const result = await useCase.execute(dto);

      expect(purchaseOrderRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedOrder);
    });
  });

  describe('when source is LOW_STOCK_ALERT', () => {
    it('should throw AlertNotActiveError if alertId is not provided', async () => {
      productRepository.findById.mockResolvedValue(mockProduct());

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 20,
        source: 'LOW_STOCK_ALERT',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(AlertNotActiveError);
    });

    it('should throw AlertNotActiveError if no active alert exists', async () => {
      productRepository.findById.mockResolvedValue(mockProduct());
      alertRepository.findActiveByProductId.mockResolvedValue(null);

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 20,
        source: 'LOW_STOCK_ALERT',
        alertId: 'alert-uuid',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(AlertNotActiveError);
    });

    it('should throw AlertNotActiveError if alertId does not match active alert', async () => {
      productRepository.findById.mockResolvedValue(mockProduct());
      alertRepository.findActiveByProductId.mockResolvedValue(
        mockAlert({ id: 'different-alert' }),
      );

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 20,
        source: 'LOW_STOCK_ALERT',
        alertId: 'alert-uuid',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(AlertNotActiveError);
    });

    it('should create order when alertId matches active alert', async () => {
      const alert = mockAlert();
      productRepository.findById.mockResolvedValue(mockProduct());
      alertRepository.findActiveByProductId.mockResolvedValue(alert);

      const savedOrder = {
        id: 'order-uuid',
        productId: 'prod-uuid',
        quantity: 20,
        supplierId: 'sup-uuid',
        status: 'PENDING',
        source: 'LOW_STOCK_ALERT',
        alertId: alert.id,
        createdAt: new Date(),
        rejectionReason: null,
      };
      purchaseOrderRepository.save.mockResolvedValue(savedOrder as any);

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 20,
        source: 'LOW_STOCK_ALERT',
        alertId: alert.id,
      };

      const result = await useCase.execute(dto);

      expect(purchaseOrderRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedOrder);
    });
  });

  describe('quantity validation (minStock * 2)', () => {
    it('should throw InvalidQuantityForOrderError when quantity is less than 2x minStock', async () => {
      productRepository.findById.mockResolvedValue(
        mockProduct({ minStock: 10 }),
      );

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 19,
        source: 'MANUAL',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidQuantityForOrderError,
      );
    });

    it('should throw InvalidQuantityForOrderError when quantity equals 2x minStock - 1', async () => {
      productRepository.findById.mockResolvedValue(
        mockProduct({ minStock: 10 }),
      );

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 19,
        source: 'MANUAL',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidQuantityForOrderError,
      );
    });

    it('should allow order when quantity equals exactly 2x minStock', async () => {
      const product = mockProduct({ minStock: 10 });
      productRepository.findById.mockResolvedValue(product);

      const savedOrder = {
        id: 'order-uuid',
        productId: 'prod-uuid',
        quantity: 20,
        supplierId: 'sup-uuid',
        status: 'PENDING',
        source: 'MANUAL',
        alertId: null,
        createdAt: new Date(),
        rejectionReason: null,
      };
      purchaseOrderRepository.save.mockResolvedValue(savedOrder as any);

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 20,
        source: 'MANUAL',
      };

      await expect(useCase.execute(dto)).resolves.toEqual(savedOrder);
    });

    it('should allow order when quantity is greater than 2x minStock', async () => {
      const product = mockProduct({ minStock: 10 });
      productRepository.findById.mockResolvedValue(product);

      const savedOrder = {
        id: 'order-uuid',
        productId: 'prod-uuid',
        quantity: 50,
        supplierId: 'sup-uuid',
        status: 'PENDING',
        source: 'MANUAL',
        alertId: null,
        createdAt: new Date(),
        rejectionReason: null,
      };
      purchaseOrderRepository.save.mockResolvedValue(savedOrder as any);

      const dto: CreatePurchaseOrderDto = {
        productId: 'prod-uuid',
        supplierId: 'sup-uuid',
        quantity: 50,
        source: 'MANUAL',
      };

      await expect(useCase.execute(dto)).resolves.toEqual(savedOrder);
    });
  });
});
