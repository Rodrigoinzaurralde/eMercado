# eMercado

eMercado es una aplicación web para la compra y venta de productos, desarrollada como entrega académica. Permite a los usuarios navegar por categorías, ver productos, gestionar su carrito y publicar productos para la venta.

## Características

- **Login de usuario** con validación y persistencia en localStorage.
- **Navegación por categorías** y productos.
- **Carrito de compras** con gestión de productos.
- **Publicación de productos**.
- **Menú desplegable de usuario** con opción de cerrar sesión.
- **Diseño responsive** para una experiencia óptima en dispositivos móviles y escritorio.

## Estructura del proyecto

```
eMercado/
├── css/
│   ├── styles.css
│   ├── login.css
│   └── carProducts.css
├── js/
│   ├── init.js
│   └── ...otros scripts
├── index.html
├── login.html
├── categories.html
├── sell.html
└── ...otros archivos
```

## Instalación y uso

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Rodrigoinzaurralde/eMercado.git
   ```
2. Abre la carpeta en Visual Studio Code o tu editor favorito.
3. Abre `index.html` en tu navegador para comenzar a usar la aplicación.

## Notas técnicas

- El proyecto utiliza [Bootstrap](https://getbootstrap.com/) para estilos base.
- Los datos se obtienen de la [API pública de eMercado](https://japceibal.github.io/emercado-api/).
- El login y la sesión se gestionan con `localStorage`.
- El diseño es responsive, adaptándose a pantallas de menos de 991px y 400px.

## Autores

Iara Carballo
Julio Sosa
Lucas Velazquez
Tacuebé Pereira
Rodrigo Inzaurralde

---

Si tienes dudas o sugerencias, puedes abrir un issue en el repositorio.
