# Reporte de Revalidación — Corrección de Pruebas Fallidas

**Proyecto:** Mercado Express · **Fecha:** 2026-11-14
**Alcance:** corrección de los 50 casos fallidos detectados en la auditoría inicial (`README.md`).
**Resultado final:** **110/110 PASS** (53 unitarias + 29 integración + 28 E2E).

---

## 1. Resultado de la revalidación

| Suite | Comando | Antes | Después |
| :--- | :--- | :--- | :--- |
| Unitaria | `npm run test:unit` | 53/53 PASS | **53/53 PASS** |
| Integración | `npm run test:integration` | 3/29 PASS | **29/29 PASS** |
| E2E | `npm run test:e2e` | 4/28 PASS | **28/28 PASS** |
| **Total** | — | **60/110 PASS** | **110/110 PASS** |

### Salidas reales

```text
# npm run test:unit
Test Suites: 7 passed, 7 total
Tests:       53 passed, 53 total

# npm run test:integration
Test Suites: 4 passed, 4 total
Tests:       29 passed, 29 total

# npm run test:e2e
Test Suites: 4 passed, 4 total
Tests:       28 passed, 28 total
```

### Verificaciones de calidad

```text
# npx tsc --noEmit
(sin errores, exit 0)

# npx eslint "{src,apps,libs,test}/**/*.ts"
63 problems (0 errors, 63 warnings)
(exit 0)
```

Los 63 warnings restantes son `@typescript-eslint/no-unsafe-member-access`, `no-unsafe-assignment` y `no-explicit-any` en tests E2E y mocks; no bloquean la calidad ni la ejecución.

---

## 2. Correcciones aplicadas

### F-01 (Crítica) · UUID como `text` en los helpers de seed

**Archivo:** `test/helpers/test-database.helper.ts`

Se agregaron casts explícitos a los parámetros de `$executeRawUnsafe`:

| Seed | SQL ajustado |
| :--- | :--- |
| `seedCategory` | `VALUES ($1::uuid, $2, false)` |
| `seedSupplier` | `VALUES ($1::uuid, $2, false)` |
| `seedProduct` | `VALUES ($1::uuid, $2, $3, $4::uuid, $5::uuid, $6::numeric, $7::int, $8::int)` |
| `seedAlert` | `VALUES ($1::uuid, $2::uuid, $3::"TypeAlert", $4::"AlertStatus")` |
| `seedPurchaseOrder` | `VALUES ($1::uuid, $2::uuid, $3::int, $4::uuid, $5::"PurchaseOrderStatus", $6::"PurchaseOrderSource", $7::uuid, $8)` |

**Resultado:** las 26 pruebas de integración que fallaban en el seed ahora llegan al repositorio y pasan.

### F-02 (Crítica) · UUID como `text` en la consulta raw de producción

**Archivo:** `src/modules/inventory/infrastructure/persistence/prisma-inventory.repository.ts:25-28`

```sql
UPDATE products
SET current_stock = current_stock + $1::int
WHERE id = $2::uuid AND (current_stock + $1::int) >= 0
```

**Resultado:** se eliminó el error `42883 (uuid = text)` que afectaba a `POST /inventory/adjustments` y a la recepción de órdenes. Los casos E2E de inventario y recepción ahora pasan.

### F-03 (Alta) · Expectativa obsoleta del endpoint raíz

**Archivo:** `test/app.e2e-spec.ts`

Se reemplazó la expectativa de string `'Hello World!'` por aserciones sobre el contrato real de `AppService.getHello()`:

```ts
const response = await request(app.getHttpServer()).get('/').expect(200);

expect(response.body.message).toBe(
  'Welcome to the Inventory Management System API!',
);
expect(response.body.version).toBe('1.0.0');
expect(response.body.timestamp).toBeDefined();
```

**Resultado:** `TC-E-001` pasa y la prueba de humo valida el contrato vigente.

### Ajustes de calidad adicionales

| Archivo | Cambio |
| :--- | :--- |
| `src/modules/inventory/application/use-cases/adjust-stock.use-case.spec.ts` | `transactionType` tipado con `as const` para satisfacer `tsc`. |
| `src/main.ts` | `bootstrap()` → `void bootstrap()` para `no-floating-promises`. |
| `src/modules/products/infrastructure/persistence/prisma-product.repository.integration.spec.ts` | Eliminada variable `seeded` sin uso. |
| `test/modules/purchase-orders/purchase-orders.e2e-spec.ts` | Eliminada variable `alert` sin uso. |
| `eslint.config.mjs` | `@typescript-eslint/unbound-method` desactivado solo para `*.spec.ts` y `*.e2e-spec.ts` (falso positivo al aseverar sobre mocks de Jest). |

---

## 3. Archivos modificados

```text
eslint.config.mjs
src/main.ts
src/modules/inventory/application/use-cases/adjust-stock.use-case.spec.ts
src/modules/inventory/infrastructure/persistence/prisma-inventory.repository.ts
src/modules/products/infrastructure/persistence/prisma-product.repository.integration.spec.ts
test/app.e2e-spec.ts
test/helpers/test-database.helper.ts
test/modules/purchase-orders/purchase-orders.e2e-spec.ts
```

No se modificó ningún archivo de `casos-prueba/` para obtener los resultados; esta revalidación se documenta aparte.

---

## 4. Observaciones pendientes (no bloqueantes)

1. **CI no ejecuta integración ni E2E.** `.github/workflows/deploy.yaml` sigue ejecutando solo `npm test` (unitarias). Se recomienda añadir pasos con PostgreSQL de servicio para `test:integration` y `test:e2e`; de lo contrario, futuras regresiones en repositorios o endpoints no se detectarán antes del despliegue.
2. **`--forceExit` en E2E.** Jest emite la advertencia de handles abiertos. `test/helpers/test-database.helper.ts:3` crea un `PrismaService` global que no se desconecta. Se recomienda añadir un `afterAll` global o reutilizar el `PrismaService` de la app.
3. **Caso duplicado.** `create-purchase-order.use-case.spec.ts:214` y `:231` siguen probando el mismo escenario (`minStock: 10`, `quantity: 19`). No afecta la ejecución, pero conviene reemplazar uno por un borde distinto (p. ej. `quantity: 0`).
4. **Cobertura incompleta.** Persisten sin pruebas los módulos `categories` y `suppliers`, `CreateProduct`, casos de uso `Find*`, controllers/presenters y validaciones de DTO más allá de los casos E2E actuales.
