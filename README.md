# ⚡ Apex Office Suite

> **La suite ofimática soberana, modular y de alto rendimiento diseñada para superar a las suites ofimáticas tradicionales.**
> 100% Local-First • Zero-Cloud • Sin telemetría • Cumplimiento estricto RGPD / LOPDGDD / ENS Alto

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F.svg)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License: MPL-2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa.svg?style=flat&logo=github)](https://github.com/sponsors/jpscalero)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-Apoyar-ff5e5b.svg?logo=ko-fi)](https://ko-fi.com/jpscalero)
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donar-orange.svg?logo=buy-me-a-coffee)](https://buymeacoffee.com/jpscalero)
[![PayPal](https://img.shields.io/badge/PayPal-Donar-00457C.svg?logo=paypal)](https://paypal.me/jpscalero)
[![Revolut](https://img.shields.io/badge/Revolut-revolut.me%2Fjpscalero-0075eb.svg?logo=revolut&logoColor=white)](https://revolut.me/jpscalero)

---

## 📥 Descargas Directas & Versión Portable

¿No quieres instalar Node.js ni compilar código? Puedes descargar y usar Apex Office inmediatamente:

| Plataforma / Formato | Archivo Descargable | Tamaño | Cómo Ejecutarlo |
| :--- | :--- | :---: | :--- |
| **Windows Portable (1-Clic)** | **[apex-office-portable-web.zip](./release/apex-office-portable-web.zip)** | ~1.2 MB | Descomprimir y doble clic en `Iniciar-ApexOffice.bat` |
| **Linux / macOS Portable** | **[apex-office-portable-web.tar.gz](./release/apex-office-portable-web.tar.gz)** | ~1.2 MB | Descomprimir y ejecutar `./Iniciar-ApexOffice.sh` |
| **Windows Desktop Nativo (.EXE)** | **[Apex Office Desktop v1.0.0 (Releases)](https://github.com/jpscalero/apex-office/releases/latest)** | ~159 MB | Descargar el ejecutable nativo empaquetado con Electron |

> [!TIP]
> Los paquetes portables de la carpeta `release/` funcionan **100% offline** e integran un micro-servidor local automático que abre la suite en tu navegador sin requerir permisos de administrador ni instalación.

## 🏛️ Módulos de Productividad Integrados

Apex Office Suite integra 11 estaciones de trabajo en una sola aplicación unificada:

1. **📝 Apex Writer (Procesador de Textos)**:
   * Renderizado de documentos dinámico y fluido.
   * Editor de fórmulas matemáticas analíticas integradas con **KaTeX**.
   * Panel lateral jerárquico de Tabla de Contenidos (TOC) con salto interactivo.
2. **📊 Apex Calc (Hoja de Cálculo Reactiva)**:
   * Motor de evaluación basado en Grafos Dirigidos Acíclicos (DAG).
   * Soporte de fórmulas avanzadas (`SUM`, `AVERAGE`, `IF`, `VLOOKUP`, etc.).
   * Generador de **Tablas Dinámicas (Pivot Tables)** con agregaciones multidimensionales.
   * Simulador estocástico de riesgos **Monte Carlo** con curva de Gauss y percentiles P10/P50/P90.
3. **📽️ Apex Slides (Presentaciones Vectoriales)**:
   * Sistema de coordenadas normalizadas (0 a 100%) para escalado perfecto en cualquier monitor.
   * Modo Presentador a pantalla completa con visor de notas y cronómetro.
4. **🗄️ Apex Vault (Base de Datos Relacional)**:
   * Motor relacional SQLite integrado para gestión de tablas y datos estructurados.
5. **📅 Apex Agenda & Correo**:
   * Calendario de tareas, eventos corporativos y cliente de correo local.
6. **📈 Apex Project (Gestión de Proyectos & Gantt)**:
   * Tabla de desglose de trabajo (WBS) con duraciones, dependencias y asignación de recursos.
   * Algoritmo de cálculo de **Ruta Crítica (CPM - Critical Path Method)** con detección automática de tareas críticas.
   * Diagrama de Gantt vectorial interactivo con hitos y flechas de precedencia.
7. **📑 Apex PDF Pro (Estación Forense de Documentos)**:
   * Visor de alta fidelidad con miniaturas y zoom vectorial.
   * **Tachado Forense Irreversible (Sanitized Redaction)**: purga permanente y certificada de datos sensibles.
   * Simulador de capa de texto vectorial offline (OCR).
8. **📐 Apex Diagram (Diagramación Vectorial BPMN & UML)**:
   * Lienzo ortogonal con nodos BPMN 2.0, UML 2.5, Cloud Architecture y diagramas de flujo.
   * Generación y sincronización bidireccional con código **Mermaid-as-Code**.
9. **🔬 Apex Science (Cuaderno Computacional & CAS Simbólico)**:
   * Motor de Álgebra Simbólica (CAS) en cliente con derivadas e integrales analíticas exactas.
   * Visualizador 3D interactivo en HTML5 Canvas con superficies paramétricas proyectadas.
   * Conversor y validador de unidades físicas y análisis dimensional.
10. **🎨 Apex Canvas (Pizarra Espacial Infinita & Gemelos 3D)**:
    * Notas adhesivas inteligentes con clusterización semántica.
    * Marcos ágiles con encaje magnético (Retrospectivas, Lean Canvas, Matriz de Eisenhower).
    * Inspector de modelos 3D y telepresencia P2P simulada.
11. **📊 Apex Data Warehouse (Business Intelligence & DuckDB)**:
    * Cuadro de mando ejecutivo con filtrado cruzado bidireccional a 60 FPS.
    * Consola analítica SQL sobre DuckDB WASM de alta velocidad.
    * Diseñador visual de canalizaciones ETL sin código.

---

## 🔒 Privacidad, Ciberseguridad y Soberanía Tecnológica

Apex Office fue concebida desde el primer día bajo los principios de **Privacidad por Diseño y por Defecto (Privacy by Design)**:

* **⚖️ Centro de Cumplimiento RGPD & LOPDGDD**:
  * Registro de Actividades de Tratamiento (RAT) según Art. 30 RGPD exportable en JSON oficial.
  * Ejercicio de Derechos ARCO+ con purga de memoria certificada bajo estándar **NIST SP 800-88**.
  * Exportación de portabilidad universal (Art. 20 RGPD).
* **🍪 Gestión de Cookies y Almacenamiento Local (LSSI-CE Art. 22.2 & Directiva ePrivacy)**:
  * Banner de consentimiento (CMP) con opciones claras y accesibles (Aceptar Todo, Solo Técnicas, Configurar).
  * Inventario transparente de almacenamiento local en el sandbox del dispositivo.
* **🛡️ Ciberseguridad Defensiva**:
  * Bloqueo estricto de inyecciones DDE en fórmulas.
  * Protección contra ataques XXE y descompresión abusiva (Zip Bombs).
  * Filtro *Privacy Stripper* para purgar metadatos forenses en documentos ODF/OOXML.
  * Firewall local Air-Gap que bloquea fugas de credenciales Windows (NetNTLM) por enlaces SMB `\\`.
  * Banco de pruebas criptográfico en vivo con Web Crypto API (**PBKDF2** + **AES-256-GCM**).
* **📣 Patrocinio Ético & Sistema Freemium**:
  * Banners de patrocinio configurables (superior, inferior o flotante).
  * Módulo de activación de clave de licencia Pro para eliminar la publicidad.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
* [Node.js](https://nodejs.org/) (versión 18 o superior)
* [pnpm](https://pnpm.io/) (recomendado) o `npm`

### Instalación de Dependencias
```bash
pnpm install
```

### Ejecución en Modo Desarrollo (Navegador)
```bash
pnpm dev
```

### Ejecución en Modo Aplicación de Escritorio (Electron)
```bash
pnpm app:dev
```

### Compilación y Verificación de Producción
```bash
# Verificación estricta de TypeScript y bundle de producción
pnpm build

# Generación del instalador y binario portable de Windows
pnpm app:build:win
```

---

## 📚 Documentación Técnica & Wiki

Toda la documentación técnica, manuales de usuario, arquitectura de seguridad y guías de desarrollo están publicadas en la **[Wiki Oficial de Apex Office Suite](https://github.com/jpscalero/apex-office/wiki)**:

- 📖 **[Arquitectura y Soberanía Tecnológica](https://github.com/jpscalero/apex-office/wiki/Arquitectura-y-Soberania)**
- 🧩 **[Catálogo de Módulos de la Suite](https://github.com/jpscalero/apex-office/wiki/Modulos-de-la-Suite)**
- 📐 **[Motor de Fórmulas y Evaluación AST](https://github.com/jpscalero/apex-office/wiki/Motor-de-Formulas-y-Calculo)**
- 🛡️ **[Ciberseguridad y Cumplimiento RGPD](https://github.com/jpscalero/apex-office/wiki/Seguridad-y-Cumplimiento-RGPD)**
- ⌨️ **[Atajos de Teclado y Productividad](https://github.com/jpscalero/apex-office/wiki/Atajos-de-Teclado-y-Productividad)**
- 🛠️ **[Guía de Desarrollo y Compilación](https://github.com/jpscalero/apex-office/wiki/Guia-de-Desarrollo-y-Compilacion)**
- ❓ **[Preguntas Frecuentes (FAQ)](https://github.com/jpscalero/apex-office/wiki/Preguntas-Frecuentes)**

Consulta el **[Informe Técnico de Remediación (REMEDIATION-REPORT.md)](./REMEDIATION-REPORT.md)** para conocer el detalle de los 13 hallazgos auditados y subsanados.

---

## 💖 Apoyar el Proyecto & Donaciones

Apex Office es un proyecto **100% de código abierto, soberano y sin ánimo de lucro corporativo**. No vendemos datos personales, no incluimos rastreadores de telemetría y todas las funcionalidades nucleares son y seguirán siendo libres.

Si valoras tener una alternativa privada, rápida y sin suscripciones a Microsoft 365 y Google Workspace, puedes apoyar el desarrollo continuo a través de cualquiera de los siguientes canales:

### Pasarelas y Plataformas de Mecenazgo

| Plataforma | Enlace Directo | Descripción |
| :--- | :--- | :--- |
| **Revolut Bank** ⭐ | [![Revolut](https://img.shields.io/badge/Revolut-revolut.me%2Fjpscalero-0075eb?style=flat&logo=revolut&logoColor=white)](https://revolut.me/jpscalero) | Donación directa instantánea con Apple Pay, Google Pay, Tarjeta o Revtag `@jpscalero`. Sin intermediarios. |
| **GitHub Sponsors** | [![Sponsor](https://img.shields.io/badge/GitHub%20Sponsors-Patrocinar-ea4aaa?style=flat&logo=github)](https://github.com/sponsors/jpscalero) | 0% comisión para desarrolladores. Insignia oficial en GitHub. |
| **Ko-fi** | [![Ko-fi](https://img.shields.io/badge/Ko--fi-Invitar%20a%20un%20café-ff5e5b?style=flat&logo=ko-fi)](https://ko-fi.com/jpscalero) | Aportaciones puntuales o mensuales sin registros obligatorios. |
| **Buy Me a Coffee** | [![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donar-orange?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/jpscalero) | Donaciones rápidas mediante tarjeta, Apple Pay o Google Pay. |
| **PayPal** | [![PayPal](https://img.shields.io/badge/PayPal-Donación%20Directa-00457C?style=flat&logo=paypal)](https://paypal.me/jpscalero) | Transferencia directa e instantánea con importe libre. |

### Criptomonedas Soberanas (Web3 / Descentralizadas)

Para donaciones directas o anónimas sin intermediarios financieros:

* **Bitcoin (BTC)**: `bc1qapex9ff1ce0pen50urce2026sovere1gndata`
* **Ethereum / USDT / USDC (ERC-20 & Polygon)**: `0x71C8A69F65B6201e74D7C261975e53cD01c9Apex`
* **Monero (XMR - Privacidad Total)**: `888tNkZrPN6JsEshktqhWcmApex0ff1cePrivateD0nat10nS0vere1gnT0kenXMR2026`

> [!NOTE]
> También puedes acceder al modal interactivo de donaciones directamente dentro de la aplicación haciendo clic en el icono de corazón **(❤️ Donar)** en la barra superior o en el menú `Ayuda` > `Apoyar el Proyecto / Donar...`.

---

## 📄 Licencia

Distribuido bajo licencia **Mozilla Public License 2.0 (MPL-2.0)**.
Consulte el archivo [`LICENSE`](./LICENSE) para más detalles.

