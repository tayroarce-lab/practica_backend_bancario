# OldMoney Bank — Libro de Marca

## 1. IDENTIDAD DE MARCA

**Nombre:** OldMoney Bank  
**Tagline:** *"Tu patrimonio, en las mejores manos."*  
**Personalidad:** Sofisticado · Seguro · Moderno · Confiable  
**Tono visual:** Banca premium de alto patrimonio — oscuro, elegante, con detalles dorados.  
**Stack Frontend:** React + TypeScript + Vite

---

## 2. PALETA DE COLORES

### Colores Primarios

| Nombre | Token | Hex | Uso principal |
|---|---|---|---|
| Navy Deep | `--color-primary-900` | `#0A1628` | Fondo principal (dark mode) |
| Navy Dark | `--color-primary-800` | `#112240` | Sidebars, headers, cards dark |
| Navy Mid | `--color-primary-700` | `#1A3A5C` | Hover states, bordes activos |
| Navy Base | `--color-primary-600` | `#1E4D8C` | Botones primarios activos |
| Navy Light | `--color-primary-500` | `#2563B0` | Links, íconos interactivos |

### Colores de Acento (Dorado)

| Nombre | Token | Hex | Uso principal |
|---|---|---|---|
| Gold Deep | `--color-accent-900` | `#7C5A0A` | Texto dorado sobre fondo claro |
| Gold Dark | `--color-accent-700` | `#A8820D` | Hover en elementos dorados |
| Gold Base | `--color-accent-500` | `#C9A84C` | Acento principal, badges premium |
| Gold Light | `--color-accent-300` | `#E4C97A` | Bordes, separadores dorados |
| Gold Pale | `--color-accent-100` | `#FAF0D7` | Fondos de highlight suaves |

### Colores de Fondo

| Nombre | Token | Hex | Uso principal |
|---|---|---|---|
| Background Dark | `--color-bg-dark` | `#0A1628` | Fondo general dark mode |
| Background Surface | `--color-bg-surface` | `#112240` | Cards y paneles en dark mode |
| Background Subtle | `--color-bg-subtle` | `#1A2E4A` | Hover en listas, filas de tabla |
| Background Light | `--color-bg-light` | `#F4F7FB` | Fondo general light mode |
| Background White | `--color-bg-white` | `#FFFFFF` | Cards en light mode |
| Background Muted | `--color-bg-muted` | `#EEF2F7` | Inputs deshabilitados, fondos neutros |

### Colores de Texto

| Nombre | Token | Hex | Uso principal |
|---|---|---|---|
| Text Primary | `--color-text-primary` | `#0A1628` | Texto principal en light mode |
| Text Secondary | `--color-text-secondary` | `#3D5470` | Subtítulos, etiquetas |
| Text Muted | `--color-text-muted` | `#7A92AB` | Placeholders, texto deshabilitado |
| Text Inverse | `--color-text-inverse` | `#FFFFFF` | Texto sobre fondos oscuros |
| Text Gold | `--color-text-gold` | `#C9A84C` | Destacados, montos importantes |

### Colores de Estado / Alertas

| Nombre | Token | Hex | Uso principal |
|---|---|---|---|
| **Success Dark** | `--color-success-700` | `#0B6E4F` | Texto de éxito |
| **Success Base** | `--color-success-500` | `#12B76A` | Íconos, badges, bordes de éxito |
| **Success Light** | `--color-success-100` | `#D1FAE5` | Fondo de alertas de éxito |
| **Warning Dark** | `--color-warning-700` | `#92530A` | Texto de advertencia |
| **Warning Base** | `--color-warning-500` | `#F79009` | Íconos, badges de advertencia |
| **Warning Light** | `--color-warning-100` | `#FEF0C7` | Fondo de alertas de advertencia |
| **Error Dark** | `--color-error-700` | `#9B1C1C` | Texto de error |
| **Error Base** | `--color-error-500` | `#F04438` | Íconos, badges, bordes de error |
| **Error Light** | `--color-error-100` | `#FEE2E2` | Fondo de alertas de error |
| **Info Dark** | `--color-info-700` | `#0B4F8A` | Texto informativo |
| **Info Base** | `--color-info-500` | `#0EA5E9` | Íconos, badges informativos |
| **Info Light** | `--color-info-100` | `#E0F2FE` | Fondo de alertas informativas |

### Colores Financieros Específicos

| Nombre | Token | Hex | Uso principal |
|---|---|---|---|
| Positive Amount | `--color-amount-positive` | `#12B76A` | Depósitos, ingresos, saldo positivo |
| Negative Amount | `--color-amount-negative` | `#F04438` | Retiros, gastos, saldo bajo |
| Neutral Amount | `--color-amount-neutral` | `#C9A84C` | Transferencias, montos neutros |
| Pending | `--color-status-pending` | `#F79009` | Préstamos pendientes, procesos en curso |
| Approved | `--color-status-approved` | `#12B76A` | Préstamos aprobados, cuenta activa |
| Rejected | `--color-status-rejected` | `#F04438` | Préstamos rechazados, cuenta bloqueada |
| Inactive | `--color-status-inactive` | `#7A92AB` | Cuentas inactivas, usuarios desactivados |

---

## 3. TIPOGRAFÍA

### Familias

```css
/* Headings y Display — Elegancia clásica bancaria */
font-family: 'Playfair Display', Georgia, serif;

/* Body, UI, Labels — Legibilidad moderna */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace — Números, cuentas, tokens, código */
font-family: 'JetBrains Mono', 'Courier New', monospace;
Importar en el proyecto:

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
Escala Tipográfica
Token	Familia	Tamaño	Peso	Line Height	Uso
--text-display	Playfair Display	48px	700	1.15	Hero, nombre del banco
--text-h1	Playfair Display	36px	700	1.2	Títulos de página
--text-h2	Playfair Display	28px	600	1.25	Títulos de sección
--text-h3	Inter	22px	600	1.3	Títulos de card
--text-h4	Inter	18px	600	1.35	Subtítulos
--text-body-lg	Inter	16px	400	1.6	Texto de párrafo largo
--text-body	Inter	14px	400	1.5	Texto general de UI
--text-body-sm	Inter	13px	400	1.5	Texto secundario, ayudas
--text-label	Inter	12px	500	1.4	Labels de formulario, badges
--text-caption	Inter	11px	400	1.4	Timestamps, notas al pie
--text-amount-lg	JetBrains Mono	32px	500	1.2	Saldo principal
--text-amount	JetBrains Mono	18px	500	1.3	Montos en transacciones
--text-amount-sm	JetBrains Mono	14px	400	1.3	Montos secundarios
--text-account-num	JetBrains Mono	13px	400	1.4	Números de cuenta
4. ESPACIADO
Sistema basado en múltiplos de 4px.

Token	Valor	Uso típico
--space-1	4px	Espacio mínimo, gaps internos
--space-2	8px	Padding de badges, íconos
--space-3	12px	Padding de inputs compactos
--space-4	16px	Padding base de componentes
--space-5	20px	Separación entre elementos de form
--space-6	24px	Padding de cards
--space-8	32px	Separación entre secciones
--space-10	40px	Padding de páginas (mobile)
--space-12	48px	Separación entre bloques mayores
--space-16	64px	Padding de páginas (desktop)
5. BORDES Y RADIOS
Token	Valor	Uso
--radius-sm	4px	Badges, chips, tooltips
--radius-md	8px	Inputs, botones, alerts
--radius-lg	12px	Cards, panels, modales
--radius-xl	16px	Cards de saldo, drawer
--radius-2xl	24px	Cards hero, saldo principal
--radius-full	9999px	Avatares, pills, toggles
Token	Valor	Uso
--border-subtle	1px solid rgba(201,168,76,0.15)	Bordes de cards en dark mode
--border-default	1px solid #D4DCE8	Bordes de inputs en light mode
--border-strong	1px solid #7A92AB	Bordes activos / focus
--border-gold	1px solid #C9A84C	Bordes de elementos premium
6. SOMBRAS
Token	Valor CSS	Uso
--shadow-sm	0 1px 3px rgba(10,22,40,0.12)	Cards sutiles
--shadow-md	0 4px 12px rgba(10,22,40,0.15)	Cards flotantes, dropdowns
--shadow-lg	0 8px 24px rgba(10,22,40,0.20)	Modales, drawers
--shadow-xl	0 16px 40px rgba(10,22,40,0.25)	Alertas críticas, overlays
--shadow-gold	0 4px 16px rgba(201,168,76,0.25)	Botón primario, elementos CTA
7. COMPONENTES — ESPECIFICACIONES DE COLOR
Botones
Variante	Background	Texto	Border	Hover
Primary	#C9A84C	#0A1628	ninguno	#A8820D + --shadow-gold
Secondary	transparent	#C9A84C	--border-gold	bg rgba(201,168,76,0.08)
Tertiary	transparent	#2563B0	ninguno	bg rgba(37,99,176,0.08)
Danger	#F04438	#FFFFFF	ninguno	#9B1C1C
Ghost	transparent	#7A92AB	ninguno	bg rgba(122,146,171,0.08)
Disabled	#EEF2F7	#7A92AB	ninguno	sin cambio
Inputs y Formularios
Estado normal:   bg #FFFFFF, border --border-default, text --color-text-primary
Estado focus:    border #C9A84C (dorado), ring rgba(201,168,76,0.20) 3px
Estado error:    border #F04438, ring rgba(240,68,56,0.15) 3px
Estado disabled: bg #EEF2F7, text --color-text-muted, cursor not-allowed
Alertas y Notificaciones
Éxito:       bg #D1FAE5, border-left 4px solid #12B76A, text #0B6E4F
Error:       bg #FEE2E2, border-left 4px solid #F04438, text #9B1C1C
Advertencia: bg #FEF0C7, border-left 4px solid #F79009, text #92530A
Info:        bg #E0F2FE, border-left 4px solid #0EA5E9, text #0B4F8A
Badges de Estado (para préstamos y cuentas)
pendiente:  bg #FEF0C7, text #92530A
aprobado:   bg #D1FAE5, text #0B6E4F
rechazado:  bg #FEE2E2, text #9B1C1C
pagado:     bg #EEF2F7, text #3D5470
activa:     bg #D1FAE5, text #0B6E4F
inactiva:   bg #EEF2F7, text #7A92AB
bloqueada:  bg #FEE2E2, text #9B1C1C
Tabla de Transacciones
Fila normal:      bg transparente
Fila hover:       bg --color-bg-subtle
Monto depósito:   text #12B76A, font JetBrains Mono, prefijo "+"
Monto retiro:     text #F04438, font JetBrains Mono, prefijo "-"
Monto transf.:    text #C9A84C, font JetBrains Mono, prefijo "↔"
Número de cuenta: text #7A92AB, font JetBrains Mono, size 13px
8. MODO OSCURO (Dark Mode — Default)
El modo oscuro es el modo principal de la aplicación.

:root {
  --app-bg:        #0A1628;
  --surface:       #112240;
  --surface-hover: #1A2E4A;
  --border:        rgba(201, 168, 76, 0.15);
  --text-primary:  #F4F7FB;
  --text-secondary:#A8C0D6;
  --text-muted:    #5C7A96;
}
El modo claro es opcional y secundario. Si se implementa, usar los tokens
--color-bg-light, --color-bg-white y --color-text-primary: #0A1628.

9. ICONOGRAFÍA
Librería recomendada: Lucide React

npm install lucide-react
Entidad	Ícono sugerido
Cuenta / Wallet	Wallet
Transferencia	ArrowLeftRight
Depósito	ArrowDownCircle
Retiro	ArrowUpCircle
Préstamo	Landmark
Usuario	UserCircle
Seguridad / Auth	ShieldCheck
Alerta	AlertTriangle
Éxito	CheckCircle2
Error	XCircle
Configuración	Settings2
Cerrar sesión	LogOut
Dashboard	LayoutDashboard
Historial	History
Tarjeta de crédito	CreditCard
Candado / Bloqueo	Lock
Tamaños estándar:

Contexto	Tamaño
Ícono en botón	16px
Ícono standalone	20px
Ícono en card	24px
Ícono hero / ilustración	48px
Color de ícono: Por defecto currentColor — hereda el color del texto del contenedor.

10. CSS CUSTOM PROPERTIES — ARCHIVO COMPLETO
Implementar en src/styles/tokens.css e importar en main.tsx:

:root {
  /* Primarios */
  --color-primary-900: #0A1628;
  --color-primary-800: #112240;
  --color-primary-700: #1A3A5C;
  --color-primary-600: #1E4D8C;
  --color-primary-500: #2563B0;

  /* Acento dorado */
  --color-accent-900:  #7C5A0A;
  --color-accent-700:  #A8820D;
  --color-accent-500:  #C9A84C;
  --color-accent-300:  #E4C97A;
  --color-accent-100:  #FAF0D7;

  /* Fondos */
  --color-bg-dark:    #0A1628;
  --color-bg-surface: #112240;
  --color-bg-subtle:  #1A2E4A;
  --color-bg-light:   #F4F7FB;
  --color-bg-white:   #FFFFFF;
  --color-bg-muted:   #EEF2F7;

  /* Texto */
  --color-text-primary:   #0A1628;
  --color-text-secondary: #3D5470;
  --color-text-muted:     #7A92AB;
  --color-text-inverse:   #FFFFFF;
  --color-text-gold:      #C9A84C;

  /* Estados */
  --color-success-700: #0B6E4F;
  --color-success-500: #12B76A;
  --color-success-100: #D1FAE5;

  --color-warning-700: #92530A;
  --color-warning-500: #F79009;
  --color-warning-100: #FEF0C7;

  --color-error-700:   #9B1C1C;
  --color-error-500:   #F04438;
  --color-error-100:   #FEE2E2;

  --color-info-700:    #0B4F8A;
  --color-info-500:    #0EA5E9;
  --color-info-100:    #E0F2FE;

  /* Financieros */
  --color-amount-positive: #12B76A;
  --color-amount-negative: #F04438;
  --color-amount-neutral:  #C9A84C;

  /* Tipografía */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Inter', -apple-system, sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  /* Espaciado */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radios */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm:   0 1px 3px rgba(10,22,40,0.12);
  --shadow-md:   0 4px 12px rgba(10,22,40,0.15);
  --shadow-lg:   0 8px 24px rgba(10,22,40,0.20);
  --shadow-xl:   0 16px 40px rgba(10,22,40,0.25);
  --shadow-gold: 0 4px 16px rgba(201,168,76,0.25);
}