# eMercado - Aplicación de Comercio Electrónico 🛒

eMercado es una aplicación web para la compra y venta de productos, desarrollada como entrega académica. Permite a los usuarios navegar por categorías, ver productos, gestionar su carrito y publicar productos para la venta.

## Características

- **Login de usuario** con validación y persistencia.
- **Navegación por categorías** y productos.
- **Carrito de compras** con gestión de productos.
- **Publicación de productos**.
- **Menú desplegable de usuario** con opción de cerrar sesión.
- **Diseño responsive** para una experiencia óptima en dispositivos móviles y escritorio.

---

## 🛡️ Metodología de QA y Seguridad (Security by Design)

Este proyecto emplea un sistema híbrido de Ingeniería de Prompts (Copilot Pro) y Node.js para garantizar la seguridad (*Security by Design*) y el rendimiento del código JavaScript.

* **Estándar de Seguridad:** Las revisiones automáticas se basan en un prompt estructurado con las reglas del **OWASP Top 10** (2021) y el principio de Seguridad por Defecto.
* **Herramienta de Análisis:** Se utiliza el archivo **`TEST_PROMPT.md`** como coordinador de las reglas para la IA.
* **Automatización de Informes:** Los hallazgos se convierten automáticamente a un formato profesional de hoja de cálculo (.xlsx).

---

## Estructura del proyecto
```
eMercado/
├── css/
│   ├── styles.css
│   └── ...archivos CSS
├── js/
│   ├── init.js
│   └── ...otros scripts
├── TEST_PROMPT.md  <-- Archivo de reglas de seguridad para la IA
├── excel_converter.js <-- Script de automatización Node.js
└── index.html
```

---

## Instalación y uso

1.  Clona el repositorio:
    ```bash
    git clone [https://github.com/Rodrigoinzaurralde/eMercado.git](https://github.com/Rodrigoinzaurralde/eMercado.git)
    ```
2.  **Instala las dependencias de análisis** (requiere Node.js):
    ```bash
    npm install
    ```
3.  Abre `index.html` en tu navegador para comenzar a usar la aplicación.

## ⚙️ Comandos Operacionales

| Comando | Propósito |
| :--- | :--- |
| `npm run excel-review` | Ejecuta el script que transforma la tabla de revisión de Copilot (en `review_raw_output.md`) a un archivo **.xlsx** (Excel). |
| `npm install` | Instala las dependencias necesarias (`xlsx`, `dotenv`). |

---

## Notas técnicas

- El proyecto utiliza [Bootstrap](https://getbootstrap.com/) para estilos base.
- Los datos se obtienen de la [API de eMercado](https://japceibal.github.io/emercado-api/).
- **Control de Sesión:** El login y la sesión se gestionan con `localStorage`. Se realiza un análisis continuo para garantizar que **solo datos no sensibles** persistan en `localStorage`, como parte de la mitigación del riesgo A02 (Fallos Criptográficos) de OWASP.
- El diseño es responsive, adaptándose a pantallas de menos de 991px y 400px.

---

## Autores

- Iara Carballo -
- Julio Sosa -
- Lucas Velazquez -
- Tacuebé Pereira -
- Rodrigo Inzaurralde -

Si tienes dudas o sugerencias sobre el código o la metodología de QA, puedes abrir un issue en el repositorio.