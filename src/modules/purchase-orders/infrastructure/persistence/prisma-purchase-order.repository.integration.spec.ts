import { PrismaService } from 'src/shared/database/prisma.service';
import { PrismaPurchaseOrderRepository } from './prisma-purchase-order.repository';
import { PurchaseOrder } from 'src/modules/purchase-orders/domain/entities/purchase-order.entity';
import {
  cleanDatabase,
  seedCategory,
  seedSupplier,
  seedProduct,
  seedPurchaseOrder,
} from 'test/helpers/test-database.helper';

describe('Integration: PrismaPurchaseOrderRepository', () => {
  let prisma: PrismaService;
  let repository: PrismaPurchaseOrderRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaPurchaseOrderRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('save', () => {
    it('should persist a new purchase order', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      const order = PurchaseOrder.create({
        productId: product.id,
        quantity: 20,
        supplierId: supplier.id,
        source: 'MANUAL',
      });

      const saved = await repository.save(order);

      expect(saved.id).toBeDefined();
      expect(saved.productId).toBe(product.id);
      expect(saved.quantity).toBe(20);
      expect(saved.status).toBe('PENDING');
      expect(saved.source).toBe('MANUAL');
    });
  });

  describe('findById', () => {
    it('should return a purchase order by id', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const seeded = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
      });

      const found = await repository.findById(seeded.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(seeded.id);
      expect(found!.productId).toBe(product.id);
    });

    it('should return null for non-existent id', async () => {
      const found = await repository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(found).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update status to APPROVED', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const seeded = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'PENDING',
      });

      const updated = await repository.updateStatus(seeded.id, 'APPROVED');

      expect(updated.status).toBe('APPROVED');
    });

    it('should update status to REJECTED with rejection reason', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const seeded = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'PENDING',
      });

      const updated = await repository.updateStatus(
        seeded.id,
        'REJECTED',
        'Too expensive',
      );

      expect(updated.status).toBe('REJECTED');
      expect(updated.rejectionReason).toBe('Too expensive');
    });
  });

  describe('findByFilters', () => {
    it('should return paginated results', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      for (let i = 0; i < 5; i++) {
        await seedPurchaseOrder({
          productId: product.id,
          supplierId: supplier.id,
          status: 'PENDING',
        });
      }

      const result = await repository.findByFilters({
        page: 1,
        pageSize: 3,
      });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(5);
    });

    it('should filter by status', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'PENDING',
      });
      await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'APPROVED',
      });

      const result = await repository.findByFilters({
        status: 'APPROVED',
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('APPROVED');
    });
  });
});
