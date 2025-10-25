let cart = document.querySelector('.cart');

function createProductCard(producto) {
    const product_card = document.createElement('div');
    product_card.className = 'product-card';
    product_card.dataset.productId = producto.id;
    
    const productImg = document.createElement('div');
    productImg.className = 'product-img';
    productImg.innerHTML = `<img src="${producto.image}" alt="${producto.name}" class="img__carrito">`;
    
    const product = document.createElement('div');
    product.className = 'product';
    
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';
    productInfo.innerHTML = `
        <h4>${producto.name}</h4>
        <p>${producto.cost} ${producto.currency}</p>
    `;
    
    const productUnit = document.createElement('div');
    productUnit.className = 'product-unit';
    productUnit.innerHTML = `
        <div style="display: flex; align-items: center;">
        <label>Cantidad:</label>
        <input type="number" min="1" value="${producto.cantidad}" class="cantidad-input">
    </div>
    `;
    
    const btns = document.createElement('div');
    btns.className = 'btns';
    
    const eliminarBtn = document.createElement('button');
    eliminarBtn.textContent = 'Eliminar';
    eliminarBtn.classList = 'eliminarBtn';
    eliminarBtn.addEventListener('click', () => eliminarDelCarrito(producto.id));
    btns.appendChild(eliminarBtn);
    product.appendChild(productInfo);
    product.appendChild(productUnit);
    product.appendChild(btns);
    
    product_card.appendChild(productImg);
    product_card.appendChild(product);
    const cantidadInput = productUnit.querySelector('.cantidad-input');
    cantidadInput.addEventListener('change', (e) => {
        actualizarCantidad(producto.id, parseInt(e.target.value));
    });
    
    return product_card;
}

function cargarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (!cart) return;
    
    cart.innerHTML = ''; // Limpiar carrito
    
    if (carrito.length === 0) {
        cart.innerHTML = '<p style="text-align: center; font-size: 18px; color: #666; padding: 50px;">Tu carrito está vacío</p>';
        return;
    }
    
    carrito.forEach(producto => {
        const productCard = createProductCard(producto);
        cart.appendChild(productCard);
    });
}

// Función para eliminar producto del carrito
function eliminarDelCarrito(productId) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => item.id !== productId);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito(); // Recargar vista
    if (typeof actualizarContadorCarrito === 'function') {
        actualizarContadorCarrito(); 
    }
}

// Función para actualizar cantidad
function actualizarCantidad(productId, nuevaCantidad) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = carrito.find(item => item.id === productId);
    
    if (producto && nuevaCantidad > 0) {
        producto.cantidad = nuevaCantidad;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        if (typeof actualizarContadorCarrito === 'function') {
            actualizarContadorCarrito(); // Actualizar contador
        }
    }
}

// Cargar el carrito cuando se abre la página
document.addEventListener('DOMContentLoaded', cargarCarrito);