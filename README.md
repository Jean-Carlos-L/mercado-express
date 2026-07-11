# Mercado Express

API REST para la gestión de inventario y órdenes de compra. Desarrollada como proyecto de evaluación técnica demostrando Clean Architecture, diseño orientado a dominio y operaciones transaccionales de inventario en NestJS.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Variables de Entorno](#variables-de-entorno)
- [Instalación Local](#instalación-local)
- [Documentación de la API](#documentación-de-la-api)
- [Pruebas](#pruebas)
- [Reglas de Negocio](#reglas-de-negocio)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Mejoras Futuras](#mejoras-futuras)

---

## Descripción

Mercado Express es un sistema backend que gestiona **productos**, **categorías**, **proveedores**, **transacciones de inventario**, **alertas de stock bajo** y **órdenes de compra**. Ofrece:

- CRUD de productos con validación de unicidad de SKU.
- Gestión de categorías y proveedores con eliminación lógica (soft delete).
- Ajustes de stock (entradas/salidas) con garantías transaccionales atómicas.
- Creación y resolución automática de alertas de stock bajo vinculadas a movimientos de inventario.
- Ciclo de vida de órdenes de compra (crear, aprobar, rechazar, recibir) con transiciones de estado estrictas.
- Consultas filtradas y paginadas en todas las entidades principales.

---

## Tecnologías

| Tecnología                                                          | Versión                  | Propósito                                    |
| ------------------------------------------------------------------- | ------------------------ | -------------------------------------------- |
| [NestJS](https://nestjs.com/)                                       | 11                       | Framework de aplicación                      |
| [TypeScript](https://www.typescriptlang.org/)                       | 5.7                      | Lenguaje (módulo nodeNext)                   |
| [Prisma](https://www.prisma.io/)                                    | 7                        | ORM con `@prisma/adapter-pg` (driver nativo) |
| [PostgreSQL](https://www.postgresql.org/)                           | 16                       | Base de datos relacional                     |
| [Docker](https://www.docker.com/)                                   | Compose 3.9              | Contenedor de base de datos local            |
| [Jest](https://jestjs.io/)                                          | 30                       | Pruebas unitarias, de integración y E2E      |
| [Supertest](https://github.com/ladakh/supertest)                    | 7                        | Aserciones HTTP para pruebas E2E             |
| [Swagger](https://swagger.io/)                                      | vía `@nestjs/swagger` 11 | Documentación de la API en `/docs`           |
| [Helmet](https://helmetjs.github.io/)                               | 8                        | Headers de seguridad HTTP                    |
| [class-validator](https://github.com/typestack/class-validator)     | 0.15                     | Validación de DTOs de entrada                |
| [class-transformer](https://github.com/typestack/class-transformer) | 0.5                      | Transformación de objetos                    |
| [ESLint](https://eslint.org/)                                       | 9                        | Linting (flat config, type-checked)          |
| [Prettier](https://prettier.io/)                                    | 3                        | Formateo de código                           |

---

## Arquitectura

El proyecto sigue los principios de **Clean Architecture** adaptados al ecosistema NestJS, organizado en cuatro capas distintas por módulo.

### Por qué Clean Architecture

- **Separación de responsabilidades**: Las reglas de negocio están desacopladas de los detalles del framework (Express, Prisma, HTTP).
- **Testabilidad**: Las entidades de dominio y los casos de uso pueden probarse con unit tests sin infraestructura.
- **Reemplazabilidad**: La implementación del repositorio en Prisma puede cambiarse por otro ORM o SQL puro sin afectar la lógica de negocio.
- **Escalabilidad**: Los nuevos módulos siguen la misma estructura, haciendo el código predecible y consistente.

### Responsabilidades de cada Capa

```
Dominio          →  Entidades, interfaces de repositorio, errores de dominio
Aplicación       →  Casos de uso (orquestan la lógica de dominio), DTOs de aplicación
Infraestructura  →  Implementaciones de repositorio en Prisma, mappers (Prisma ↔ Dominio)
Presentación     →  Controllers, DTOs de request/response, decoradores Swagger, presenters
```

### Capa Transversal (shared/)

```
shared/
  database/       →  PrismaService (gestión del ciclo de vida, conexión)
  domain/errors/  →  Clase base DomainException, DTO ErrorResponse
  pagination/     →  DTOs genéricos de paginación (request, metadata, response)
  presentation/   →  GlobalExceptionFilter, decoradores de error de Swagger
```

---

## Estructura del Proyecto

```
mercado-express/
├── prisma/
│   └── schema.prisma              # Esquema de base de datos, enums, índices
├── src/
│   ├── main.ts                    # Bootstrap: pipes, filters, Swagger, CORS, Helmet
│   ├── app.module.ts              # Módulo raíz
│   ├── modules/
│   │   ├── categories/            # CRUD de categorías (domain, application, infrastructure, presentation)
│   │   ├── suppliers/             # CRUD de proveedores (misma estructura)
│   │   ├── products/              # CRUD de productos con unicidad de SKU
│   │   ├── inventory/             # Ajustes de stock + gestión de alertas
│   │   └── purchase-orders/       # Ciclo de vida de órdenes (crear/aprobar/rechazar/recibir)
│   └── shared/
│       ├── database/              # PrismaService
│       ├── domain/errors/         # DomainException, ErrorResponse
│       ├── pagination/            # Tipos genéricos de paginación
│       └── presentation/          # GlobalExceptionFilter, decoradores Swagger
├── test/
│   ├── helpers/                   # Limpieza de BD de prueba, fábrica de apps de test
│   ├── modules/                   # Archivos de pruebas E2E e integración
│   ├── jest-e2e.json              # Configuración de pruebas E2E
│   └── jest-integration.json      # Configuración de pruebas de integración
├── compose.yaml                   # Docker Compose (PostgreSQL 16)
├── prisma.config.ts               # Configuración del cliente Prisma
├── eslint.config.mjs              # Configuración flat de ESLint
├── tsconfig.json                  # Configuración de TypeScript
└── package.json                   # Scripts y dependencias
```

---

## Requisitos

| Software                | Versión                       |
| ----------------------- | ----------------------------- |
| Node.js                 | >= 18.0 (recomendado: 20 LTS) |
| npm                     | >= 9.0                        |
| PostgreSQL              | 16                            |
| Docker + Docker Compose | >= 20.10                      |

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mercado_express?schema=public"
PORT=3000
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

| Variable          | Descripción                      | Valor por defecto                             |
| ----------------- | -------------------------------- | --------------------------------------------- |
| `DATABASE_URL`    | Cadena de conexión a PostgreSQL  | Obligatoria                                   |
| `PORT`            | Puerto de escucha del servidor   | `3000`                                        |
| `ALLOWED_ORIGINS` | Orígenes CORS separados por coma | `http://localhost:3000,http://localhost:5173` |

---

## Instalación Local

### 1. Clonar el repositorio

```bash
# HTTPS
git clone https://github.com/Jean-Carlos-L/mercado-express.git

# SSH
git clone git@github.com:Jean-Carlos-L/mercado-express.git

cd mercado-express
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con las credenciales de tu base de datos
```

### 4. Iniciar PostgreSQL

```bash
docker compose up -d
```

Esto inicia PostgreSQL 16 en el puerto `5432` con la base de datos `mercado_express`.

### 5. Ejecutar migraciones

```bash
npx prisma migrate dev
```

### 6. Iniciar la aplicación

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3000`.

### Inicio rápido (todo en uno)

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

---

## Documentación de la API

Swagger UI está disponible en:

```
http://localhost:3000/docs
```

### Resumen de Endpoints

| Método  | Endpoint                       | Descripción                                   |
| ------- | ------------------------------ | --------------------------------------------- |
| `POST`  | `/categories`                  | Crear una categoría                           |
| `GET`   | `/categories`                  | Listar categorías (paginado)                  |
| `POST`  | `/suppliers`                   | Crear un proveedor                            |
| `GET`   | `/suppliers`                   | Listar proveedores (paginado)                 |
| `POST`  | `/products`                    | Crear un producto                             |
| `POST`  | `/inventory/adjustments`       | Ajustar stock (entrada/salida)                |
| `GET`   | `/inventory`                   | Consultar productos con filtros               |
| `GET`   | `/inventory/alerts`            | Listar alertas de stock bajo                  |
| `POST`  | `/purchase-orders`             | Crear una orden de compra                     |
| `GET`   | `/purchase-orders`             | Listar órdenes de compra (filtrado, paginado) |
| `PATCH` | `/purchase-orders/:id/approve` | Aprobar una orden pendiente                   |
| `PATCH` | `/purchase-orders/:id/reject`  | Rechazar una orden pendiente                  |
| `PATCH` | `/purchase-orders/:id/receive` | Recibir una orden aprobada (actualiza stock)  |

---

## Pruebas

El proyecto incluye tres niveles de pruebas:

### Pruebas Unitarias

Ejecuta lógica de entidades de dominio y casos de uso (no requiere base de datos):

```bash
npm run test:unit
```

### Pruebas de Integración

Ejecuta pruebas de implementación de repositorios contra una base de datos PostgreSQL real:

```bash
# Asegurar que la BD de prueba existe y las migraciones están aplicadas
npm run test:integration:setup
npm run test:integration
```

### Pruebas E2E

Ejecuta pruebas del ciclo completo de peticiones HTTP:

```bash
npm run test:e2e
```

### Cobertura

```bash
npm run test:cov
```

Los reportes de cobertura se generan en el directorio `coverage/`.

---

## Reglas de Negocio

### Inventario

- **Sin stock negativo**: Los ajustes de stock son rechazados a nivel de base de datos mediante un `UPDATE ... WHERE (current_stock + $1) >= 0` condicional. Si la condición falla, la transacción retorna `null` y la aplicación lanza `InsufficientStockError`.
- **Cambios atómicos de stock**: La actualización de stock, el registro de transacción de inventario y la gestión de alertas se ejecutan dentro de una sola transacción de base de datos. Todo tiene éxito o nada persiste.
- **Historial de transacciones inmutable**: Los registros de `InventoryTransaction` son de solo append. No existen operaciones de actualización o eliminación en el repositorio.

### Alertas de Stock Bajo

- **Creación automática**: Cuando el stock baja a o por debajo de `minStock` y no existe una alerta activa, se crea una alerta `LOW_STOCK` con estado `ACTIVE`.
- **Resolución automática**: Cuando el stock sube por encima de `minStock` y existe una alerta activa, el estado de la alerta cambia a `RESOLVED`.
- **Una alerta activa por producto**: Solo puede existir una alerta `LOW_STOCK` activa a la vez por producto.

### Órdenes de Compra

- **Cantidad mínima de pedido**: `quantity >= 2 × product.minStock`. Las órdenes por debajo de este umbral son rechazadas.
- **Creación consciente del origen**:
  - `MANUAL`: No puede incluir `alertId`.
  - `LOW_STOCK_ALERT`: Debe incluir un `alertId` válido y activo asociado al producto.
- **Máquina de estados estricta**:
  - `PENDING` → `APPROVED` o `REJECTED`
  - `APPROVED` → `RECEIVED`
  - Todas las demás transiciones son rechazadas con `InvalidOrderStatusTransitionError`.
- **Recepción de orden**: Cuando se recibe una orden `APPROVED`, el stock se incrementa automáticamente vía `AdjustStockUseCase` dentro de la misma operación.

### Entidades

- **Unicidad de SKU**: Los productos garantizan SKU único a nivel de capa de aplicación (verificar antes de crear).
- **Eliminación lógica**: Categorías y Proveedores utilizan un flag `is_deleted`. Todas las consultas filtran los registros eliminados lógicamente.
- **Llaves primarias UUID**: Todas las entidades usan UUIDs de PostgreSQL (`@default(uuid())`).

---

## Decisiones Técnicas

### Repository Pattern con Tokens de Inyección de Tipo String

Las interfaces de repositorio se definen en la capa de dominio y se enlazan a implementaciones de Prisma mediante tokens de tipo string (ej. `PRODUCT_REPOSITORY`). Esto desacopla los casos de uso de la infraestructura y facilita el mocking en pruebas unitarias.

### Entidades de Dominio como Clases Simples

Las entidades no están ligadas a modelos de Prisma. Utilizan métodos de fábrica estáticos (`create()`, `restore()`) y propiedades simples, manteniendo la capa de dominio independiente del framework.

### Presenters para Mapeo de Respuestas

Cada módulo tiene una clase `Presenter` con métodos estáticos que convierten entidades de dominio a DTOs de respuesta. Esto mantiene los controllers delgados y centraliza la lógica de transformación de respuestas.

### Manejo Global de Excepciones

Un solo `GlobalExceptionFilter` mapea códigos de error de dominio a estados HTTP mediante una tabla de búsqueda (`STATUS_MAP`). Esto elimina el manejo repetitivo de errores en los controllers y asegura un formato de respuesta de error consistente.

### SQL Condicional para Actualizaciones de Stock

Los ajustes de stock usan `$executeRawUnsafe` con una cláusula `WHERE` en lugar de un leer-then-escribir a nivel de aplicación. Esto previene condiciones de carrera y garantiza atomicidad sin bloqueos explícitos a nivel de fila.

### Decoradores de Error en Swagger

Cada endpoint del controller usa decoradores Swagger específicos (ej. `@ApiProductAlreadyExistsError()`) en lugar de respuestas de error genéricas. Esto produce documentación precisa y específica por endpoint en Swagger UI.
