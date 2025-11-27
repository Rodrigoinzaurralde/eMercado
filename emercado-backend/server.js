const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Función para leer archivos JSON
const readJSONFile = (filePath) => {
    try {
        const fullPath = path.join(__dirname, 'data', filePath);
        const data = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error leyendo archivo ${filePath}:`, error);
        return null;
    }
};

//Obtener todas las categorías
app.get('/cats/cat.json', (req, res) => {
    const categories = readJSONFile('cats/cat.json');
    if (categories) {
        res.json(categories);
    } else {
        res.status(404).json({ error: 'Categorías no encontradas' });
    }
});

//Obtener productos de una categoría
app.get('/cats_products/:id.json', (req, res) => {
    const categoryId = req.params.id;
    const products = readJSONFile(`cats_products/${categoryId}.json`);
    if (products) {
        res.json(products);
    } else {
        res.status(404).json({ error: `Productos de categoría ${categoryId} no encontrados` });
    }
});

//Obtener información detallada de un producto
app.get('/products/:id.json', (req, res) => {
    const productId = req.params.id;
    const product = readJSONFile(`products/${productId}.json`);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: `Producto ${productId} no encontrado` });
    }
});

//Obtener comentarios de un producto
app.get('/products_comments/:id.json', (req, res) => {
    const productId = req.params.id;
    const comments = readJSONFile(`products_comments/${productId}.json`);
    if (comments) {
        res.json(comments);
    } else {
        res.status(404).json({ error: `Comentarios del producto ${productId} no encontrados` });
    }
});

//Obtener carrito de un usuario
app.get('/user_cart/:id.json', (req, res) => {
    const userId = req.params.id;
    const cart = readJSONFile(`user_cart/${userId}.json`);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).json({ error: `Carrito del usuario ${userId} no encontrado` });
    }
});

//Respuesta de compra exitosa
app.get('/cart/buy.json', (req, res) => {
    const buyResponse = readJSONFile('cart/buy.json');
    if (buyResponse) {
        res.json(buyResponse);
    } else {
        res.status(404).json({ error: 'Respuesta de compra no encontrada' });
    }
});

//Procesar compra (mismo resultado que GET)
app.post('/cart/buy.json', (req, res) => {
    const buyResponse = readJSONFile('cart/buy.json');
    if (buyResponse) {
        res.json(buyResponse);
    } else {
        res.status(500).json({ error: 'Error procesando la compra' });
    }
});

//Respuesta de publicación exitosa
app.get('/sell/publish.json', (req, res) => {
    const publishResponse = readJSONFile('sell/publish.json');
    if (publishResponse) {
        res.json(publishResponse);
    } else {
        res.status(404).json({ error: 'Respuesta de publicación no encontrada' });
    }
});

//Procesar publicación de producto
app.post('/sell/publish.json', (req, res) => {
    const publishResponse = readJSONFile('sell/publish.json');
    if (publishResponse) {
        res.json(publishResponse);
    } else {
        res.status(500).json({ error: 'Error procesando la publicación' });
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'Servidor eMercado funcionando correctamente',
        endpoints: [
            'GET /cats/cat.json',
            'GET /cats_products/:id.json',
            'GET /products/:id.json', 
            'GET /products_comments/:id.json',
            'GET /user_cart/:id.json',
            'GET /cart/buy.json',
            'POST /cart/buy.json',
            'GET /sell/publish.json',
            'POST /sell/publish.json'
        ]
    });
});

// Inicio el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Endpoints disponibles:');
    console.log('- GET /cats/cat.json');
    console.log('- GET /cats_products/:id.json');
    console.log('- GET /products/:id.json');
    console.log('- GET /products_comments/:id.json');
    console.log('- GET /user_cart/:id.json');
    console.log('- GET /cart/buy.json');
    console.log('- POST /cart/buy.json');
    console.log('- GET /sell/publish.json');
    console.log('- POST /sell/publish.json');
});

module.exports = app;
