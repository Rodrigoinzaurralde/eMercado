const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'emercado',
    password: 'jap',
    database: 'emercado',
    connectionLimit: 5
});

// Función para leer archivos JSON
const readJSONFile = (filePath) => {
    try {
        const fullPath = path.join(__dirname, 'data', filePath);
        const data = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error leyendo archivo ${filePath}:`, error.message);
        return null;
    }
};

async function poblarCategorias() {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Leer categorías del JSON
        const categorias = readJSONFile('cats/cat.json');
        if (!categorias) {
            console.log('No se pudieron cargar las categorías');
            return;
        }

        console.log('Poblando categorías...');
        
        for (const categoria of categorias) {
            try {
                await conn.query(
                    `INSERT INTO categorias (id_categoria, name, description, productCount, imgSrc) 
                     VALUES (?, ?, ?, ?, ?) 
                     ON DUPLICATE KEY UPDATE 
                     name = VALUES(name), 
                     description = VALUES(description), 
                     productCount = VALUES(productCount), 
                     imgSrc = VALUES(imgSrc)`,
                    [categoria.id, categoria.name, categoria.description, parseInt(categoria.productCount), categoria.imgSrc]
                );
                console.log(`✓ Categoría insertada: ${categoria.name}`);
            } catch (error) {
                console.log(`✗ Error insertando categoría ${categoria.name}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('Error poblando categorías:', error);
    } finally {
        if (conn) conn.release();
    }
}

async function poblarProductos() {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Obtener todos los archivos de productos por categoría
        const categoriasIds = [101, 102, 103, 106, 107, 108, 109];
        
        console.log('Poblando productos...');
        
        for (const catId of categoriasIds) {
            const productos = readJSONFile(`cats_products/${catId}.json`);
            if (!productos || !productos.products) {
                console.log(`No se pudieron cargar productos de categoría ${catId}`);
                continue;
            }

            for (const producto of productos.products) {
                try {
                    await conn.query(
                        `INSERT INTO productos (id_producto, name, description, precio, vendidos, id_categoria) 
                         VALUES (?, ?, ?, ?, ?, ?) 
                         ON DUPLICATE KEY UPDATE 
                         name = VALUES(name), 
                         description = VALUES(description), 
                         precio = VALUES(precio), 
                         vendidos = VALUES(vendidos), 
                         id_categoria = VALUES(id_categoria)`,
                        [
                            producto.id, 
                            producto.name, 
                            producto.description, 
                            producto.cost, 
                            producto.soldCount || 0, 
                            catId
                        ]
                    );
                    console.log(`Producto insertado: ${producto.name} (ID: ${producto.id})`);
                } catch (error) {
                    console.log(`Error insertando producto ${producto.name}:`, error.message);
                }
            }
        }
        
    } catch (error) {
        console.error('Error poblando productos:', error);
    } finally {
        if (conn) conn.release();
    }
}

async function poblarComentarios() {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Obtener todos los archivos de comentarios
        const comentariosDir = path.join(__dirname, 'data', 'products_comments');
        const archivos = fs.readdirSync(comentariosDir).filter(file => file.endsWith('.json'));
        
        console.log('Poblando comentarios...');
        
        for (const archivo of archivos) {
            const productId = parseInt(path.basename(archivo, '.json'));
            const comentarios = readJSONFile(`products_comments/${archivo}`);
            
            if (!comentarios || !comentarios.length) {
                continue;
            }

            for (const comentario of comentarios) {
                try {
                    await conn.query(
                        `INSERT INTO comentarios (id_producto, calificacion, comentario, fecha_comentario, id_usuario) 
                         VALUES (?, ?, ?, ?, ?) 
                         ON DUPLICATE KEY UPDATE 
                         comentario = VALUES(comentario)`,
                        [
                            productId,
                            comentario.score || 0,
                            comentario.description || '',
                            comentario.dateTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
                            1 // Usuario ID por defecto
                        ]
                    );
                } catch (error) {
                    console.log(`✗ Error insertando comentario:`, error.message);
                }
            }
            console.log(`✓ Comentarios procesados para producto ${productId}`);
        }
        
    } catch (error) {
        console.error('Error poblando comentarios:', error);
    } finally {
        if (conn) conn.release();
    }
}

async function poblarUsuarios() {
    let conn;
    try {
        conn = await pool.getConnection();
        
        console.log('Poblando usuarios de ejemplo...');
        
        const usuarios = [
            { email: 'grupo314@emercado.com', ciudad: 'Montevideo' },
            { email: 'admin@emercado.com', ciudad: 'Montevideo' },
            { email: 'usuario@emercado.com', ciudad: 'Montevideo' }
        ];

        for (const usuario of usuarios) {
            try {
                await conn.query(
                    `INSERT INTO usuarios (email, ciudad) 
                     VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE 
                     ciudad = VALUES(ciudad)`,
                    [usuario.email, usuario.ciudad]
                );
                console.log(`Usuario insertado: ${usuario.email}`);
            } catch (error) {
                console.log(`Error insertando usuario ${usuario.email}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('Error poblando usuarios:', error);
    } finally {
        if (conn) conn.release();
    }
}

async function main() {
    console.log('Iniciando población de base de datos...\n');
    
    try {
        await poblarCategorias();
        console.log('');
        
        await poblarProductos();
        console.log('');
        
        await poblarComentarios();
        console.log('');
        
        await poblarUsuarios();
        console.log('');
        
        console.log('Base de datos poblada exitosamente!');
        
        // Mostrar estadísticas
        let conn = await pool.getConnection();
        const categorias = await conn.query('SELECT COUNT(*) as total FROM categorias');
        const productos = await conn.query('SELECT COUNT(*) as total FROM productos');
        const comentarios = await conn.query('SELECT COUNT(*) as total FROM comentarios');
        const usuarios = await conn.query('SELECT COUNT(*) as total FROM usuarios');
        
        console.log('\nEstadísticas:');
        console.log(`- Categorías: ${categorias[0].total}`);
        console.log(`- Productos: ${productos[0].total}`);
        console.log(`- Comentarios: ${comentarios[0].total}`);
        console.log(`- Usuarios: ${usuarios[0].total}`);
        
        conn.release();
        
    } catch (error) {
        console.error('Error en el proceso:', error);
    } finally {
        await pool.end();
    }
}

// Ejecutar el script
if (require.main === module) {
    console.log('Ejecutando script de población...');
    main().catch(console.error);
}

module.exports = { poblarCategorias, poblarProductos, poblarComentarios, poblarUsuarios };
