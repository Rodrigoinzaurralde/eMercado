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
        <h4 class='nombre_Class'>${producto.name}</h4>
        <p class='costo_Class'>${producto.cost} ${producto.currency}</p>
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
        actualizarSubtotal(); // Actualizar subtotal cuando está vacío
        return;
    }
    
    carrito.forEach(producto => {
        const productCard = createProductCard(producto);
        cart.appendChild(productCard);
    });
    
    actualizarSubtotal();
}

function eliminarDelCarrito(productId) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => item.id !== productId);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito(); // Recargar vista
    if (typeof actualizarContadorCarrito === 'function') {
        actualizarContadorCarrito(); 
    }
    actualizarSubtotal();
}

function actualizarCantidad(productId, nuevaCantidad) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = carrito.find(item => item.id === productId);
    
    if (producto && nuevaCantidad > 0) {
        producto.cantidad = nuevaCantidad;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        if (typeof actualizarContadorCarrito === 'function') {
            actualizarContadorCarrito(); // Actualizar contador
        }
        actualizarSubtotal();
    }
}

function calcularSubtotalPorMoneda() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const subtotales = {
        USD: 0,
        UYU: 0
    };
    
    carrito.forEach(producto => {
        const moneda = producto.currency === 'USD' ? 'USD' : 'UYU';
        subtotales[moneda] += producto.cost * producto.cantidad;
    });
    
    return subtotales;
}
function actualizarSubtotal() {
    const subtotales = calcularSubtotalPorMoneda();
    const subtotalElement = document.getElementById('subtotal-amount');
    
    if (subtotalElement) {
        let textoSubtotal = '';
        
        if (subtotales.USD > 0 && subtotales.UYU > 0) {
            textoSubtotal = `$${subtotales.USD.toLocaleString()} USD + $${subtotales.UYU.toLocaleString()} UYU`;
        } else if (subtotales.USD > 0) {
            textoSubtotal = `$${subtotales.USD.toLocaleString()} USD`;
        } else if (subtotales.UYU > 0) {
            textoSubtotal = `$${subtotales.UYU.toLocaleString()} UYU`;
        } else {
            textoSubtotal = '$0';
        }
        
        subtotalElement.textContent = textoSubtotal;
    } else {
        console.log('Elemento subtotal no encontrado, subtotales calculados:', subtotales);
    }
}

function procesarCompra(carrito, subtotales) {
    console.log('Iniciando proceso de compra:', { carrito, subtotales });
    
    // Crear mensaje de compra para mostrar en el modal
    let mensajeCompra = '';
    if (subtotales.USD > 0 && subtotales.UYU > 0) {
        mensajeCompra = `$${subtotales.USD.toLocaleString()} USD + $${subtotales.UYU.toLocaleString()} UYU`;
    } else if (subtotales.USD > 0) {
        mensajeCompra = `$${subtotales.USD.toLocaleString()} USD`;
    } else {
        mensajeCompra = `$${subtotales.UYU.toLocaleString()} UYU`;
    }
    
    // Guardar datos de compra temporalmente
    sessionStorage.setItem('compra_pendiente', JSON.stringify({ carrito, subtotales, mensajeCompra }));
    
    // Mostrar modal de pago
    mostrarModalPago();
}

// Funciones para manejar el modal de pago (HTML5 Dialog)
function mostrarModalPago() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.showModal();
        // No necesitamos manejar overflow del body, el dialog lo hace automáticamente
    }
}

function ocultarModalPago() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.close();
    }
}

function validarTarjeta(datosТarjeta) {
    const errores = [];
    
    // validador del nombre
    if (!datosТarjeta.name || datosТarjeta.name.trim().length < 2) {
        errores.push('El nombre del titular debe tener al menos 2 caracteres');
    }
    
    // Validador de  número de tarjeta solo dígitos, entre 13-19 caracteres
    const numeroLimpio = datosТarjeta.number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(numeroLimpio)) {
        errores.push('El número de tarjeta debe tener entre 13 y 19 dígitos');
    }
    
    // Validador de  CVV (3-4 dígitos)
    if (!/^\d{3,4}$/.test(datosТarjeta.cvv)) {
        errores.push('El CVV debe tener 3 o 4 dígitos');
    }
    
    // Validar fecha de vencimiento (MM/AA)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(datosТarjeta.expiry)) {
        errores.push('La fecha de vencimiento debe tener formato MM/AA');
    } else {
        // Verificar vencimiento
        const [mes, año] = datosТarjeta.expiry.split('/');
        const fechaVencimiento = new Date(2000 + parseInt(año), parseInt(mes) - 1);
        const ahora = new Date();
        if (fechaVencimiento < ahora) {
            errores.push('La tarjeta está vencida');
        }
    }
    
    return errores;
}

function finalizarCompra(datosТarjeta) {
    const compraPendiente = JSON.parse(sessionStorage.getItem('compra_pendiente'));
    
    if (!compraPendiente) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró información de la compra'
        });
        return;
    }

    console.log('Procesando pago con tarjeta:', datosТarjeta);
    console.log('Detalles de compra:', compraPendiente);

    // Limpiar carrito y datos pendientes
    localStorage.removeItem('carrito');
    sessionStorage.removeItem('compra_pendiente');
    ocultarModalPago();
    window.location.href = 'completarOrden.html';
}

function formatearNumeroTarjeta(input) {
    let valor = input.value.replace(/\D/g, '');
    
    // Agregar espacios cada 4 dígitos para simular el formayo tarjeta
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limitar a 19 caracteres serian 16 dígitos mas 3 espacios
    if (valor.length > 19) {
        valor = valor.substr(0, 19);
    }
    
    input.value = valor;
}

function formatearFechaVencimiento(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length >= 2) {
        valor = valor.substr(0, 2) + '/' + valor.substr(2, 2);
    }
    
    input.value = valor;
}

document.addEventListener('DOMContentLoaded', function() {
    cargarCarrito();
    actualizarSubtotal();
    
    // Configurar evento del botón de comprar
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            
            if (carrito.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Carrito vacío',
                    text: 'El carrito está vacío'
                });
                return;
            }
            
            const subtotales = calcularSubtotalPorMoneda();
            procesarCompra(carrito, subtotales);
        });
    }
    const modal = document.getElementById('payment-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-payment');
    const paymentForm = document.getElementById('payment-form');

    if (closeModal) {
        closeModal.addEventListener('click', ocultarModalPago);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', ocultarModalPago);
    }

    if (modal) {
        modal.addEventListener('close', function() {
            if (paymentForm) {
                paymentForm.reset();
            }
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                ocultarModalPago();
            }
        });
    }
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            formatearNumeroTarjeta(this);
        });
    }
    
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            formatearFechaVencimiento(this);
        });
    }
    
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const datosТarjeta = {
                type: document.getElementById('card-type').value,
                name: document.getElementById('card-name').value.trim(),
                number: document.getElementById('card-number').value.replace(/\s/g, ''),
                cvv: document.getElementById('card-cvv').value,
                expiry: document.getElementById('card-expiry').value
            };
            const errores = validarTarjeta(datosТarjeta);
            
            if (errores.length > 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errores en los datos de la tarjeta',
                    html: errores.join('<br>'),
                    confirmButtonText: 'Entendido'
                });
                return;
            }
            finalizarCompra(datosТarjeta);
        });
    }
});