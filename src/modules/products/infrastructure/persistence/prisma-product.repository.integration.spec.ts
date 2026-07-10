import { PrismaService } from 'src/shared/database/prisma.service';
import { PrismaProductRepository } from './prisma-product.repository';
import { Product } from 'src/modules/products/domain/entities/product.entity';
import {
  cleanDatabase,
  seedCategory,
  seedSupplier,
  seedProduct,
} from 'test/helpers/test-database.helper';

describe('Integration: PrismaProductRepository', () => {
  let prisma: PrismaService;
  let repository: PrismaProductRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaProductRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('save', () => {
    it('should persist a new product', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();

      const product = Product.create({
        name: 'Test Product',
        sku: 'SKU-TEST-001',
        categoryId: category.id,
        supplierId: supplier.id,
        price: 25.5,
        currentStock: 100,
        minStock: 10,
      });

      const saved = await repository.save(product);

      expect(saved.id).toBeDefined();
      expect(saved.name).toBe('Test Product');
      expect(saved.sku).toBe('SKU-TEST-001');
      expect(saved.price).toBe(25.5);
    });

    it('should throw on duplicate SKU', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();

      const product1 = Product.create({
        name: 'Product 1',
        sku: 'DUPLICATE-SKU',
        categoryId: category.id,
        supplierId: supplier.id,
        price: 10,
        currentStock: 5,
        minStock: 1,
      });
      await repository.save(product1);

      const product2 = Product.create({
        name: 'Product 2',
        sku: 'DUPLICATE-SKU',
        categoryId: category.id,
        supplierId: supplier.id,
        price: 20,
        currentStock: 10,
        minStock: 2,
      });

      await expect(repository.save(product2)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return product by id', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const seeded = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      const found = await repository.findById(seeded.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(seeded.id);
      expect(found!.name).toBe(seeded.name);
    });

    it('should return null for non-existent id', async () => {
      const found = await repository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(found).toBeNull();
    });
  });

  describe('findBySku', () => {
    it('should return product by sku', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const seeded = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        sku: 'FIND-BY-SKU',
      });

      const found = await repository.findBySku('FIND-BY-SKU');

      expect(found).not.toBeNull();
      expect(found!.sku).toBe('FIND-BY-SKU');
    });

    it('should return null for non-existent sku', async () => {
      const found = await repository.findBySku('NON-EXISTENT');

      expect(found).toBeNull();
    });
  });

  describe('findByFilters', () => {
    it('should filter by categoryId', async () => {
      const category1 = await seedCategory({ name: 'Cat 1' });
      const category2 = await seedCategory({ name: 'Cat 2' });
      const supplier = await seedSupplier();

      await seedProduct({
        categoryId: category1.id,
        supplierId: supplier.id,
      });
      await seedProduct({
        categoryId: category2.id,
        supplierId: supplier.id,
      });

      const result = await repository.findByFilters({
        categoryId: category1.id,
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].categoryId).toBe(category1.id);
    });

    it('should filter by stock range', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();

      await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 5,
      });
      await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 50,
      });
      await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 100,
      });

      const result = await repository.findByFilters({
        minStock: 10,
        maxStock: 60,
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].currentStock).toBe(50);
    });
  });
});
