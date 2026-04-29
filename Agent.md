# Agent.md — Contexto del Proyecto: Backend Bancario
> Este archivo es el contexto técnico completo para asistir en la generación de código del proyecto `pratica_bancario`.
> Debe ser leído y respetado en su totalidad antes de generar cualquier archivo.

---

## 1. IDENTIDAD DEL PROYECTO

| Propiedad | Valor |
|---|---|
| Nombre del directorio | `pratica_bancario` |
| Repositorio Git (siguiente entrega) | `pratica_backend_bancario` |
| Tipo de proyecto | Backend académico — sistema bancario |
| Fase actual | **Fase 1 únicamente**: Modelos + Migraciones Sequelize |
| Lenguaje | JavaScript (Node.js) — CommonJS (`require`/`module.exports`) |
| Entorno de ejecución | Node.js v18+ |
| Base de datos | MySQL 8.0 Community Edition |
| ORM | Sequelize v6 |
| Patrón arquitectónico | MVC (Model-View-Controller) — solo la capa **M** en esta fase |

---

## 2. STACK TECNOLÓGICO EXACTO

### Backend (`pratica_bancario/`)
```
Node.js v18+
Sequelize v6.x
sequelize-cli (para migraciones)
mysql2 (driver de MySQL para Sequelize)
dotenv (variables de entorno)
```

### Frontend (proyecto separado — NO parte de esta fase)
```
React 18 + Vite + TypeScript
(Se desarrollará en pratica_backend_bancario — no generar nada de frontend aquí)
```

---

## 3. CONFIGURACIÓN DE BASE DE DATOS

```
Motor:      MySQL 8.0 CEE
Host:       localhost
Puerto:     3306
Base de datos: banco
Usuario:    root
Contraseña: 1234
Charset:    utf8mb4
Collation:  utf8mb4_unicode_ci
```

---

## 4. ESTRUCTURA DE CARPETAS REQUERIDA

```
pratica_bancario/
├── config/
│   └── config.js               ← Configuración Sequelize (development/test/production)
├── models/
│   ├── index.js                ← Auto-generado por sequelize-cli, define asociaciones
│   ├── Role.js
│   ├── Sucursal.js
│   ├── TipoCuenta.js
│   ├── TipoTransaccion.js
│   ├── Usuario.js
│   ├── Cuenta.js
│   ├── Transaccion.js
│   ├── Tarjeta.js
│   ├── Prestamo.js
│   ├── CuotaPrestamo.js
│   └── Beneficiario.js
├── migrations/
│   ├── 20260429000001-create-roles.js
│   ├── 20260429000002-create-sucursales.js
│   ├── 20260429000003-create-tipos-cuenta.js
│   ├── 20260429000004-create-tipos-transaccion.js
│   ├── 20260429000005-create-usuarios.js
│   ├── 20260429000006-create-cuentas.js
│   ├── 20260429000007-create-transacciones.js
│   ├── 20260429000008-create-tarjetas.js
│   ├── 20260429000009-create-prestamos.js
│   ├── 20260429000010-create-cuotas-prestamo.js
│   └── 20260429000011-create-beneficiarios.js
├── database.js                 ← Instancia de Sequelize + prueba de conexión
├── .sequelizerc                ← Rutas para sequelize-cli
├── .env                        ← Variables de entorno (NO subir a Git)
├── .env.example                ← Plantilla de variables (SÍ subir a Git)
├── .gitignore
└── package.json
```

---

## 5. ESQUEMA COMPLETO DE BASE DE DATOS

### Convención de nombres
- **Modelos**: PascalCase en español (`Usuario`, `TipoCuenta`, `CuotaPrestamo`)
- **Tablas**: snake_case en plural (`usuarios`, `tipos_cuenta`, `cuotas_prestamo`)
- **Columnas**: snake_case (`created_at`, `tipo_cuenta_id`, `password_hash`)
- **Timestamps**: Sequelize maneja `created_at` y `updated_at` automáticamente (`underscored: true`)

---

### TABLA: `roles`
Catálogo de roles del sistema.
```
id            INT           PK, AUTO_INCREMENT, NOT NULL
nombre        VARCHAR(50)   NOT NULL, UNIQUE   (admin, cliente, empleado, cajero)
descripcion   TEXT          NULL
created_at    DATETIME      NOT NULL
updated_at    DATETIME      NOT NULL
```

---

### TABLA: `sucursales`
Agencias físicas del banco.
```
id          INT           PK, AUTO_INCREMENT, NOT NULL
nombre      VARCHAR(100)  NOT NULL
direccion   TEXT          NOT NULL
telefono    VARCHAR(20)   NULL
estado      TINYINT(1)    NOT NULL, DEFAULT 1
created_at  DATETIME      NOT NULL
updated_at  DATETIME      NOT NULL
```

---

### TABLA: `tipos_cuenta`
Categorías de cuentas bancarias.
```
id             INT            PK, AUTO_INCREMENT, NOT NULL
nombre         VARCHAR(50)    NOT NULL, UNIQUE   (Ahorros, Corriente, CDT, etc.)
descripcion    TEXT           NULL
tasa_interes   DECIMAL(5,2)   NOT NULL, DEFAULT 0.00
created_at     DATETIME       NOT NULL
updated_at     DATETIME       NOT NULL
```

---

### TABLA: `tipos_transaccion`
Catálogo de tipos de operación financiera.
```
id           INT          PK, AUTO_INCREMENT, NOT NULL
nombre       VARCHAR(50)  NOT NULL, UNIQUE   (Deposito, Retiro, Transferencia, Pago Servicio)
descripcion  TEXT         NULL
created_at   DATETIME     NOT NULL
updated_at   DATETIME     NOT NULL
```

---

### TABLA: `usuarios`
Clientes y empleados del sistema bancario.
```
id                   INT           PK, AUTO_INCREMENT, NOT NULL
rol_id               INT           NOT NULL, FK → roles(id), ON DELETE RESTRICT, ON UPDATE CASCADE
nombre               VARCHAR(100)  NOT NULL
apellido             VARCHAR(100)  NOT NULL
email                VARCHAR(150)  NOT NULL, UNIQUE
password_hash        VARCHAR(255)  NOT NULL
telefono             VARCHAR(20)   NULL
num_identificacion   VARCHAR(50)   NOT NULL, UNIQUE   (DUI / Cédula / Pasaporte)
fecha_nacimiento     DATE          NULL
direccion            TEXT          NULL
estado               ENUM('activo','inactivo','suspendido')  NOT NULL, DEFAULT 'activo'
created_at           DATETIME      NOT NULL
updated_at           DATETIME      NOT NULL
```

---

### TABLA: `cuentas`
Cuentas bancarias activas en el sistema.
```
id              INT           PK, AUTO_INCREMENT, NOT NULL
usuario_id      INT           NOT NULL, FK → usuarios(id), ON DELETE RESTRICT, ON UPDATE CASCADE
tipo_cuenta_id  INT           NOT NULL, FK → tipos_cuenta(id), ON DELETE RESTRICT, ON UPDATE CASCADE
sucursal_id     INT           NOT NULL, FK → sucursales(id), ON DELETE RESTRICT, ON UPDATE CASCADE
numero_cuenta   VARCHAR(20)   NOT NULL, UNIQUE
saldo           DECIMAL(15,2) NOT NULL, DEFAULT 0.00
moneda          VARCHAR(3)    NOT NULL, DEFAULT 'USD'
estado          ENUM('activa','inactiva','bloqueada','cerrada')  NOT NULL, DEFAULT 'activa'
fecha_apertura  DATE          NOT NULL
created_at      DATETIME      NOT NULL
updated_at      DATETIME      NOT NULL
```

---

### TABLA: `transacciones`
Registro inmutable de todos los movimientos financieros.
```
id                   INT            PK, AUTO_INCREMENT, NOT NULL
cuenta_origen_id     INT            NOT NULL, FK → cuentas(id), ON DELETE RESTRICT, ON UPDATE CASCADE
cuenta_destino_id    INT            NULL,     FK → cuentas(id), ON DELETE RESTRICT, ON UPDATE CASCADE
tipo_transaccion_id  INT            NOT NULL, FK → tipos_transaccion(id), ON DELETE RESTRICT, ON UPDATE CASCADE
monto                DECIMAL(15,2)  NOT NULL
descripcion          VARCHAR(255)   NULL
referencia           VARCHAR(100)   NULL, UNIQUE
estado               ENUM('pendiente','completada','fallida','revertida')  NOT NULL, DEFAULT 'pendiente'
fecha_transaccion    DATETIME       NOT NULL
created_at           DATETIME       NOT NULL
updated_at           DATETIME       NOT NULL
```

---

### TABLA: `tarjetas`
Tarjetas débito/crédito vinculadas a cuentas. Datos sensibles siempre hasheados.
```
id                    INT            PK, AUTO_INCREMENT, NOT NULL
cuenta_id             INT            NOT NULL, FK → cuentas(id), ON DELETE RESTRICT, ON UPDATE CASCADE
numero_tarjeta_hash   VARCHAR(255)   NOT NULL
ultimos_digitos       CHAR(4)        NOT NULL
tipo                  ENUM('debito','credito')  NOT NULL
fecha_vencimiento     DATE           NOT NULL
cvv_hash              VARCHAR(255)   NOT NULL
limite_credito        DECIMAL(15,2)  NULL   (solo aplica a tipo='credito')
estado                ENUM('activa','bloqueada','vencida','cancelada')  NOT NULL, DEFAULT 'activa'
created_at            DATETIME       NOT NULL
updated_at            DATETIME       NOT NULL
```

---

### TABLA: `prestamos`
Solicitudes y gestión del ciclo de vida de créditos.
```
id                    INT            PK, AUTO_INCREMENT, NOT NULL
usuario_id            INT            NOT NULL, FK → usuarios(id), ON DELETE RESTRICT, ON UPDATE CASCADE
cuenta_desembolso_id  INT            NOT NULL, FK → cuentas(id), ON DELETE RESTRICT, ON UPDATE CASCADE
monto_solicitado      DECIMAL(15,2)  NOT NULL
monto_aprobado        DECIMAL(15,2)  NULL
tasa_interes          DECIMAL(5,2)   NOT NULL
plazo_meses           INT            NOT NULL
estado                ENUM('solicitado','aprobado','rechazado','activo','pagado','moroso')  NOT NULL, DEFAULT 'solicitado'
fecha_solicitud       DATE           NOT NULL
fecha_aprobacion      DATE           NULL
created_at            DATETIME       NOT NULL
updated_at            DATETIME       NOT NULL
```

---

### TABLA: `cuotas_prestamo`
Tabla de amortización: una fila por cuota de cada préstamo.
```
id                INT            PK, AUTO_INCREMENT, NOT NULL
prestamo_id       INT            NOT NULL, FK → prestamos(id), ON DELETE CASCADE, ON UPDATE CASCADE
numero_cuota      INT            NOT NULL
monto_cuota       DECIMAL(15,2)  NOT NULL
monto_capital     DECIMAL(15,2)  NOT NULL
monto_interes     DECIMAL(15,2)  NOT NULL
fecha_vencimiento DATE           NOT NULL
fecha_pago        DATE           NULL
estado            ENUM('pendiente','pagada','vencida')  NOT NULL, DEFAULT 'pendiente'
created_at        DATETIME       NOT NULL
updated_at        DATETIME       NOT NULL
```
> **Nota**: Usa `ON DELETE CASCADE` porque las cuotas no tienen sentido sin el préstamo padre.

---

### TABLA: `beneficiarios`
Cuentas de terceros guardadas por un usuario para transferencias rápidas.
```
id                   INT           PK, AUTO_INCREMENT, NOT NULL
usuario_id           INT           NOT NULL, FK → usuarios(id), ON DELETE CASCADE, ON UPDATE CASCADE
nombre_beneficiario  VARCHAR(150)  NOT NULL
num_cuenta_destino   VARCHAR(20)   NOT NULL
banco_destino        VARCHAR(100)  NOT NULL
alias                VARCHAR(50)   NULL
estado               TINYINT(1)    NOT NULL, DEFAULT 1
created_at           DATETIME      NOT NULL
updated_at           DATETIME      NOT NULL
```

---

## 6. MAPA DE RELACIONES (Asociaciones Sequelize)

```
Role        hasMany    Usuario           (foreignKey: 'rol_id')
Usuario     belongsTo  Role              (foreignKey: 'rol_id')

Sucursal    hasMany    Cuenta            (foreignKey: 'sucursal_id')
Cuenta      belongsTo  Sucursal          (foreignKey: 'sucursal_id')

TipoCuenta  hasMany    Cuenta            (foreignKey: 'tipo_cuenta_id')
Cuenta      belongsTo  TipoCuenta        (foreignKey: 'tipo_cuenta_id')

Usuario     hasMany    Cuenta            (foreignKey: 'usuario_id')
Cuenta      belongsTo  Usuario           (foreignKey: 'usuario_id')

Cuenta      hasMany    Transaccion (as: TransaccionesOrigen,   foreignKey: 'cuenta_origen_id')
Cuenta      hasMany    Transaccion (as: TransaccionesDestino,  foreignKey: 'cuenta_destino_id')
Transaccion belongsTo  Cuenta      (as: CuentaOrigen,          foreignKey: 'cuenta_origen_id')
Transaccion belongsTo  Cuenta      (as: CuentaDestino,         foreignKey: 'cuenta_destino_id')

TipoTransaccion hasMany    Transaccion   (foreignKey: 'tipo_transaccion_id')
Transaccion     belongsTo  TipoTransaccion (foreignKey: 'tipo_transaccion_id')

Cuenta      hasMany    Tarjeta           (foreignKey: 'cuenta_id')
Tarjeta     belongsTo  Cuenta            (foreignKey: 'cuenta_id')

Usuario     hasMany    Prestamo          (foreignKey: 'usuario_id')
Prestamo    belongsTo  Usuario           (foreignKey: 'usuario_id')

Cuenta      hasMany    Prestamo          (as: PrestamosDesembolso, foreignKey: 'cuenta_desembolso_id')
Prestamo    belongsTo  Cuenta            (as: CuentaDesembolso,    foreignKey: 'cuenta_desembolso_id')

Prestamo    hasMany    CuotaPrestamo     (foreignKey: 'prestamo_id')
CuotaPrestamo belongsTo Prestamo        (foreignKey: 'prestamo_id')

Usuario     hasMany    Beneficiario      (foreignKey: 'usuario_id')
Beneficiario belongsTo Usuario          (foreignKey: 'usuario_id')
```

---

## 7. REGLAS DE CÓDIGO OBLIGATORIAS

### Modelos Sequelize
- Usar `Model.init()` con la clase extendida, NO el formato de función legacy.
- Siempre incluir `underscored: true` en las opciones del modelo (convierte camelCase a snake_case automáticamente).
- Siempre incluir `timestamps: true` en las opciones.
- Siempre incluir `tableName` explícitamente para evitar pluralización incorrecta.
- Todas las asociaciones deben definirse en el método estático `associate(models)` dentro del mismo archivo de modelo.
- Documentar cada modelo con un comentario JSDoc breve al inicio.

### Migraciones Sequelize
- Cada migración debe tener `up` (crear tabla) y `down` (eliminar tabla con `dropTable`).
- El orden de los timestamps en el nombre del archivo debe respetar dependencias FK (tablas padre primero).
- Usar `queryInterface.createTable` con charset `utf8mb4` y collate `utf8mb4_unicode_ci`.
- Los campos ENUM deben declararse como `DataTypes.ENUM(...)` tanto en modelo como en migración.
- Las FK en migraciones deben incluir `references`, `onUpdate` y `onDelete`.

### Archivos de configuración
- `config/config.js` exporta un objeto con `development`, `test`, `production`.
- `database.js` crea la instancia Sequelize, prueba la conexión con `.authenticate()` y exporta la instancia.
- `.sequelizerc` apunta a `config/config.js`, `models/`, `migrations/`.
- `.env` contiene las credenciales reales; `.env.example` contiene las mismas variables con valores vacíos o de ejemplo.

### package.json
```json
{
  "name": "pratica_bancario",
  "version": "1.0.0",
  "description": "Backend bancario - Modelos y Migraciones Sequelize",
  "main": "database.js",
  "scripts": {
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo:all",
    "db:reset": "npm run migrate:undo && npm run migrate"
  },
  "dependencies": {
    "sequelize": "^6.37.3",
    "mysql2": "^3.9.7",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "sequelize-cli": "^6.6.2"
  }
}
```

---

## 8. ARCHIVOS DE CONFIGURACIÓN EXACTOS

### `.env`
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=banco
DB_USER=root
DB_PASSWORD=1234
DB_DIALECT=mysql
```

### `.env.example`
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nombre_de_tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DIALECT=mysql
```

### `.gitignore`
```
node_modules/
.env
*.log
```

### `.sequelizerc`
```js
const path = require('path');
module.exports = {
  'config':          path.resolve('config', 'config.js'),
  'models-path':     path.resolve('models'),
  'migrations-path': path.resolve('migrations'),
};
```

---

## 9. RESTRICCIONES ABSOLUTAS — QUÉ NO GENERAR

Esta es la **Fase 1** del proyecto. Las siguientes capas se desarrollan en fases posteriores y **NO deben generarse**:

| ❌ NO generar | Razón |
|---|---|
| Controladores (`controllers/`) | Fase posterior |
| Rutas (`routes/`) | Fase posterior |
| Middleware de autenticación | Fase posterior |
| Servidor Express (`app.js` / `server.js`) | Fase posterior |
| Endpoints HTTP | Fase posterior |
| Validaciones de negocio complejas | Fase posterior |
| Seeders | No requerido en esta práctica |
| Frontend (React/Vite/TS) | Proyecto separado: `pratica_backend_bancario` |

El único punto de entrada ejecutable en esta fase es `database.js` (prueba de conexión).

---

## 10. CRITERIO DE ÉXITO

El proyecto se considera **completamente exitoso** cuando:
1. `npm install` instala todas las dependencias sin errores.
2. `npx sequelize-cli db:migrate` ejecuta las 11 migraciones en orden sin errores.
3. La base de datos `banco` contiene las 11 tablas con sus columnas, tipos, índices y FK correctos.
4. No existe ningún archivo de controlador, ruta ni servidor.

---

## 11. CONTEXTO ACADÉMICO

- Institución: Proyecto académico universitario
- Curso: Desarrollo Backend con Node.js
- Herramienta de IA permitida: Sí, con uso estratégico documentado
- Evaluación final: Capturas de pantalla de migraciones ejecutadas + código fuente + documento de diseño