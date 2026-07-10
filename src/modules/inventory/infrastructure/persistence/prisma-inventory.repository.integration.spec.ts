import { PrismaService } from 'src/shared/database/prisma.service';
import { PrismaInventoryRepository } from './prisma-inventory.repository';
import {
  cleanDatabase,
  seedCategory,
  seedSupplier,
  seedProduct,
  seedAlert,
} from 'test/helpers/test-database.helper';

describe('Integration: PrismaInventoryRepository', () => {
  let prisma: PrismaService;
  let repository: PrismaInventoryRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaInventoryRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('adjustStock', () => {
    describe('INCOMING adjustments', () => {
      it('should increase stock and create inventory transaction', async () => {
        const category = await seedCategory();
        const supplier = await seedSupplier();
        const product = await seedProduct({
          categoryId: category.id,
          supplierId: supplier.id,
          currentStock: 10,
          minStock: 5,
        });

        const result = await repository.adjustStock({
          productId: product.id,
          quantity: 5,
          type: 'INCOMING',
          reason: 'Restock from supplier',
        });

        expect(result).not.toBeNull();
        expect(result!.product.currentStock).toBe(15);
        expect(result!.transaction.quantity).toBe(5);
        expect(result!.transaction.transactionType).toBe('INCOMING');
        expect(result!.transaction.reason).toBe('Restock from supplier');
      });

      it('should not create alert when stock is above minStock after INCOMING', async () => {
        const category = await seedCategory();
        const supplier = await seedSupplier();
        const product = await seedProduct({
          categoryId: category.id,
          supplierId: supplier.id,
          currentStock: 3,
          minStock: 5,
        });

        const result = await repository.adjustStock({
          productId: product.id,
          quantity: 10,
          type: 'INCOMING',
          reason: 'Restock',
        });

        expect(result).not.toBeNull();
        expect(result!.product.currentStock).toBe(13);
        expect(result!.alert).toBeNull();
      });

      it('should resolve existing alert when stock goes above minStock', async () => {
        const category = await seedCategory();
        const supplier = await seedSupplier();
        const product = await seedProduct({
          categoryId: category.id,
          supplierId: supplier.id,
          currentStock: 3,
          minStock: 5,
        });
        const alert = await seedAlert({
          productId: product.id,
          status: 'ACTIVE',
        });

        const result = await repository.adjustStock({
          productId: product.id,
          quantity: 10,
          type: 'INCOMING',
          reason: 'Restock',
        });

        expect(result).not.toBeNull();
        expect(result!.product.currentStock).toBe(13);
        expect(result!.alert).not.toBeNull();
        expect(result!.alert!.status).toBe('RESOLVED');
        expect(result!.alert!.id).toBe(alert.id);
      });
    });

    describe('OUTGOING adjustments', () => {
      it('should decrease stock and create inventory transaction', async () => {
        const category = await seedCategory();
        const supplier = await seedSupplier();
        const product = await seedProduct({
          categoryId: category.id,
          supplierId: supplier.id,
          currentStock: 20,
          minStock: 5,
        });

        const result = await repository.adjustStock({
          productId: product.id,
          quantity: -5,
          type: 'OUTGOING',
          reason: 'Sale',
        });

        expect(result).not.toBeNull();
        expect(result!.product.currentStock).toBe(15);
        expect(result!.transaction.quantity).toBe(-5);
        expect(result!.transaction.transactionType).toBe('OUTGOING');
      });

      it('should return null when OUTGOING would result in negative stock', async () => {
        const category = await seedCategory();
        const supplier = await seedSupplier();
        const product = await seedProduct({
          categoryId: category.id,
          supplierId: supplier.id,
          currentStock: 3,
          minStock: 5,
        });

        const result = await repository.adjustStock({
          productId: product.id,
          quantity: -5,
          type: 'OUTGOING',
          reason: 'Sale',
        });

        expect(result).toBeNull();
      });

      it('should allow OUTGOING that reduces stock to exactly zero', async () => {
        const category = await seedCategory();
        const supplier = await seedSupplier();
        const product = await seedProduct({
          categoryId: category.id,
          supplierId: supplier.id,
          currentStock: 5,
          minStock: 5,
        });

        const result = await repository.adjustStock({
          productId: product.id,
          quantity: -5,
          type: 'OUTGOING',
          reason: 'Final sale',
        });

        expect(result).not.toBeNull();
        expect(result!.product.currentStock).toBe(0);
      });
    });

    describe('alert creation', () => {
      it('should create LOW_STOCK alert when stock drops to or below minStock', async () => {
        const category = await seedCategory();
        const supplier = await seedSupplier();
        const product = await seedProduct({
          categoryId: category.id,
          supplierId: supplier.id,
          currentStock: 7,
          minStock: 5,
        });

        const result = await repository.adjustStock({
          productId: product.id,
          quantity: -3,
          type: 'OUTGOING',
          reason: 'Sale',
        });

        expect(result).not.toBeNull();
        expect(result!.product.currentStock).toBe(4);
        expect(result!.alert).not.toBeNull();
        expect(result!.alert!.type).toBe('LOW_STOCK');
        expect(result!.alert!.status).toBe('ACTIVE');
      });

      it('should not create duplicate alert if one already exists', async () => {
        const category = await seedCategory();
        const supplier = await seedSupplier();
        const product = await seedProduct({
          categoryId: category.id,
          supplierId: supplier.id,
          currentStock: 4,
          minStock: 5,
        });
        await seedAlert({ productId: product.id, status: 'ACTIVE' });

        const result = await repository.adjustStock({
          productId: product.id,
          quantity: -1,
          type: 'OUTGOING',
          reason: 'Another sale',
        });

        expect(result).not.toBeNull();
        expect(result!.alert).toBeNull();

        const alertCount = await prisma.alert.count({
          where: { product_id: product.id, status: 'ACTIVE' },
        });
        expect(alertCount).toBe(1);
      });
    });
  });
});
