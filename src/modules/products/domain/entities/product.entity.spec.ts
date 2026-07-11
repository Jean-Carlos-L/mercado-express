import { Product } from './product.entity';
import { InsufficientStockError } from '../errors/insufficient-stock.error';

describe('Product Entity', () => {
  const defaultProps = {
    name: 'Test Product',
    sku: 'SKU-001',
    categoryId: 'cat-uuid',
    supplierId: 'sup-uuid',
    price: 25.5,
    currentStock: 20,
    minStock: 5,
  };

  describe('create', () => {
    it('should create a product with a generated id', () => {
      const product = Product.create(defaultProps);

      expect(product.id).toBeDefined();
      expect(product.name).toBe(defaultProps.name);
      expect(product.sku).toBe(defaultProps.sku);
      expect(product.categoryId).toBe(defaultProps.categoryId);
      expect(product.supplierId).toBe(defaultProps.supplierId);
      expect(product.price).toBe(defaultProps.price);
      expect(product.currentStock).toBe(defaultProps.currentStock);
      expect(product.minStock).toBe(defaultProps.minStock);
    });
  });

  describe('restore', () => {
    it('should restore a product with the given id', () => {
      const id = 'fixed-uuid';
      const product = Product.restore({ ...defaultProps, id });

      expect(product.id).toBe(id);
      expect(product.name).toBe(defaultProps.name);
    });
  });

  describe('increaseStock', () => {
    it('should increase the current stock by the given quantity', () => {
      const product = Product.create(defaultProps);

      product.increaseStock(10);

      expect(product.currentStock).toBe(30);
    });

    it('should handle increasing by zero', () => {
      const product = Product.create(defaultProps);

      product.increaseStock(0);

      expect(product.currentStock).toBe(defaultProps.currentStock);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease the current stock by the given quantity', () => {
      const product = Product.create(defaultProps);

      product.decreaseStock(5);

      expect(product.currentStock).toBe(15);
    });

    it('should decrease stock to exactly zero', () => {
      const product = Product.create(defaultProps);

      product.decreaseStock(20);

      expect(product.currentStock).toBe(0);
    });

    it('should throw InsufficientStockError when stock would go negative', () => {
      const product = Product.create(defaultProps);

      expect(() => product.decreaseStock(25)).toThrow(InsufficientStockError);
    });

    it('should throw InsufficientStockError when stock is zero', () => {
      const product = Product.create({ ...defaultProps, currentStock: 0 });

      expect(() => product.decreaseStock(1)).toThrow(InsufficientStockError);
    });
  });

  describe('hasLowStock', () => {
    it('should return true when current stock is equal to min stock', () => {
      const product = Product.create({
        ...defaultProps,
        currentStock: 5,
        minStock: 5,
      });

      expect(product.hasLowStock()).toBe(true);
    });

    it('should return true when current stock is below min stock', () => {
      const product = Product.create({
        ...defaultProps,
        currentStock: 3,
        minStock: 5,
      });

      expect(product.hasLowStock()).toBe(true);
    });

    it('should return false when current stock is above min stock', () => {
      const product = Product.create({
        ...defaultProps,
        currentStock: 10,
        minStock: 5,
      });

      expect(product.hasLowStock()).toBe(false);
    });
  });
});
