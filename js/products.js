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


async function agregarProducto(producto, catId) {
  try {
    const response = await fetch('http://localhost:3001/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      throw new Error(errorData.error || 'Error al agregar producto');
    }

    const data = await response.json();
    console.log('✅ Producto agregado:', data.mensaje);
    return data;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function obtenerProductos() {
  try {
    const response = await fetch('http://localhost:3001/productos'); // ← Cambiar aquí
    
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }

    const productos = await response.json();
    return productos;
    
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}