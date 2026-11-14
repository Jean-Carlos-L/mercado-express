# Reporte de Casos de Prueba — Suite de Integración

**Proyecto:** Mercado Express · **Commit:** `0f8745c` · **Fecha:** 2026-11-14
**Comandos ejecutados:**
```bash
npm run test:integration:setup
npm run test:integration -- --verbose
```
**Resultado global:** 4 suites, 29 casos, **3 PASS / 26 FAIL**.

> **Estado histórico:** esta matriz refleja la auditoría inicial, antes de corregir los helpers de seed y la consulta raw. Tras las correcciones documentadas en [`reporte-revalidacion.md`](./reporte-revalidacion.md), la suite está en **29/29 PASS**.

> Todos los fallos de esta suite ocurren en la fase de *seed* (`test/helpers/test-database.helper.ts`) antes de ejercitar el repositorio bajo prueba. La causa raíz es el envío de UUID como `text` en `$executeRawUnsafe` (ver Hallazgo F-01).

---

## 1. Matriz de Casos de Prueba

### 1.1 `prisma-product.repository.integration.spec.ts` (8 casos)

#### TC-I-001 · Persistir un producto nuevo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-001` — `Integration: PrismaProductRepository › save › should persist a new product` |
| **2. Precondiciones** | PostgreSQL real `mercado_express_test`; migraciones aplicadas; `cleanDatabase()` en `beforeEach`; `PrismaProductRepository` con `PrismaService` conectado; categoría y proveedor sembrados. |
| **3. Datos de Entrada** | `Product.create({ name: 'Test Product', sku: 'SKU-TEST-001', categoryId, supplierId, price: 25.5, currentStock: 100, minStock: 10 })` |
| **4. Pasos** | 1. Sembrar categoría y proveedor.<br>2. Crear entidad `Product`.<br>3. `repository.save(product)`.<br>4. Verificar campos. |
| **5. Resultado Esperado** | `saved.id` definido, `name`, `sku` y `price` persistidos correctamente. |
| **6. Resultado Obtenido** | FAIL. `PrismaClientKnownRequestError` (P2010) SQLSTATE `42804` en `seedCategory` (`test/helpers/test-database.helper.ts:20`): `column "id" is of type uuid but expression is of type text`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-002 · Error ante SKU duplicado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-002` — `Integration: PrismaProductRepository › save › should throw on duplicate SKU` |
| **2. Precondiciones** | BD limpia; categoría y proveedor sembrados. |
| **3. Datos de Entrada** | Producto 1 y producto 2 con `sku: 'DUPLICATE-SKU'`; precios 10 y 20; stocks 5 y 10; mínimos 1 y 2. |
| **4. Pasos** | 1. Guardar producto 1.<br>2. Guardar producto 2 con el mismo SKU.<br>3. Verificar rechazo. |
| **5. Resultado Esperado** | `repository.save(product2)` rechaza (violación de unicidad). |
| **6. Resultado Obtenido** | FAIL. Mismo error `42804` en `seedCategory:20`; no se llegó a `save`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-003 · Buscar producto por id existente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-003` — `Integration: PrismaProductRepository › findById › should return product by id` |
| **2. Precondiciones** | BD limpia; categoría, proveedor y producto sembrados. |
| **3. Datos de Entrada** | `seeded.id` |
| **4. Pasos** | 1. Sembrar datos.<br>2. `repository.findById(seeded.id)`.<br>3. Verificar id y nombre. |
| **5. Resultado Esperado** | Producto encontrado con `id` y `name` del seed. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-004 · Buscar producto por id inexistente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-004` — `Integration: PrismaProductRepository › findById › should return null for non-existent id` |
| **2. Precondiciones** | BD limpia; sin seeds. |
| **3. Datos de Entrada** | `'00000000-0000-0000-0000-000000000000'` |
| **4. Pasos** | 1. `repository.findById(uuid cero)`.<br>2. Verificar resultado. |
| **5. Resultado Esperado** | `null`. |
| **6. Resultado Obtenido** | PASS. Retornó `null` (esta prueba no usa helpers de seed y por eso no se vio afectada). |
| **7. Estado Final** | `PASS` |

#### TC-I-005 · Buscar producto por SKU existente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-005` — `Integration: PrismaProductRepository › findBySku › should return product by sku` |
| **2. Precondiciones** | BD limpia; categoría, proveedor y producto con `sku: 'FIND-BY-SKU'`. |
| **3. Datos de Entrada** | `'FIND-BY-SKU'` |
| **4. Pasos** | 1. Sembrar datos.<br>2. `repository.findBySku('FIND-BY-SKU')`.<br>3. Verificar SKU. |
| **5. Resultado Esperado** | Producto con `sku: 'FIND-BY-SKU'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-006 · Buscar producto por SKU inexistente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-006` — `Integration: PrismaProductRepository › findBySku › should return null for non-existent sku` |
| **2. Precondiciones** | BD limpia; sin seeds. |
| **3. Datos de Entrada** | `'NON-EXISTENT'` |
| **4. Pasos** | 1. `repository.findBySku('NON-EXISTENT')`.<br>2. Verificar resultado. |
| **5. Resultado Esperado** | `null`. |
| **6. Resultado Obtenido** | PASS. Retornó `null`. |
| **7. Estado Final** | `PASS` |

#### TC-I-007 · Filtrar por categoría

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-007` — `Integration: PrismaProductRepository › findByFilters › should filter by categoryId` |
| **2. Precondiciones** | BD limpia; dos categorías (`Cat 1`, `Cat 2`), un proveedor y un producto por categoría. |
| **3. Datos de Entrada** | `{ categoryId: category1.id, page: 1, pageSize: 10 }` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Ejecutar `findByFilters`.<br>3. Verificar longitud y categoría. |
| **5. Resultado Esperado** | `data.length === 1` y `data[0].categoryId === category1.id`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-008 · Filtrar por rango de stock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-008` — `Integration: PrismaProductRepository › findByFilters › should filter by stock range` |
| **2. Precondiciones** | BD limpia; productos con stock 5, 50 y 100. |
| **3. Datos de Entrada** | `{ minStock: 10, maxStock: 60, page: 1, pageSize: 10 }` |
| **4. Pasos** | 1. Sembrar productos.<br>2. Ejecutar `findByFilters`.<br>3. Verificar resultado. |
| **5. Resultado Esperado** | Solo el producto con stock 50. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

### 1.2 `prisma-purchase-order.repository.integration.spec.ts` (7 casos)

#### TC-I-009 · Persistir una orden de compra

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-009` — `Integration: PrismaPurchaseOrderRepository › save › should persist a new purchase order` |
| **2. Precondiciones** | BD limpia; categoría, proveedor y producto sembrados. |
| **3. Datos de Entrada** | `PurchaseOrder.create({ productId, quantity: 20, supplierId, source: 'MANUAL' })` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Crear orden.<br>3. `repository.save(order)`.<br>4. Verificar campos. |
| **5. Resultado Esperado** | Orden persistida con `status: 'PENDING'` y `source: 'MANUAL'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-010 · Buscar orden por id existente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-010` — `Integration: PrismaPurchaseOrderRepository › findById › should return a purchase order by id` |
| **2. Precondiciones** | BD limpia; orden sembrada con producto y proveedor. |
| **3. Datos de Entrada** | `seeded.id` |
| **4. Pasos** | 1. Sembrar orden.<br>2. `repository.findById(seeded.id)`.<br>3. Verificar id y producto. |
| **5. Resultado Esperado** | Orden encontrada. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-011 · Buscar orden por id inexistente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-011` — `Integration: PrismaPurchaseOrderRepository › findById › should return null for non-existent id` |
| **2. Precondiciones** | BD limpia; sin seeds. |
| **3. Datos de Entrada** | `'00000000-0000-0000-0000-000000000000'` |
| **4. Pasos** | 1. `repository.findById(uuid cero)`.<br>2. Verificar resultado. |
| **5. Resultado Esperado** | `null`. |
| **6. Resultado Obtenido** | PASS. Retornó `null`. |
| **7. Estado Final** | `PASS` |

#### TC-I-012 · Actualizar estado a APPROVED

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-012` — `Integration: PrismaPurchaseOrderRepository › updateStatus › should update status to APPROVED` |
| **2. Precondiciones** | BD limpia; orden `PENDING` sembrada. |
| **3. Datos de Entrada** | `repository.updateStatus(seeded.id, 'APPROVED')` |
| **4. Pasos** | 1. Sembrar orden.<br>2. Actualizar estado.<br>3. Verificar. |
| **5. Resultado Esperado** | `status === 'APPROVED'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-013 · Actualizar estado a REJECTED con motivo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-013` — `Integration: PrismaPurchaseOrderRepository › updateStatus › should update status to REJECTED with rejection reason` |
| **2. Precondiciones** | BD limpia; orden `PENDING` sembrada. |
| **3. Datos de Entrada** | `updateStatus(seeded.id, 'REJECTED', 'Too expensive')` |
| **4. Pasos** | 1. Sembrar orden.<br>2. Actualizar.<br>3. Verificar estado y motivo. |
| **5. Resultado Esperado** | `status === 'REJECTED'` y `rejectionReason === 'Too expensive'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-014 · Paginación de órdenes

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-014` — `Integration: PrismaPurchaseOrderRepository › findByFilters › should return paginated results` |
| **2. Precondiciones** | BD limpia; 5 órdenes `PENDING`. |
| **3. Datos de Entrada** | `{ page: 1, pageSize: 3 }` |
| **4. Pasos** | 1. Sembrar 5 órdenes.<br>2. Ejecutar `findByFilters`.<br>3. Verificar página y total. |
| **5. Resultado Esperado** | `data.length === 3` y `total === 5`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-015 · Filtrar órdenes por estado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-015` — `Integration: PrismaPurchaseOrderRepository › findByFilters › should filter by status` |
| **2. Precondiciones** | BD limpia; una orden `PENDING` y una `APPROVED`. |
| **3. Datos de Entrada** | `{ status: 'APPROVED', page: 1, pageSize: 10 }` |
| **4. Pasos** | 1. Sembrar órdenes.<br>2. Ejecutar filtro.<br>3. Verificar. |
| **5. Resultado Esperado** | `data.length === 1` y `data[0].status === 'APPROVED'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

### 1.3 `prisma-inventory.repository.integration.spec.ts` (8 casos)

#### TC-I-016 · Ajuste INCOMING incrementa stock y registra transacción

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-016` — `Integration: PrismaInventoryRepository › adjustStock › INCOMING adjustments › should increase stock and create inventory transaction` |
| **2. Precondiciones** | BD limpia; producto con `currentStock: 10`, `minStock: 5`. |
| **3. Datos de Entrada** | `{ productId, quantity: 5, type: 'INCOMING', reason: 'Restock from supplier' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar `adjustStock`.<br>3. Verificar stock, cantidad, tipo y motivo. |
| **5. Resultado Esperado** | Stock 15; transacción `quantity: 5`, `transactionType: 'INCOMING'`, motivo preservado. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`; no se ejecutó la transacción de ajuste. |
| **7. Estado Final** | `FAIL` |

#### TC-I-017 · INCOMING sobre el mínimo no crea alerta

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-017` — `Integration: PrismaInventoryRepository › adjustStock › INCOMING adjustments › should not create alert when stock is above minStock after INCOMING` |
| **2. Precondiciones** | Producto `currentStock: 3`, `minStock: 5`. |
| **3. Datos de Entrada** | `{ quantity: 10, type: 'INCOMING', reason: 'Restock' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar ajuste.<br>3. Verificar stock 13 y alerta. |
| **5. Resultado Esperado** | `alert === null`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-018 · INCOMING resuelve alerta existente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-018` — `Integration: PrismaInventoryRepository › adjustStock › INCOMING adjustments › should resolve existing alert when stock goes above minStock` |
| **2. Precondiciones** | Producto stock 3 / mínimo 5; alerta `ACTIVE` sembrada. |
| **3. Datos de Entrada** | `{ quantity: 10, type: 'INCOMING', reason: 'Restock' }` |
| **4. Pasos** | 1. Sembrar producto y alerta.<br>2. Ejecutar ajuste.<br>3. Verificar alerta devuelta. |
| **5. Resultado Esperado** | Stock 13; alerta no nula, `status: 'RESOLVED'` y mismo `id`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-019 · Ajuste OUTGOING decrementa stock y registra transacción

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-019` — `Integration: PrismaInventoryRepository › adjustStock › OUTGOING adjustments › should decrease stock and create inventory transaction` |
| **2. Precondiciones** | Producto stock 20 / mínimo 5. |
| **3. Datos de Entrada** | `{ quantity: -5, type: 'OUTGOING', reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar ajuste.<br>3. Verificar stock y transacción. |
| **5. Resultado Esperado** | Stock 15; transacción `quantity: -5`, `transactionType: 'OUTGOING'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-020 · OUTGOING con stock insuficiente retorna null

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-020` — `Integration: PrismaInventoryRepository › adjustStock › OUTGOING adjustments › should return null when OUTGOING would result in negative stock` |
| **2. Precondiciones** | Producto stock 3 / mínimo 5. |
| **3. Datos de Entrada** | `{ quantity: -5, type: 'OUTGOING', reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar ajuste.<br>3. Verificar resultado. |
| **5. Resultado Esperado** | `null`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-021 · OUTGOING hasta cero exacto

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-021` — `Integration: PrismaInventoryRepository › adjustStock › OUTGOING adjustments › should allow OUTGOING that reduces stock to exactly zero` |
| **2. Precondiciones** | Producto stock 5 / mínimo 5. |
| **3. Datos de Entrada** | `{ quantity: -5, type: 'OUTGOING', reason: 'Final sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar ajuste.<br>3. Verificar resultado. |
| **5. Resultado Esperado** | Resultado no nulo y stock 0. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-022 · Creación automática de alerta LOW_STOCK

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-022` — `Integration: PrismaInventoryRepository › adjustStock › alert creation › should create LOW_STOCK alert when stock drops to or below minStock` |
| **2. Precondiciones** | Producto stock 7 / mínimo 5; sin alerta activa. |
| **3. Datos de Entrada** | `{ quantity: -3, type: 'OUTGOING', reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar ajuste.<br>3. Verificar stock y alerta. |
| **5. Resultado Esperado** | Stock 4; alerta `LOW_STOCK` con `status: 'ACTIVE'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-023 · No duplicar alerta activa existente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-023` — `Integration: PrismaInventoryRepository › adjustStock › alert creation › should not create duplicate alert if one already exists` |
| **2. Precondiciones** | Producto stock 4 / mínimo 5; alerta `ACTIVE` sembrada. |
| **3. Datos de Entrada** | `{ quantity: -1, type: 'OUTGOING', reason: 'Another sale' }` |
| **4. Pasos** | 1. Sembrar producto y alerta.<br>2. Ejecutar ajuste.<br>3. Verificar `alert` nulo y conteo en BD. |
| **5. Resultado Esperado** | `alert === null`; exactamente 1 alerta activa para el producto. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

### 1.4 `prisma-alert.repository.integration.spec.ts` (6 casos)

#### TC-I-024 · Obtener alerta activa por producto

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-024` — `Integration: PrismaAlertRepository › findActiveByProductId › should return active alert for product` |
| **2. Precondiciones** | BD limpia; producto con alerta `ACTIVE` sembrada. |
| **3. Datos de Entrada** | `repository.findActiveByProductId(product.id)` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Consultar alerta activa.<br>3. Verificar campos. |
| **5. Resultado Esperado** | Alerta no nula, `productId`, `status: 'ACTIVE'`, `type: 'LOW_STOCK'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-025 · Sin alerta activa retorna null

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-025` — `Integration: PrismaAlertRepository › findActiveByProductId › should return null if no active alert exists` |
| **2. Precondiciones** | BD limpia; producto sin alertas. |
| **3. Datos de Entrada** | `findActiveByProductId(product.id)` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Consultar.<br>3. Verificar. |
| **5. Resultado Esperado** | `null`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-026 · Solo alerta resuelta retorna null

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-026` — `Integration: PrismaAlertRepository › findActiveByProductId › should return null if only resolved alert exists` |
| **2. Precondiciones** | Producto con alerta `RESOLVED`. |
| **3. Datos de Entrada** | `findActiveByProductId(product.id)` |
| **4. Pasos** | 1. Sembrar producto y alerta resuelta.<br>2. Consultar.<br>3. Verificar. |
| **5. Resultado Esperado** | `null`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-027 · Paginación de alertas

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-027` — `Integration: PrismaAlertRepository › findByFilters › should return paginated alerts` |
| **2. Precondiciones** | BD limpia; 3 alertas `ACTIVE` para un producto. |
| **3. Datos de Entrada** | `{ page: 1, pageSize: 2 }` |
| **4. Pasos** | 1. Sembrar 3 alertas.<br>2. Consultar.<br>3. Verificar página y total. |
| **5. Resultado Esperado** | `data.length === 2`, `total === 3`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-028 · Filtrar alertas por estado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-028` — `Integration: PrismaAlertRepository › findByFilters › should filter by status` |
| **2. Precondiciones** | Una alerta `ACTIVE` y una `RESOLVED`. |
| **3. Datos de Entrada** | `{ status: 'RESOLVED', page: 1, pageSize: 10 }` |
| **4. Pasos** | 1. Sembrar alertas.<br>2. Filtrar.<br>3. Verificar. |
| **5. Resultado Esperado** | `data.length === 1`, `data[0].status === 'RESOLVED'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-I-029 · Filtrar alertas por producto

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-I-029` — `Integration: PrismaAlertRepository › findByFilters › should filter by productId` |
| **2. Precondiciones** | Dos productos, cada uno con una alerta `ACTIVE`. |
| **3. Datos de Entrada** | `{ productId: product1.id, page: 1, pageSize: 10 }` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Filtrar por producto.<br>3. Verificar. |
| **5. Resultado Esperado** | `data.length === 1`, `data[0].productId === product1.id`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

---

## 2. Hallazgos Reproducibles y Evidencias

### F-01 (Crítica) · Los helpers de seed envían UUID como `text`

- **Descripción:** Todas las funciones de `test/helpers/test-database.helper.ts` ejecutan `$executeRawUnsafe` con parámetros UUID. Prisma los tipa como `text` y PostgreSQL no realiza la conversión implícita a `uuid`, por lo que la inserción falla. Afecta a `seedCategory` (`:20`), `seedSupplier` (`:35`), `seedProduct` (`:70`), `seedAlert` (`:105`) y `seedPurchaseOrder` (`:142`).
- **Severidad:** Crítica (bloquea la suite completa de integración y la mayor parte de E2E).
- **Pasos para reproducirlo:**
  1. `docker compose up -d postgres`
  2. Crear la BD: `docker exec mercado-express-db psql -U postgres -d mercado_express -c "CREATE DATABASE mercado_express_test"`.
  3. `npm run test:integration:setup`.
  4. `npm run test:integration -- --verbose`.
  5. Observar los 26 fallos y el stack en `seedCategory`.
  6. Reproducción mínima con Prisma:
     ```bash
     DATABASE_URL='postgresql://postgres:postgres@localhost:5432/mercado_express_test?schema=public' \
       node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.\$executeRawUnsafe('INSERT INTO categories (id,name,is_deleted) VALUES (\$1,\$2,false)','11111111-1111-1111-1111-111111111111','X').catch(e=>console.log(e.code,e.message)).finally(()=>p.\$disconnect())"
     ```
- **Evidencia visual sugerida:**
  1. Terminal con el resumen `Tests: 26 failed, 3 passed, 29 total`.
  2. Captura del stack trace señalando `test-database.helper.ts:20`.
  3. Captura de `\d+ categories` en `psql` mostrando `id uuid`.
  4. Captura del `psql` con la prueba mínima devolviendo el error.
- **Logs de ejecución:**
  ```text
  PrismaClientKnownRequestError:
  Invalid `prisma.$executeRawUnsafe()` invocation:
  Raw query failed. Code: `42804`. Message: `ERROR: column "id" is of type uuid
  but expression is of type text
  HINT: You will need to rewrite or cast the expression.`
      at seedCategory (../test/helpers/test-database.helper.ts:20:3)

  Test Suites: 4 failed, 4 total
  Tests:       26 failed, 3 passed, 29 total
  ```
- **Impacto:** Las 26 pruebas afectadas no llegan a validar la lógica del repositorio; el resultado no demuestra que el repositorio funcione o falle, solo que el seed falla. Cualquier regresión real en los repositorios queda enmascarada.

### F-02 (Crítica) · La consulta raw de producción tiene el mismo problema

- **Descripción:** `src/modules/inventory/infrastructure/persistence/prisma-inventory.repository.ts:25-28` ejecuta:
  ```sql
  UPDATE products SET current_stock = current_stock + $1
  WHERE id = $2 AND (current_stock + $1) >= 0
  ```
  con `params.productId` (UUID) como parámetro. En PostgreSQL esto falla con `SQLSTATE 42883: operator does not exist: uuid = text`.
- **Severidad:** Crítica (riesgo funcional en producción, no solo en tests).
- **Pasos para reproducirlo:**
  1. Sembrar un producto con UUID mediante `psql` (usando casts explícitos) en `mercado_express_test`.
  2. Ejecutar con Node + Prisma:
     ```bash
     DATABASE_URL='postgresql://postgres:postgres@localhost:5432/mercado_express_test?schema=public' \
       node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.\$executeRawUnsafe('UPDATE products SET current_stock = current_stock + \$1 WHERE id = \$2 AND (current_stock + \$1) >= 0',5,'33333333-3333-3333-3333-333333333333').then(n=>console.log(n)).catch(e=>console.log(e.code,e.message)).finally(()=>p.\$disconnect())"
     ```
  3. Observar el error.
  4. Alternativamente, con la BD sembrada y la API levantada, `POST /inventory/adjustments` con un `productId` válido.
- **Evidencia visual sugerida:**
  1. Captura del error `P2010` / `42883` en la terminal.
  2. Captura de la respuesta HTTP 500 en Swagger/Postman para `POST /inventory/adjustments`.
  3. Captura del código fuente en `prisma-inventory.repository.ts:25`.
  4. Captura del log del `GlobalExceptionFilter` mostrando `INTERNAL_SERVER_ERROR`.
- **Logs de ejecución:**
  ```text
  ERROR CODE: P2010
  ERROR MSG: Raw query failed. Code: `42883`. Message: `ERROR: operator does not exist: uuid = text
  HINT: No operator matches the given name and argument types.
  You might need to add explicit type casts.`
  ```
- **Impacto:** `POST /inventory/adjustments` y `PATCH /purchase-orders/:id/receive` (que delega en el mismo caso de uso) pueden devolver 500 con datos reales. La suite de integración no lo detecta porque falla antes, en el seed.

### F-04 (Alta) · El CI no ejecuta integración ni E2E

- **Descripción:** `.github/workflows/deploy.yaml` ejecuta `npm test`. Ese script usa la configuración Jest de `package.json`, cuyo `testRegex`/`testPathIgnorePatterns` excluye `*.integration.spec.ts`, y la configuración de E2E vive en `test/jest-e2e.json` (no se invoca). Por tanto, el pipeline despliega aunque F-01, F-02 y F-03 estén presentes.
- **Severidad:** Alta.
- **Pasos para reproducirlo:** Abrir `.github/workflows/deploy.yaml`, paso `Run tests`; comparar con `package.json` (`scripts.test` y bloque `jest`).
- **Evidencia visual sugerida:** Captura del workflow y del bloque Jest de `package.json`.
- **Logs de ejecución:** No aplica (análisis de configuración).

### Observación (Media) · Aislamiento de la base de datos compartida

- **Descripción:** Integración y E2E comparten `mercado_express_test` y ejecutan `cleanDatabase()` por prueba. Si ambas suites se ejecutan en paralelo (por ejemplo, dos jobs de CI), pueden interferir entre sí. El script E2E usa `--runInBand`, pero no hay bloqueo entre suites.
- **Severidad:** Media.
- **Pasos para reproducirlo:** Ejecutar `npm run test:integration` y `npm run test:e2e` simultáneamente contra la misma BD y observar fallos intermitentes por datos eliminados.
- **Evidencia visual sugerida:** Captura de ambos procesos concurrentes y de los errores de constraints/datos faltantes.
- **Logs de ejecución:** No se reprodujo en esta auditoría (se ejecutaron secuencialmente).

---

## 3. Entorno, Herramientas y Recursos de Prueba

### Herramientas y frameworks

| Herramienta | Versión / Uso |
| :--- | :--- |
| Node.js | `v24.21.0` |
| npm | `11.19.0` |
| Jest | `30.4.1` |
| ts-jest | `^29.2.5` |
| Prisma Client / CLI | `6.19.3` (instalado por `npm ci`) |
| PostgreSQL | `16-alpine` (contenedor `mercado-express-db`) |
| Docker | `29.7.2`, Compose `5.5.1` |
| `cross-env` | `^10.1.0` |

### Scripts de ejecución

| Comando | Propósito |
| :--- | :--- |
| `npm run test:integration:setup` | Aplica migraciones Prisma sobre `mercado_express_test` (`prisma migrate deploy`). |
| `npm run test:integration` | Jest con `test/jest-integration.json` y `DATABASE_URL` de test; ejecuta `*.integration.spec.ts` dentro de `src/`. |
| `npm test` | Solo unitarias; **no** ejecuta esta suite. |
| `npm run test:cov` | Cobertura (no ejecutado para no escribir fuera de `casos-prueba/`). |

### Configuraciones requeridas

- **Archivo:** `test/jest-integration.json`
  - `rootDir`: `../src`
  - `testRegex`: `.*\\.integration\\.spec\\.ts$`
  - `moduleNameMapper`:
    - `^src/(.*)$` → `<rootDir>/$1`
    - `^test/helpers/(.*)$` → `<rootDir>/../test/helpers/$1`
  - `testEnvironment`: `node`
- **Variable de entorno:** `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mercado_express_test?schema=public` (inyectada por el script con `cross-env`).
- **Servicio externo:** PostgreSQL 16 en `localhost:5432`.
- **Base de datos:** `mercado_express_test` (no la crea `compose.yaml`; hay que crearla manualmente).
- **Migraciones:** `prisma/migrations/20260709172717_init` y `prisma/migrations/20260710160653_add_rejection_reason_to_purchase_orders`.
- **Prisma Client:** requiere `npx prisma generate` antes de ejecutar.

### Datos de prueba (fixtures / seeds)

| Ubicación | Descripción |
| :--- | :--- |
| `test/helpers/test-database.helper.ts:5` | `cleanDatabase()`: elimina `purchase_orders`, `alerts`, `inventory_transactions`, `products`, `categories` y `suppliers` en orden de dependencias. |
| `test/helpers/test-database.helper.ts:14` | `seedCategory`: inserta `{ id, name, is_deleted: false }` con UUID aleatorio. |
| `test/helpers/test-database.helper.ts:29` | `seedSupplier`: inserta `{ id, name, is_deleted: false }`. |
| `test/helpers/test-database.helper.ts:44` | `seedProduct`: por defecto `price: 10.0`, `currentStock: 20`, `minStock: 5`, SKU y nombre aleatorios. |
| `test/helpers/test-database.helper.ts:95` | `seedAlert`: por defecto `type: 'LOW_STOCK'`, `status: 'ACTIVE'`. |
| `test/helpers/test-database.helper.ts:116` | `seedPurchaseOrder`: por defecto `quantity: 20`, `status: 'PENDING'`, `source: 'MANUAL'`. |

**Problema conocido:** todos los seeds anteriores usan `$executeRawUnsafe` y son la causa directa de F-01.

### Estado de la base de datos tras la ejecución

Las pruebas que fallan lo hacen antes de insertar datos; las que pasan no dejan residuos relevantes. No se ejecutó limpieza final de la BD para no alterar el entorno del usuario más allá de lo necesario.
