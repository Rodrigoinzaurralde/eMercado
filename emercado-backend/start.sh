#!/bin/bash

# Script para iniciar el servidor eMercado Backend
echo "🚀 Iniciando servidor eMercado Backend..."
echo "📁 Verificando estructura de archivos..."

# Verificar que estamos en el directorio correcto
if [ ! -f "server.js" ]; then
    echo "❌ Error: No se encuentra server.js. Ejecuta este script desde la carpeta emercado-backend"
    exit 1
fi

# Verificar que existen los archivos de datos
if [ ! -d "data" ]; then
    echo "❌ Error: No se encuentra la carpeta data con los archivos JSON"
    exit 1
fi

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Verificar que el puerto 3001 esté libre
if lsof -i :3001 > /dev/null 2>&1; then
    echo "⚠️  El puerto 3001 está en uso. Matando proceso anterior..."
    pkill -f "node server.js"
    sleep 2
fi

echo "Todo listo. Iniciando servidor en http://localhost:3001"
echo "Endpoints disponibles:"
echo "   - GET /cats/cat.json"
echo "   - GET /cats_products/{id}.json"
echo "   - GET /products/{id}.json"
echo "   - GET /products_comments/{id}.json"
echo "   - GET /user_cart/{id}.json"
echo "   - GET /cart/buy.json"
echo "   - POST /cart/buy.json"
echo "   - GET /sell/publish.json"
echo "   - POST /sell/publish.json"
echo ""
echo "🌐 Abre tu navegador en: http://localhost:3001"
echo "🔄 Para detener el servidor presiona Ctrl+C"
echo ""

# Iniciar el servidor
node server.js
