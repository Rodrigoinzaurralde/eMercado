const catID = localStorage.getItem("catID") || "101";
const URL = `http://localhost:3001/cats_products/${catID}.json`;
let productos = [];

async function extraerDatos() {
  try {
    const result = await getJSONData(URL);
    
    if (result.status !== "ok") {
      console.error("Error en la obtención de los datos", result.data);
      return;
    }
    
    productos = result.data.products;
    showProducts(productos, result.data.catName);
    
    // Obtener productos de la BD
    const productosEnBD = await obtenerProductos();
    
    // Crear un Set de IDs para búsqueda más rápida
    const idsExistentes = new Set(productosEnBD.map(p => p.id_producto));
    
    // Filtrar solo los productos nuevos
    const productosNuevos = productos.filter(p => !idsExistentes.has(p.id));
    
    // Agregar solo los nuevos
    for (const producto of productosNuevos) {
      try {
        await agregarProducto(producto, catID);
        console.log(`✅ Agregado: ${producto.name}`);
      } catch (error) {
        console.error(`❌ Error agregando ${producto.name}:`, error);
      }
    }
    
    console.log('Proceso completado');
    
  } catch (error) {
    console.error("Error en la obtención de los datos", error);
  }
}
extraerDatos();

let minPrecio = undefined;
let maxPrecio = undefined;
document.getElementById("rangeFilterCount").addEventListener("click", () => {
  minPrecio = document.getElementById("rangeFilterPriceMin").value;
  maxPrecio = document.getElementById("rangeFilterPriceMax").value;
  minPrecio = minPrecio !== "" ? Math.max(0, parseInt(minPrecio)) : undefined;
  maxPrecio = maxPrecio !== "" ? Math.max(0, parseInt(maxPrecio)) : undefined;
  extraerDatos();
});

//De mayor a menor
document.getElementById("sortAsc").addEventListener("click", () => {
  let titulo = document.getElementById("subtituloAutosId");
  const sortedByMaxPrice = [...productos].sort((a, b) => b.cost - a.cost);
  showProducts(sortedByMaxPrice, titulo.textContent);
});

//De menor a mayor
document.getElementById("sortDesc").addEventListener("click", () => {
  let titulo = document.getElementById("subtituloAutosId");
  const sortedByMinPrice = [...productos].sort((a, b) => a.cost - b.cost);
  showProducts(sortedByMinPrice, titulo.textContent);
});

//Por cantidad
document.getElementById("sortByCount").addEventListener("click", () => {
  let titulo = document.getElementById("subtituloAutosId");
  const sortedByCount = [...productos].sort(
    (a, b) => b.soldCount - a.soldCount
  );
  showProducts(sortedByCount, titulo.textContent);
});

document.getElementById("clearRangeFilter").addEventListener("click", () => {
  minPrecio = undefined;
  maxPrecio = undefined;
  document.getElementById("rangeFilterPriceMin").value = "";
  document.getElementById("rangeFilterPriceMax").value = "";
  extraerDatos();
});

function showProducts(products, catName) {
  let titulo = document.getElementById("subtituloAutosId");
  let divCar = document.querySelector(".auto__item");
  divCar.innerHTML = "";
  titulo.innerHTML = catName;
  if (!products || products.length === 0) {
    divCar.innerHTML = `<div id ="sin__stockID" class="alert alert-warning">Lamentamos las disculpas pero momentaneamente no contamos con stock</div>`;
    return;
  }
  for (let i = 0; i < products.length; i++) {
    if (
      (minPrecio === undefined || products[i].cost >= minPrecio) &&
      (maxPrecio === undefined || products[i].cost <= maxPrecio)
    ) {
      //Filtro de precios
      let autoDiv = document.createElement("div");
      autoDiv.className = "car__card";
      autoDiv.innerHTML = `
            <img src='${products[i].image}' alt='${products[i].name}' class='car__img' loading="lazy">
            <div class="car__info">
                <h3 class="car__name">${products[i].name}</h3>
                <p class="car__desc">${products[i].description}</p>
                <div class="car__bottom">
                    <span class="car__cost">Precio: ${products[i].cost} ${products[i].currency}</span>
                    <span class="car__sold">Vendidos: ${products[i].soldCount}</span>
                </div>
            </div>
        `;
      autoDiv.addEventListener("click", () => {
        localStorage.setItem("productID", products[i].id);
        window.location.href = "product-info.html";
      });
      divCar.appendChild(autoDiv);
    }
  }
}

function getAuthToken() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("No hay token de autenticación disponible");
    return null;
  }
  return token;
}

function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  
  if (!token) {
    console.error("No hay token de autenticación");
    window.location.href = "login.html";
    return Promise.reject("No hay token de autenticación");
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'access-token': token,
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}


async function agregarProducto(producto, catId) {
  try {
    const response = await fetchWithAuth('http://localhost:3001/productos', {
      method: 'POST',
      body: JSON.stringify({
        id_producto: producto.id,
        name: producto.name,
        description: producto.description,
        precio: producto.cost,
        vendidos: producto.soldCount,
        id_categoria: catId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Si el producto ya existe, no es un error crítico
      if (response.status === 409) {
        console.log(`ℹ️ Producto ya existe: ${producto.name}`);
        return { existe: true };
      }
      
      throw new Error(errorData.error || 'Error al agregar producto');
    }

    const data = await response.json();
    console.log('✅ Producto agregado:', data.mensaje);
    return data;
    
  } catch (error) {
    console.error('❌ Error agregando producto:', error.message);
    throw error;
  }
}

async function obtenerProductos() {
  try {
    const response = await fetchWithAuth('http://localhost:3001/productos');
    
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }

    const productos = await response.json();
    console.log(`✅ ${productos.length} productos obtenidos de la BD`);
    return productos;
    
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    return [];
  }
}