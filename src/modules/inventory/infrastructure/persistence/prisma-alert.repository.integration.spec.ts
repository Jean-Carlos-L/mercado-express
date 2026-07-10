import { PrismaService } from 'src/shared/database/prisma.service';
import { PrismaAlertRepository } from './prisma-alert.repository';
import {
  cleanDatabase,
  seedCategory,
  seedSupplier,
  seedProduct,
  seedAlert,
} from 'test/helpers/test-database.helper';

describe('Integration: PrismaAlertRepository', () => {
  let prisma: PrismaService;
  let repository: PrismaAlertRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaAlertRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('findActiveByProductId', () => {
    it('should return active alert for product', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      await seedAlert({ productId: product.id, status: 'ACTIVE' });

      const alert = await repository.findActiveByProductId(product.id);

      expect(alert).not.toBeNull();
      expect(alert!.productId).toBe(product.id);
      expect(alert!.status).toBe('ACTIVE');
      expect(alert!.type).toBe('LOW_STOCK');
    });

    it('should return null if no active alert exists', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      const alert = await repository.findActiveByProductId(product.id);

      expect(alert).toBeNull();
    });

    it('should return null if only resolved alert exists', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      await seedAlert({ productId: product.id, status: 'RESOLVED' });

      const alert = await repository.findActiveByProductId(product.id);

      expect(alert).toBeNull();
    });
  });

  describe('findByFilters', () => {
    it('should return paginated alerts', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      for (let i = 0; i < 3; i++) {
        await seedAlert({ productId: product.id, status: 'ACTIVE' });
      }

      const result = await repository.findByFilters({
        page: 1,
        pageSize: 2,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it('should filter by status', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      await seedAlert({ productId: product.id, status: 'ACTIVE' });
      await seedAlert({ productId: product.id, status: 'RESOLVED' });

      const result = await repository.findByFilters({
        status: 'RESOLVED',
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('RESOLVED');
    });

    it('should filter by productId', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product1 = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const product2 = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      await seedAlert({ productId: product1.id, status: 'ACTIVE' });
      await seedAlert({ productId: product2.id, status: 'ACTIVE' });

      const result = await repository.findByFilters({
        productId: product1.id,
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].productId).toBe(product1.id);
    });
  });
});
