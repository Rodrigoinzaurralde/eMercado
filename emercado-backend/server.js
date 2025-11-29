const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'emercado',
    password: 'jap',
    database: 'emercado',
    connectionLimit: 5
});

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
    
    //Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        return res.status(400).json({ error: 'El formato de email no es válido' });
    }
    
    //Validar contraseña mínima de 8 caracteres
    if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }
    
    //Si los formatos son válidos, generar token automáticamente
    //Generar ID único basado en el email
    const userId = Math.abs(username.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0));
    
    const token = jwt.sign(
        { 
            usuario: username,
            idUsuario: userId
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
            id: userId
        }
    });
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
//Obtener usuarios
app.get("/user", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id_usuario, email, ciudad FROM usuarios"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});
// Obtener usuario por email
app.get("/user/:email", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id_usuario, email, ciudad FROM usuarios WHERE email = ?",
      [req.params.email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(rows[0]); // Retornar solo el primer resultado
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar usuario" });
  } finally {
    if (conn) conn.release();
  }
});
//Guardar usuario en base de datos
app.post('/user', async(req, res) => {
    let conn;
  try {

	conn = await pool.getConnection();

	const response = await conn.query(
        "INSERT INTO usuarios(email, ciudad) VALUE (?, ?)",
        [req.body.email, req.body.ciudad]
    );
	
    res.json({ id: parseInt(response.insertId), ...req.body });

  }catch(error){
    console.log(error);
    res.status(500).json({error : 'Problema enviando usuario'})
  }
   finally {
	if (conn) conn.release(); //release to pool
  }
});

//Obtener productos
app.get("/productos", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id_producto, name, description, precio, vendidos, id_categoria FROM productos"
    );

    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release();
  }
});

//Guardar productos en base de datos
app.post('/productos', async(req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const {id_producto, name, description, precio, vendidos, id_categoria} = req.body;
    
    if (!id_producto || !name || !description || !precio || !id_categoria) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos' 
      });
    }

    // Verificar si el producto ya existe
    const existe = await conn.query(
      "SELECT id_producto FROM productos WHERE id_producto = ?",
      [id_producto]
    );

    if (existe.length > 0) {
      return res.status(409).json({ 
        error: 'El producto ya existe en la base de datos' 
      });
    }

    // Insertar usando el id_producto original del JSON
    const response = await conn.query(
      "INSERT INTO productos(id_producto, name, description, precio, vendidos, id_categoria) VALUES (?, ?, ?, ?, ?, ?)",
      [id_producto, name, description, precio, vendidos, id_categoria]
    );
    
    res.json({
      id_producto: id_producto, // ← Retornar el ID original
      mensaje: 'Producto agregado a base de datos'
    });

  } catch(error) {
    console.log(error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({error: 'El producto ya existe'});
    } else {
      res.status(500).json({error: 'Error al agregar producto'});
    }
  } finally {
    if (conn) conn.release();
  }
});
//Guardar carrito en base de datos
app.post('/cart', async(req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const { cantidad, id_usuario, id_producto } = req.body;
    
    if (!cantidad || !id_usuario || !id_producto) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos' 
      });
    }

    // Verificar si el producto ya está en el carrito
    const existente = await conn.query(
      "SELECT id, cantidad FROM carrito WHERE id_usuario = ? AND id_producto = ?",
      [id_usuario, id_producto]
    );

    if (existente.length > 0) {
      // Actualizar cantidad
      const nuevaCantidad = existente[0].cantidad + cantidad;
      await conn.query(
        "UPDATE carrito SET cantidad = ? WHERE id = ?",
        [nuevaCantidad, existente[0].id]
      );
      
      res.json({ 
        id: existente[0].id,
        cantidad: nuevaCantidad,
        mensaje: 'Cantidad actualizada en el carrito'
      });
    } else {
      // Insertar nuevo
      const response = await conn.query(
        "INSERT INTO carrito(cantidad, id_usuario, id_producto) VALUES (?, ?, ?)",
        [cantidad, id_usuario, id_producto]
      );
      
      res.json({ 
        id: parseInt(response.insertId),
        mensaje: 'Producto agregado al carrito'
      });
    }

  } catch(error) {
    console.log(error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: 'Usuario o producto no existe en la base de datos' });
    } else {
      res.status(500).json({ error: 'Error al guardar en el carrito' });
    }
  } finally {
    if (conn) conn.release();
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
            requiredFields: ['username (email válido)', 'password (mín. 8 caracteres)'],
            sistema: 'Autenticación automática con formato válido',
            validaciones: {
                email: 'Formato: usuario@dominio.com',
                contraseña: 'Mínimo 8 caracteres'
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
    console.log('\nSistema de autenticación:');
    console.log('- Acepta cualquier email válido (usuario@dominio.com)');
    console.log('- Contraseña mínima: 8 caracteres');
    console.log('- Genera token automáticamente si los formatos son válidos');
    console.log('- Endpoint: POST /login');
});

module.exports = app;
