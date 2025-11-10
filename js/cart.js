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
        actualizarCostosEnvio(); // Actualizar costos de envío
        return;
    }
    
    carrito.forEach(producto => {
        const productCard = createProductCard(producto);
        cart.appendChild(productCard);
    });
    
    actualizarSubtotal();
    actualizarCostosEnvio(); // Actualizar costos de envío
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
        actualizarCostosEnvio();
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

function calcularCostoEnvio(subtotales) {
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked');
    
    // Si es retiro en agencia, calcular costo basado en ciudad
    if (deliveryType && deliveryType.value === 'agency') {
        return calcularCostoRetiroAgencia();
    }
    
    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    if (!shippingRadio) return { USD: 0, UYU: 0 };
    
    const departamento = document.getElementById('departamento')?.value;
    const shippingPercentage = parseInt(shippingRadio.dataset.cost) / 100;
    
    // Multiplicador por ubicación
    const multiplicadorUbicacion = obtenerMultiplicadorUbicacion(departamento);
    
    return {
        USD: subtotales.USD * shippingPercentage * multiplicadorUbicacion,
        UYU: subtotales.UYU * shippingPercentage * multiplicadorUbicacion
    };
}

function calcularCostoRetiroAgencia() {
    const ciudadInput = document.getElementById('agency-city');
    const ciudad = ciudadInput ? ciudadInput.value.toLowerCase().trim() : '';
    // Costo por ciudad para retiro en agencia (en UYU)
    const costosPorCiudad = {
        'montevideo': 500,
        'canelones': 800,
        'maldonado': 1200,
        'punta del este': 1200,
        'colonia': 1500,
        'san jose': 1000,
        'florida': 1300,
        'durazno': 1800,
        'lavalleja': 1400,
        'rocha': 2000,
        'treinta y tres': 1900,
        'cerro largo': 2200,
        'rivera': 2500,
        'artigas': 2800,
        'salto': 2300,
        'paysandu': 2000,
        'rio negro': 1800,
        'soriano': 1700,
        'tacuarembo': 2100,
        'flores': 1600
    };
    
    const costo = costosPorCiudad[ciudad] || 1000; // 1000 UYU por defecto
    
    return {
        USD: 0,
        UYU: costo
    };
}

function cargarCiudadDesdeStorage() {
    const ciudadGuardada = localStorage.getItem('ciudad_usuario');
    const ciudadInput = document.getElementById('agency-city');
    
    if (ciudadGuardada && ciudadInput) {
        ciudadInput.value = ciudadGuardada;
        actualizarTextoCostoAgencia();
    }
}

function actualizarTextoCostoAgencia() {
    const ciudadInput = document.getElementById('agency-city');
    const formText = document.querySelector('#agency-form .form-text');
    
    if (ciudadInput && formText) {
        const ciudad = ciudadInput.value.toLowerCase().trim();
        const costosPorCiudad = {
            'montevideo': 500,
            'canelones': 800,
            'maldonado': 1200,
            'punta del este': 1200,
            'colonia': 1500,
            'san jose': 1000,
            'florida': 1300,
            'durazno': 1800,
            'lavalleja': 1400,
            'rocha': 2000,
            'treinta y tres': 1900,
            'cerro largo': 2200,
            'rivera': 2500,
            'artigas': 2800,
            'salto': 2300,
            'paysandu': 2000,
            'rio negro': 1800,
            'soriano': 1700,
            'tacuarembo': 2100,
            'flores': 1600
        };
        
        const costo = costosPorCiudad[ciudad] || 1000;
        
        if (ciudad && costosPorCiudad[ciudad]) {
            formText.textContent = `Costo para ${ciudadInput.value}: $${costo} UYU`;
        } else {
            formText.textContent = `Costo base: $${costo} UYU (puede variar según la ciudad)`;
        }
    }
}

function guardarCiudadEnStorage() {
    const ciudadInput = document.getElementById('agency-city');
    if (ciudadInput && ciudadInput.value.trim()) {
        localStorage.setItem('ciudad_usuario', ciudadInput.value.trim());
    }
}

function obtenerMultiplicadorUbicacion(departamento) {
    // Costos de envío por departamento
    const costosPorDepartamento = {
        'montevideo': 1.0,    // Sin recargo
        'canelones': 1.1,     // 10% adicional
        'san-jose': 1.15,     // 15% adicional
        'maldonado': 1.2,     // 20% adicional
        'colonia': 1.25,      // 25% adicional
        'florida': 1.3,       // 30% adicional
        'lavalleja': 1.3,     // 30% adicional
        'flores': 1.35,       // 35% adicional
        'durazno': 1.4,       // 40% adicional
        'soriano': 1.4,       // 40% adicional
        'rio-negro': 1.45,    // 45% adicional
        'rocha': 1.5,         // 50% adicional
        'treinta-y-tres': 1.5, // 50% adicional
        'paysandu': 1.55,     // 55% adicional
        'tacuarembo': 1.6,    // 60% adicional
        'salto': 1.65,        // 65% adicional
        'artigas': 1.7,       // 70% adicional
        'rivera': 1.7,        // 70% adicional
        'cerro-largo': 1.75   // 75% adicional
    };
    
    return costosPorDepartamento[departamento] || 1.0;
}

function calcularTotal(subtotales, costoEnvio) {
    return {
        USD: subtotales.USD + costoEnvio.USD,
        UYU: subtotales.UYU + costoEnvio.UYU
    };
}

function formatearMoneda(subtotales) {
    let texto = '';
    
    if (subtotales.USD > 0 && subtotales.UYU > 0) {
        texto = `$${subtotales.USD.toLocaleString('es-UY', { minimumFractionDigits: 2 })} USD + $${subtotales.UYU.toLocaleString('es-UY', { minimumFractionDigits: 2 })} UYU`;
    } else if (subtotales.USD > 0) {
        texto = `$${subtotales.USD.toLocaleString('es-UY', { minimumFractionDigits: 2 })} USD`;
    } else if (subtotales.UYU > 0) {
        texto = `$${subtotales.UYU.toLocaleString('es-UY', { minimumFractionDigits: 2 })} UYU`;
    } else {
        texto = '$0';
    }
    
    return texto;
}

function actualizarCostosEnvio() {
    const subtotales = calcularSubtotalPorMoneda();
    const costoEnvio = calcularCostoEnvio(subtotales);
    const total = calcularTotal(subtotales, costoEnvio);
    
    // Actualizar elementos del DOM
    const productsCostElement = document.getElementById('products-cost');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalCostElement = document.getElementById('total-cost');
    
    if (productsCostElement) {
        productsCostElement.textContent = formatearMoneda(subtotales);
    }
    
    if (shippingCostElement) {
        const deliveryType = document.querySelector('input[name="delivery-type"]:checked');
        if (deliveryType && deliveryType.value === 'agency') {
            const ciudadInput = document.getElementById('agency-city');
            const ciudad = ciudadInput ? ciudadInput.value.trim() : '';
            if (ciudad) {
                shippingCostElement.textContent = `Retiro en ${ciudad} - ${formatearMoneda(costoEnvio)}`;
            } else {
                shippingCostElement.textContent = `Retiro en agencia - ${formatearMoneda(costoEnvio)}`;
            }
        } else {
            shippingCostElement.textContent = formatearMoneda(costoEnvio);
        }
    }
    
    if (totalCostElement) {
        totalCostElement.textContent = formatearMoneda(total);
    }
}

function manejarCambioTipoEntrega() {
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked');
    const addressForm = document.getElementById('address-form');
    const agencyForm = document.getElementById('agency-form');
    const departamentoField = document.getElementById('departamento');
    const localidadField = document.getElementById('localidad');
    
    if (deliveryType && deliveryType.value === 'agency') {
        // Retiro en agencia - mostrar formulario de ciudad, ocultar dirección
        addressForm.classList.add('hidden');
        agencyForm.classList.remove('hidden');
        departamentoField.required = false;
        localidadField.required = false;
        
        // Cargar ciudad desde localStorage si existe
        cargarCiudadDesdeStorage();
    } else {
        // Envío a domicilio - mostrar formulario de dirección, ocultar agencia
        addressForm.classList.remove('hidden');
        agencyForm.classList.add('hidden');
        departamentoField.required = true;
        localidadField.required = true;
    }
    
    actualizarCostosEnvio();
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
    
    // Calcular el costo de envío
    const costoEnvio = calcularCostoEnvio(subtotales);
    const total = calcularTotal(subtotales, costoEnvio);
    
    let mensajeCompra = '';
    if (total.USD > 0 && total.UYU > 0) {
        mensajeCompra = `$${total.USD.toLocaleString('es-UY', { minimumFractionDigits: 2 })} USD + $${total.UYU.toLocaleString('es-UY', { minimumFractionDigits: 2 })} UYU`;
    } else if (total.USD > 0) {
        mensajeCompra = `$${total.USD.toLocaleString('es-UY', { minimumFractionDigits: 2 })} USD`;
    } else if (total.UYU > 0) {
        mensajeCompra = `$${total.UYU.toLocaleString('es-UY', { minimumFractionDigits: 2 })} UYU`;
    } else {
        mensajeCompra = '$0,00';
    }
    
    // Guardar todos los datos de la compra
    const datosCompra = { 
        carrito, 
        subtotales, 
        costoEnvio,
        total,
        mensajeCompra 
    };
    
    sessionStorage.setItem('compra_pendiente', JSON.stringify(datosCompra));
    
    // Mostrar modal de selección de método de pago
    mostrarModalMetodoPago();
}
// Funciones para modal de método de pago
function mostrarModalMetodoPago() {
    const modal = document.getElementById('payment-method-modal');
    if (modal) {
        modal.showModal();
    }
}

function ocultarModalMetodoPago() {
    const modal = document.getElementById('payment-method-modal');
    if (modal) {
        modal.close();
    }
}

// Funciones para modal de transferencia
function mostrarModalTransferencia() {
    const compraPendiente = JSON.parse(sessionStorage.getItem('compra_pendiente'));
    const modal = document.getElementById('transfer-modal');
    const amountElement = document.getElementById('transfer-amount');
    
    if (modal && compraPendiente) {
        amountElement.textContent = compraPendiente.mensajeCompra;
        modal.showModal();
    }
}

function ocultarModalTransferencia() {
    const modal = document.getElementById('transfer-modal');
    if (modal) {
        modal.close();
    }
}

// Modificar mostrarModalPago para manejar tipos
function mostrarModalPago(tipoTarjeta) {
    const compraPendiente = JSON.parse(sessionStorage.getItem('compra_pendiente'));
    const modal = document.getElementById('payment-modal');
    const cuotasGroup = document.getElementById('cuotas-group');
    const modalHeader = modal.querySelector('.modal-header h2');
    const amountElement = document.getElementById('card-payment-amount');
    
    if (modal && cuotasGroup && modalHeader) {
        // Mostrar el total en el modal
        if (amountElement && compraPendiente) {
            amountElement.textContent = compraPendiente.mensajeCompra;
        }
        
        if (tipoTarjeta === 'credito') {
            cuotasGroup.style.display = 'block';
            modalHeader.textContent = 'Datos de Tarjeta de Crédito';
            console.log('Mostrando modal de crédito con cuotas');
        } else {
            cuotasGroup.style.display = 'none';
            modalHeader.textContent = 'Datos de Tarjeta de Débito';
            console.log('Mostrando modal de débito sin cuotas');
        }
        
        sessionStorage.setItem('tipo_tarjeta', tipoTarjeta);
        modal.showModal();
    } else {
        console.error('No se encontraron los elementos del modal:', {
            modal: !!modal,
            cuotasGroup: !!cuotasGroup,
            modalHeader: !!modalHeader
        });
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
    const tipoTarjeta = sessionStorage.getItem('tipo_tarjeta');
    
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
    if (tipoTarjeta === 'credito' && (!datosТarjeta.cuotas || datosТarjeta.cuotas < 1)) {
        errores.push('Debe seleccionar el número de cuotas');
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

function finalizarCompraTransferencia() {
    const compraPendiente = JSON.parse(sessionStorage.getItem('compra_pendiente'));
    
    if (!compraPendiente) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró información de la compra'
        });
        return;
    }

    console.log('Procesando transferencia bancaria:', compraPendiente);

    // Limpiar carrito y datos pendientes
    localStorage.removeItem('carrito');
    sessionStorage.removeItem('compra_pendiente');
    sessionStorage.removeItem('tipo_tarjeta');
    ocultarModalTransferencia();
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
    actualizarCostosEnvio();
    
    // Inicializar formularios según tipo de entrega
    manejarCambioTipoEntrega();
    
    // Event listeners para tipo de entrega
    const deliveryTypeRadios = document.querySelectorAll('input[name="delivery-type"]');
    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', manejarCambioTipoEntrega);
    });
    
    // Event listener para ciudad de retiro en agencia
    const agencyCityInput = document.getElementById('agency-city');
    if (agencyCityInput) {
        agencyCityInput.addEventListener('input', function() {
            actualizarTextoCostoAgencia();
            actualizarCostosEnvio();
        });
        
        agencyCityInput.addEventListener('blur', function() {
            guardarCiudadEnStorage();
        });
    }
    
    // Event listeners para departamento (para recalcular costos)
    const departamentoSelect = document.getElementById('departamento');
    if (departamentoSelect) {
        departamentoSelect.addEventListener('change', actualizarCostosEnvio);
    }
    
    // Event listeners para tipo de envío (premium, express, standard)
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    shippingRadios.forEach(radio => {
        radio.addEventListener('change', actualizarCostosEnvio);
    });
    
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
            
            // Validar dirección si es envío a domicilio
            const deliveryType = document.querySelector('input[name="delivery-type"]:checked');
            if (deliveryType && deliveryType.value === 'home') {
                const departamento = document.getElementById('departamento').value;
                const localidad = document.getElementById('localidad').value;
                
                if (!departamento || !localidad) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Datos incompletos',
                        text: 'Por favor completa el departamento y la localidad para el envío'
                    });
                    return;
                }
            }
            
            const subtotales = calcularSubtotalPorMoneda();
            procesarCompra(carrito, subtotales);
        });
    }
    const methodModal = document.getElementById('payment-method-modal');
    const closeMethodModal = document.querySelector('.close-modal-method');
    const paymentMethodBtns = document.querySelectorAll('.payment-method-btn');

    console.log('Configurando modales:', {
        methodModal: !!methodModal,
        closeMethodModal: !!closeMethodModal,
        paymentMethodBtns: paymentMethodBtns.length
    });

    if (closeMethodModal) {
        closeMethodModal.addEventListener('click', ocultarModalMetodoPago);
    }

    paymentMethodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.dataset.method;
            console.log('Método seleccionado:', method);
            ocultarModalMetodoPago();
            
            if (method === 'transferencia') {
                mostrarModalTransferencia();
            } else if (method === 'credito') {
                mostrarModalPago('credito');
            } else if (method === 'debito') {
                mostrarModalPago('debito');
            }
        });
    });

    // Event listeners para modal de transferencia
    const transferModal = document.getElementById('transfer-modal');
    const closeTransferModal = document.querySelector('.close-transfer-modal');
    const cancelTransferBtn = document.getElementById('cancel-transfer');
    const confirmTransferBtn = document.getElementById('confirm-transfer');

    if (closeTransferModal) {
        closeTransferModal.addEventListener('click', ocultarModalTransferencia);
    }

    if (cancelTransferBtn) {
        cancelTransferBtn.addEventListener('click', ocultarModalTransferencia);
    }

    if (confirmTransferBtn) {
        confirmTransferBtn.addEventListener('click', function() {
            finalizarCompraTransferencia();
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

    // Modificar el submit del form de tarjeta para incluir cuotas
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const datosТarjeta = {
                type: document.getElementById('card-type').value,
                name: document.getElementById('card-name').value.trim(),
                number: document.getElementById('card-number').value.replace(/\s/g, ''),
                cvv: document.getElementById('card-cvv').value,
                expiry: document.getElementById('card-expiry').value,
                cuotas: document.getElementById('card-installments')?.value || 1
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

    // Actualizar costos de envío al cambiar la selección
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', actualizarCostosEnvio);
    });
});

