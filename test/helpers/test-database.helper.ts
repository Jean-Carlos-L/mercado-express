import { PrismaService } from '../../src/shared/database/prisma.service';

const prisma = new PrismaService();

export async function cleanDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe('DELETE FROM purchase_orders');
  await prisma.$executeRawUnsafe('DELETE FROM alerts');
  await prisma.$executeRawUnsafe('DELETE FROM inventory_transactions');
  await prisma.$executeRawUnsafe('DELETE FROM products');
  await prisma.$executeRawUnsafe('DELETE FROM categories');
  await prisma.$executeRawUnsafe('DELETE FROM suppliers');
}

export async function seedCategory(
  data: { id?: string; name?: string } = {},
): Promise<{ id: string; name: string }> {
  const id = data.id ?? crypto.randomUUID();
  const name = data.name ?? `Category ${crypto.randomUUID().slice(0, 8)}`;

  await prisma.$executeRawUnsafe(
    'INSERT INTO categories (id, name, is_deleted) VALUES ($1, $2, false)',
    id,
    name,
  );

  return { id, name };
}

export async function seedSupplier(
  data: { id?: string; name?: string } = {},
): Promise<{ id: string; name: string }> {
  const id = data.id ?? crypto.randomUUID();
  const name = data.name ?? `Supplier ${crypto.randomUUID().slice(0, 8)}`;

  await prisma.$executeRawUnsafe(
    'INSERT INTO suppliers (id, name, is_deleted) VALUES ($1, $2, false)',
    id,
    name,
  );

  return { id, name };
}

export async function seedProduct(data: {
  id?: string;
  name?: string;
  sku?: string;
  categoryId: string;
  supplierId: string;
  price?: number;
  currentStock?: number;
  minStock?: number;
}): Promise<{
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  supplierId: string;
  price: number;
  currentStock: number;
  minStock: number;
}> {
  const id = data.id ?? crypto.randomUUID();
  const name = data.name ?? `Product ${crypto.randomUUID().slice(0, 8)}`;
  const sku = data.sku ?? `SKU-${crypto.randomUUID().slice(0, 12)}`;
  const price = data.price ?? 10.0;
  const currentStock = data.currentStock ?? 20;
  const minStock = data.minStock ?? 5;

  await prisma.$executeRawUnsafe(
    `INSERT INTO products (id, name, sku, category_id, supplier_id, price, current_stock, min_stock)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    id,
    name,
    sku,
    data.categoryId,
    data.supplierId,
    price,
    currentStock,
    minStock,
  );

  return {
    id,
    name,
    sku,
    categoryId: data.categoryId,
    supplierId: data.supplierId,
    price,
    currentStock,
    minStock,
  };
}

export async function seedAlert(data: {
  id?: string;
  productId: string;
  type?: 'LOW_STOCK';
  status?: 'ACTIVE' | 'RESOLVED';
}): Promise<{ id: string; productId: string; type: string; status: string }> {
  const id = data.id ?? crypto.randomUUID();
  const type = data.type ?? 'LOW_STOCK';
  const status = data.status ?? 'ACTIVE';

  await prisma.$executeRawUnsafe(
    'INSERT INTO alerts (id, product_id, type, status) VALUES ($1, $2, $3, $4)',
    id,
    data.productId,
    type,
    status,
  );

  return { id, productId: data.productId, type, status };
}

export async function seedPurchaseOrder(data: {
  id?: string;
  productId: string;
  quantity?: number;
  supplierId: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED';
  source?: 'MANUAL' | 'LOW_STOCK_ALERT';
  alertId?: string | null;
  rejectionReason?: string | null;
}): Promise<{
  id: string;
  productId: string;
  quantity: number;
  supplierId: string;
  status: string;
  source: string;
  alertId: string | null;
  rejectionReason: string | null;
}> {
  const id = data.id ?? crypto.randomUUID();
  const quantity = data.quantity ?? 20;
  const status = data.status ?? 'PENDING';
  const source = data.source ?? 'MANUAL';
  const alertId = data.alertId ?? null;
  const rejectionReason = data.rejectionReason ?? null;

  await prisma.$executeRawUnsafe(
    `INSERT INTO purchase_orders (id, product_id, quantity, supplier_id, status, source, alert_id, rejection_reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    id,
    data.productId,
    quantity,
    data.supplierId,
    status,
    source,
    alertId,
    rejectionReason,
  );

  return {
    id,
    productId: data.productId,
    quantity,
    supplierId: data.supplierId,
    status,
    source,
    alertId,
    rejectionReason,
  };
}
