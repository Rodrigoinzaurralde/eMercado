const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'emercado_secret_key_2024';

//Middleware
app.use(cors());
app.use(express.json());

//Función para leer archivos JSON
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

//Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    const token = req.headers['access-token'];
    
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    try {
        const decodificado = jwt.verify(token, JWT_SECRET);
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};

//Endpoint de autenticación
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    //Validar entrada
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }
    
    //Credenciales
    const usuarioValido = 'grupo314';
    const contrasenaValida = 'jap';
    
    if (username === usuarioValido && password === contrasenaValida) {
        //Generar token JWT
        const token = jwt.sign(
            { 
                usuario: username,
                idUsuario: 314
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            exito: true,
            mensaje: 'Autenticación exitosa',
            token: token,
            usuario: {
                nombre: username,
                id: 314
            }
        });
    } else {
        return res.status(401).json({ error: 'Usuario o contraseña incorrecto' });
    }
});

//Endpoint para verificar token
app.get('/verify-token', verificarToken, (req, res) => {
    res.json({
        exito: true,
        mensaje: 'Token válido',
        usuario: req.usuario
    });
});

//Obtener todas las categorías
app.get('/cats/cat.json', verificarToken, (req, res) => {
    const categories = readJSONFile('cats/cat.json');
    if (categories) {
        res.json(categories);
    } else {
        res.status(404).json({ error: 'Categorías no encontradas' });
    }
});

//Obtener productos de una categoría
app.get('/cats_products/:id.json', verificarToken, (req, res) => {
    const categoryId = req.params.id;
    const products = readJSONFile(`cats_products/${categoryId}.json`);
    if (products) {
        res.json(products);
    } else {
        res.status(404).json({ error: `Productos de categoría ${categoryId} no encontrados` });
    }
});

//Obtener información detallada de un producto
app.get('/products/:id.json', verificarToken, (req, res) => {
    const productId = req.params.id;
    const product = readJSONFile(`products/${productId}.json`);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: `Producto ${productId} no encontrado` });
    }
});

//Obtener comentarios de un producto
app.get('/products_comments/:id.json', verificarToken, (req, res) => {
    const productId = req.params.id;
    const comments = readJSONFile(`products_comments/${productId}.json`);
    if (comments) {
        res.json(comments);
    } else {
        res.status(404).json({ error: `Comentarios del producto ${productId} no encontrados` });
    }
});

//Obtener carrito de un usuario
app.get('/user_cart/:id.json', verificarToken, (req, res) => {
    const userId = req.params.id;
    const cart = readJSONFile(`user_cart/${userId}.json`);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).json({ error: `Carrito del usuario ${userId} no encontrado` });
    }
});

//Respuesta de compra exitosa
app.get('/cart/buy.json', verificarToken, (req, res) => {
    const buyResponse = readJSONFile('cart/buy.json');
    if (buyResponse) {
        res.json(buyResponse);
    } else {
        res.status(404).json({ error: 'Respuesta de compra no encontrada' });
    }
});

//Procesar compra
app.post('/cart/buy.json', verificarToken, (req, res) => {
    const buyResponse = readJSONFile('cart/buy.json');
    if (buyResponse) {
        res.json(buyResponse);
    } else {
        res.status(500).json({ error: 'Error procesando la compra' });
    }
});

//Respuesta de publicación exitosa
app.get('/sell/publish.json', verificarToken, (req, res) => {
    const publishResponse = readJSONFile('sell/publish.json');
    if (publishResponse) {
        res.json(publishResponse);
    } else {
        res.status(404).json({ error: 'Respuesta de publicación no encontrada' });
    }
});

//Procesar publicación de producto
app.post('/sell/publish.json', verificarToken, (req, res) => {
    const publishResponse = readJSONFile('sell/publish.json');
    if (publishResponse) {
        res.json(publishResponse);
    } else {
        res.status(500).json({ error: 'Error procesando la publicación' });
    }
});

//Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'Servidor eMercado funcionando correctamente',
        endpoints: [
            'POST /login',
            'GET /verify-token',
            'GET /cats/cat.json',
            'GET /cats_products/:id.json',
            'GET /products/:id.json', 
            'GET /products_comments/:id.json',
            'GET /user_cart/:id.json',
            'GET /cart/buy.json',
            'POST /cart/buy.json',
            'GET /sell/publish.json',
            'POST /sell/publish.json'
        ],
        authentication: {
            loginEndpoint: 'POST /login',
            requiredFields: ['username', 'password'],
            credenciales: {
                usuario: 'grupo314',
                contraseña: 'jap'
            },
            protected: 'Todos los endpoints del eCommerce requieren header access-token con JWT válido'
        }
    });
});

// Inicio el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Endpoints disponibles:');
    console.log('- POST /login');
    console.log('- GET /verify-token');
    console.log('- GET /cats/cat.json');
    console.log('- GET /cats_products/:id.json');
    console.log('- GET /products/:id.json');
    console.log('- GET /products_comments/:id.json');
    console.log('- GET /user_cart/:id.json');
    console.log('- GET /cart/buy.json');
    console.log('- POST /cart/buy.json');
    console.log('- GET /sell/publish.json');
    console.log('- POST /sell/publish.json');
    console.log('\nMiddleware de autorización:');
    console.log('- Se requiere header: access-token: <token>');
    console.log('\nCredenciales de autenticación:');
    console.log('- Usuario: grupo314');
    console.log('- Contraseña: jap');
    console.log('- Endpoint: POST /login');
});

module.exports = app;
