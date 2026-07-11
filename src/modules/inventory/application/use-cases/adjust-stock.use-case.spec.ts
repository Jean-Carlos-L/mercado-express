import { AdjustStockUseCase } from './adjust-stock.use-case';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';
import { Product } from 'src/modules/products/domain/entities/product.entity';
import { ProductNotFoundError } from 'src/modules/products/domain/errors/product-not-found.error';
import { InsufficientStockForAdjustmentError } from '../../domain/errors/insufficient-stock-for-adjustment.error';
import { AdjustStockDto } from '../dto/adjust-stock.dto';

describe('AdjustStockUseCase', () => {
  let useCase: AdjustStockUseCase;
  let inventoryRepository: jest.Mocked<InventoryRepository>;
  let productRepository: jest.Mocked<ProductRepository>;

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

  beforeEach(() => {
    inventoryRepository = {
      adjustStock: jest.fn(),
    };

    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findByFilters: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    useCase = new AdjustStockUseCase(inventoryRepository, productRepository);
  });

  describe('when product is not found', () => {
    it('should throw ProductNotFoundError', async () => {
      productRepository.findById.mockResolvedValue(null);

      const dto: AdjustStockDto = {
        productId: 'non-existent',
        type: 'INCOMING',
        quantity: 10,
        reason: 'Restock',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(ProductNotFoundError);
    });
  });

  describe('when product exists', () => {
    it('should call inventoryRepository.adjustStock with positive quantity for INCOMING', async () => {
      const product = mockProduct();
      productRepository.findById.mockResolvedValue(product);

      const result = {
        product: { id: 'prod-uuid', currentStock: 30 },
        transaction: {
          id: 'txn-uuid',
          productId: 'prod-uuid',
          quantity: 10,
          reason: 'Restock',
          transactionType: 'INCOMING',
          createdAt: new Date(),
        },
        alert: null,
      };
      inventoryRepository.adjustStock.mockResolvedValue(result);

      const dto: AdjustStockDto = {
        productId: 'prod-uuid',
        type: 'INCOMING',
        quantity: 10,
        reason: 'Restock',
      };

      const response = await useCase.execute(dto);

      expect(inventoryRepository.adjustStock).toHaveBeenCalledWith({
        productId: 'prod-uuid',
        quantity: 10,
        type: 'INCOMING',
        reason: 'Restock',
      });
      expect(response).toEqual(result);
    });

    it('should call inventoryRepository.adjustStock with negative quantity for OUTGOING', async () => {
      const product = mockProduct();
      productRepository.findById.mockResolvedValue(product);

      const result = {
        product: { id: 'prod-uuid', currentStock: 15 },
        transaction: {
          id: 'txn-uuid',
          productId: 'prod-uuid',
          quantity: -5,
          reason: 'Sale',
          transactionType: 'OUTGOING',
          createdAt: new Date(),
        },
        alert: null,
      };
      inventoryRepository.adjustStock.mockResolvedValue(result);

      const dto: AdjustStockDto = {
        productId: 'prod-uuid',
        type: 'OUTGOING',
        quantity: 5,
        reason: 'Sale',
      };

      const response = await useCase.execute(dto);

      expect(inventoryRepository.adjustStock).toHaveBeenCalledWith({
        productId: 'prod-uuid',
        quantity: -5,
        type: 'OUTGOING',
        reason: 'Sale',
      });
      expect(response).toEqual(result);
    });

    it('should throw InsufficientStockForAdjustmentError when repository returns null', async () => {
      const product = mockProduct({ currentStock: 3 });
      productRepository.findById.mockResolvedValue(product);
      inventoryRepository.adjustStock.mockResolvedValue(null);

      const dto: AdjustStockDto = {
        productId: 'prod-uuid',
        type: 'OUTGOING',
        quantity: 5,
        reason: 'Sale',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InsufficientStockForAdjustmentError,
      );
    });
  });
});
