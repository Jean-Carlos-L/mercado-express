# Reporte de Casos de Prueba — Mercado Express

**Auditoría QA:** ejecución real de las suites unitaria, de integración y E2E del repositorio.
**Fecha de ejecución:** 2026-11-14
**Commit auditado:** `0f8745c` (rama `master`)
**Alcance:** 110 casos de prueba implementados en 15 archivos de test.

> Este documento y los reportes de suite se generaron sin modificar código fuente ni archivos fuera de `casos-prueba/`. La base de datos usada fue `mercado_express_test` en el contenedor PostgreSQL del propio repositorio.

---

## Resumen ejecutivo

| Suite | Archivos | Casos | PASS | FAIL | % Éxito |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Unitaria (`*.spec.ts`) | 7 | 53 | 53 | 0 | 100 % |
| Integración (`*.integration.spec.ts`) | 4 | 29 | 3 | 26 | 10,3 % |
| E2E (`*.e2e-spec.ts`) | 4 | 28 | 4 | 24 | 14,3 % |
| **Total** | **15** | **110** | **60** | **50** | **54,5 %** |

### Resultado por archivo

| Archivo | Casos | PASS | FAIL |
| :--- | ---: | ---: | ---: |
| `src/modules/inventory/application/use-cases/adjust-stock.use-case.spec.ts` | 4 | 4 | 0 |
| `src/modules/products/domain/entities/product.entity.spec.ts` | 11 | 11 | 0 |
| `src/shared/presentation/filters/global-exception.filter.spec.ts` | 11 | 11 | 0 |
| `src/modules/purchase-orders/application/use-cases/create-purchase-order.use-case.spec.ts` | 11 | 11 | 0 |
| `src/modules/purchase-orders/application/use-cases/approve-purchase-order.use-case.spec.ts` | 5 | 5 | 0 |
| `src/modules/purchase-orders/application/use-cases/reject-purchase-order.use-case.spec.ts` | 5 | 5 | 0 |
| `src/modules/purchase-orders/application/use-cases/receive-purchase-order.use-case.spec.ts` | 6 | 6 | 0 |
| `src/modules/products/infrastructure/persistence/prisma-product.repository.integration.spec.ts` | 8 | 2 | 6 |
| `src/modules/purchase-orders/infrastructure/persistence/prisma-purchase-order.repository.integration.spec.ts` | 7 | 1 | 6 |
| `src/modules/inventory/infrastructure/persistence/prisma-inventory.repository.integration.spec.ts` | 8 | 0 | 8 |
| `src/modules/inventory/infrastructure/persistence/prisma-alert.repository.integration.spec.ts` | 6 | 0 | 6 |
| `test/app.e2e-spec.ts` | 1 | 0 | 1 |
| `test/modules/products/products.e2e-spec.ts` | 3 | 1 | 2 |
| `test/modules/purchase-orders/purchase-orders.e2e-spec.ts` | 15 | 1 | 14 |
| `test/modules/inventory/inventory.e2e-spec.ts` | 9 | 2 | 7 |

---

## Documentos de la auditoría

| Documento | Contenido |
| :--- | :--- |
| [`reporte-unit.md`](./reporte-unit.md) | Matriz de 53 casos unitarios, hallazgos y entorno. |
| [`reporte-integration.md`](./reporte-integration.md) | Matriz de 29 casos de integración, hallazgos y entorno. |
| [`reporte-e2e.md`](./reporte-e2e.md) | Matriz de 28 casos E2E, hallazgos y entorno. |

---

## Hallazgos críticos (resumen)

| ID | Severidad | Hallazgo | Impacto |
| :--- | :--- | :--- | :--- |
| F-01 | **Crítica** | Los helpers de seed usan `$executeRawUnsafe` con UUID enviados como `text`; PostgreSQL rechaza la inserción (`SQLSTATE 42804`). | Bloquea 26/29 pruebas de integración y 24/28 E2E. |
| F-02 | **Crítica** | La consulta raw de producción `PrismaInventoryRepository.adjustStock` usa el mismo patrón (`id = $2` con UUID como texto) y falla con `SQLSTATE 42883`. | `POST /inventory/adjustments` y la recepción de órdenes pueden devolver 500 en ejecución real. |
| F-03 | **Alta** | `test/app.e2e-spec.ts:23` espera `'Hello World!'`, pero el endpoint devuelve un JSON de bienvenida. | Prueba de humo E2E obsoleta y siempre fallida. |
| F-04 | **Alta** | El CI (`.github/workflows/deploy.yaml`) ejecuta solo `npm test` (unitarias). Nunca ejecuta integración ni E2E. | Los fallos F-01 y F-03 no se detectan en el pipeline. |
| F-05 | **Media** | Caso duplicado en `create-purchase-order.use-case.spec.ts:231` (mismos datos que la línea 214). | Falsa sensación de cobertura; no aporta un escenario nuevo. |
| F-06 | **Media** | Módulos `categories` y `suppliers` sin pruebas; casos de uso `create-product`, `find-*`, controllers/presenters y validaciones de DTO sin cobertura. | Puntos ciegos de cobertura. |

El detalle reproducible, con stack traces y capturas sugeridas, está en la sección **2. Hallazgos Reproducibles y Evidencias** de cada reporte de suite.

---

## Reproducción rápida

```bash
# 1. Dependencias y cliente Prisma
npm ci
npx prisma generate

# 2. PostgreSQL de pruebas (el compose crea la BD mercado_express; hay que crear la BD de test)
docker compose up -d postgres
docker exec mercado-express-db psql -U postgres -d mercado_express \
  -c "CREATE DATABASE mercado_express_test"

# 3. Migraciones y suites
npm run test:integration:setup
npm run test:unit
npm run test:integration
npm run test:e2e
```

**Salida real de los resúmenes:**

```text
# Unitarias
Test Suites: 7 passed, 7 total
Tests:       53 passed, 53 total

# Integración
Test Suites: 4 failed, 4 total
Tests:       26 failed, 3 passed, 29 total

# E2E
Test Suites: 4 failed, 4 total
Tests:       24 failed, 4 passed, 28 total
```
