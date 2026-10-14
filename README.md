# ⚡ Apex Office Suite

> **La suite ofimática soberana, modular y de alto rendimiento diseñada para superar a las suites ofimáticas tradicionales.**
> 100% Local-First • Zero-Cloud • Sin telemetría • Cumplimiento estricto RGPD / LOPDGDD / ENS Alto

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F.svg)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License: MPL-2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

---

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

## 📄 Licencia

Distribuido bajo licencia **Mozilla Public License 2.0 (MPL-2.0)**.
Consulte el archivo [`LICENSE`](./LICENSE) para más detalles.

