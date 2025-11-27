# eMercado Backend

Backend en Node.js y Express.js para el proyecto eMercado.

## 🚀 Inicio Rápido

### Opción 1: Script de inicio (Recomendado)
```bash
./start.sh
```

### Opción 2: Comandos manuales
```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## ✅ Verificar que todo funciona

1. **Inicia el backend**: `./start.sh`
2. **Abre el frontend**: Abre `eMercado/index.html` en tu navegador
3. **Verifica la conexión**: Las categorías deberían cargar desde tu servidor local

### Pruebas manuales de endpoints

```bash
# Probar categorías
curl http://localhost:3001/cats/cat.json

# Probar productos de autos
curl http://localhost:3001/cats_products/101.json

# Probar producto específico
curl http://localhost:3001/products/50921.json

# Probar comentarios
curl http://localhost:3001/products_comments/50921.json
```

## Endpoints disponibles

- `GET /cats/cat.json` - Obtener todas las categorías
- `GET /cats_products/:id.json` - Obtener productos de una categoría específica
- `GET /products/:id.json` - Obtener información detallada de un producto
- `GET /products_comments/:id.json` - Obtener comentarios de un producto
- `GET /user_cart/:id.json` - Obtener carrito de un usuario
- `GET /cart/buy.json` - Respuesta de compra exitosa
- `POST /cart/buy.json` - Procesar compra
- `GET /sell/publish.json` - Respuesta de publicación exitosa
- `POST /sell/publish.json` - Procesar publicación de producto

## Estructura de archivos

```
emercado-backend/
├── server.js          # Servidor principal
├── package.json       # Configuración del proyecto
└── data/              # Archivos JSON
    ├── cats/          # Categorías
    ├── cats_products/ # Productos por categoría  
    ├── products/      # Información detallada de productos
    ├── products_comments/ # Comentarios de productos
    ├── user_cart/     # Carritos de usuario
    ├── cart/          # Respuestas de compra
    └── sell/          # Respuestas de publicación
```

## Configuración del Frontend

El archivo `eMercado/js/init.js` ya ha sido modificado para apuntar al servidor local (`http://localhost:3001`).

## Ejemplos de uso

```bash
# Obtener categorías
curl http://localhost:3001/cats/cat.json

# Obtener productos de autos (categoría 101)
curl http://localhost:3001/cats_products/101.json

# Obtener información del producto 50921
curl http://localhost:3001/products/50921.json

# Obtener comentarios del producto 50921
curl http://localhost:3001/products_comments/50921.json
```
