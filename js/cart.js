let cart = document.querySelector('.cart');

// Configuración global de SweetAlert2 para modales
if (typeof Swal !== 'undefined') {
    Swal.mixin({
        customClass: {
            container: 'swal-high-zindex'
        },
        zIndex: 99999
    });
}

// Costos por ciudad para retiro
const COSTOS_POR_CIUDAD = {
    'montevideo': 0,
    'canelones': 0,
    'maldonado': 500,
    'punta del este': 500,
    'colonia': 800,
    'san jose': 400,
    'florida': 600,
    'durazno': 1000,
    'lavalleja': 700,
    'rocha': 900,
    'treinta y tres': 1100,
    'cerro largo': 1400,
    'rivera': 1600,
    'artigas': 1800,
    'salto': 1300,
    'paysandu': 1100,
    'rio negro': 900,
    'soriano': 800,
    'tacuarembo': 1200,
    'flores': 700
};

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
        actualizarSubtotal();
        actualizarCostosEnvio();
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
    const tipoEntrega = document.querySelector('input[name="delivery-type"]:checked');
    if (tipoEntrega && tipoEntrega.value === 'agency') {
        return calcularCostoRetiroAgencia();
    }
    
    const radioEnvio = document.querySelector('input[name="shipping"]:checked');
    if (!radioEnvio) return { USD: 0, UYU: 0 };
    
    const departamento = document.getElementById('departamento')?.value;
    const porcentajeEnvio = parseInt(radioEnvio.dataset.cost) / 100;
    
    // Multiplicador por ubicación
    const multiplicadorUbicacion = obtenerMultiplicadorUbicacion(departamento);
    
    return {
        USD: subtotales.USD * porcentajeEnvio * multiplicadorUbicacion,
        UYU: subtotales.UYU * porcentajeEnvio * multiplicadorUbicacion
    };
}

function calcularCostoRetiroAgencia() {
    const ciudadInput = document.getElementById('agency-city');
    const ciudad = ciudadInput ? ciudadInput.value.toLowerCase().trim() : '';
    
    const costo = COSTOS_POR_CIUDAD[ciudad] || 1000; // 1000 UYU por defecto
    
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
        const costo = COSTOS_POR_CIUDAD[ciudad] || 1000;
        
        if (ciudad && COSTOS_POR_CIUDAD[ciudad]) {
            formText.textContent = `Costo para ${ciudadInput.value}: $${costo} UYU`;
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
        'montevideo': 1.0,       // Sin recargo
        'canelones': 1.0,        // Sin recargo
        'san-jose': 1.05,        // 5% adicional
        'maldonado': 1.08,       // 8% adicional
        'colonia': 1.12,         // 12% adicional
        'florida': 1.15,         // 15% adicional
        'lavalleja': 1.18,       // 18% adicional
        'soriano': 1.20,         // 20% adicional
        'flores': 1.22,          // 22% adicional
        'rocha': 1.25,           // 25% adicional
        'rio-negro': 1.28,       // 28% adicional
        'durazno': 1.30,         // 30% adicional
        'paysandu': 1.35,        // 35% adicional
        'salto': 1.40,           // 40% adicional
        'treinta-y-tres': 1.42,  // 42% adicional
        'tacuarembo': 1.45,      // 45% adicional
        'cerro-largo': 1.50,     // 50% adicional
        'rivera': 1.55,          // 55% adicional
        'artigas': 1.60          // 60% adicional
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
    
    // Actualizar elementos
    const productsCostElement = document.getElementById('products-cost');
    const shippingCostElement = document.getElementById('costo-envio');
    const totalCostElement = document.getElementById('total-cost');
    
    if (productsCostElement) {
        productsCostElement.textContent = formatearMoneda(subtotales);
    }
    
    if (shippingCostElement) {
        const tipoEntrega = document.querySelector('input[name="delivery-type"]:checked');
        if (tipoEntrega && tipoEntrega.value === 'agency') {
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
    const tipoEntrega = document.querySelector('input[name="delivery-type"]:checked');
    const formularioDireccion = document.getElementById('address-form');
    const formularioAgencia = document.getElementById('agency-form');
    const campoDepartamento = document.getElementById('departamento');
    const campoLocalidad = document.getElementById('localidad');
    const campoCalle = document.getElementById('calle');
    const campoEsquina = document.getElementById('esquina');
    
    if (tipoEntrega && tipoEntrega.value === 'agency') {
        formularioDireccion.classList.add('hidden');
        formularioAgencia.classList.remove('hidden');
        campoDepartamento.required = false;
        campoLocalidad.required = false;
        campoCalle.required = false;
        campoEsquina.required = false;
        
        // Cargar ciudad desde localStorage si existe
        cargarCiudadDesdeStorage();
    } else {
        formularioDireccion.classList.remove('hidden');
        formularioAgencia.classList.add('hidden');
        campoDepartamento.required = true;
        campoLocalidad.required = true;
        campoCalle.required = true;
        campoEsquina.required = true;
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
            text: 'No se encontró información de la compra',
            zIndex: 99999
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

async function finalizarCompraTransferencia() {
    const confirmarBtn = document.getElementById('confirm-transfer');
    const inputFile = document.getElementById('transfer-proof'); 
    
    const file = inputFile.files[0];
    
    // 1. Validación inicial
    if (!file) {
        Swal.fire({
            icon: 'warning',
            title: 'Comprobante requerido',
            text: 'Por favor, suba el comprobante de su transferencia bancaria antes de confirmar.',
            target: document.getElementById('transfer-modal')
        });
        return;
    }
    
    confirmarBtn.disabled = true;
    confirmarBtn.textContent = 'Analizando comprobante...'; 
    
    try {
        const { data: { text } } = await Tesseract.recognize(
            file,
            'spa' 
        );
        console.log("Texto extraído por Tesseract:", text);
        
        const textoLimpio = text.toLowerCase();
        const patronAccion = textoLimpio.includes('transferiste') || textoLimpio.includes('transferencia') || textoLimpio.includes('transierencis') || textoLimpio.includes('spei') || textoLimpio.includes('enviado desde') || textoLimpio.includes('deposito');

        //Identificar el Monto y Destino
        const patronDetalle = textoLimpio.includes('referencia') || textoLimpio.includes('monto') || textoLimpio.includes('importe') || textoLimpio.includes('clabe') || textoLimpio.includes('cuenta') || textoLimpio.includes('brod') || textoLimpio.includes('movimiento');
        const patronConfirmacion = textoLimpio.includes('confirmacion') || textoLimpio.includes('reciben') || textoLimpio.includes('finalizada') || textoLimpio.includes('exitosa');
        // Contar cuantos criterios se cumplen
        let criteriosCumplidos = 0;
        if (patronAccion) criteriosCumplidos++;
        if (patronDetalle) criteriosCumplidos++;
        if (patronConfirmacion) criteriosCumplidos++;
        if (criteriosCumplidos >= 2) {
            Swal.fire({
                icon: 'success',
                title: 'Comprobante Aprobado',
                text: 'Validación local exitosa. Tu pedido entrará en revisión final. ¡Gracias!',
                target: document.getElementById('transfer-modal')
            });
        } else {
            console.warn("Fallo de Detección. Criterios cumplidos:", {patronAccion, patronDetalle, patronConfirmacion, total: criteriosCumplidos});
            Swal.fire({
                icon: 'error',
                title: 'No Reconocido',
                text: 'La imagen no contiene el texto esperado de un comprobante bancario. Intenta con una captura más clara.',
                target: document.getElementById('transfer-modal')
            });
        }

    } catch (error) {
        // Captura errores de Tesseract.js
        console.error("Error durante el análisis OCR:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Análisis',
            text: 'Ocurrió un error al intentar leer la imagen. Asegúrate de que sea un formato de imagen válido.',
            target: document.getElementById('transfer-modal')
        });
    } finally {
        confirmarBtn.disabled = false;
        confirmarBtn.textContent = 'Confirmar Transferencia';
    }
}

function manejarSubidaComprobante() {
    const fileInput = document.getElementById('transfer-proof');
    const filePreview = document.getElementById('file-preview');
    const fileLabel = document.querySelector('label[for="transfer-proof"] span');

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: 'Archivo no válido',
                text: 'Por favor, seleccione una imagen (JPG, PNG, etc.)',
                target: document.getElementById('transfer-modal')
            });
            fileInput.value = '';
            return;
        }

        // Validar tamaño máximo 5MB
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            Swal.fire({
                icon: 'error',
                title: 'Archivo muy grande',
                text: 'El archivo no puede superar los 5MB',
                target: document.getElementById('transfer-modal')
            });
            fileInput.value = '';
            return;
        }

        // Mostrar previsualizacion  del archivo
        const reader = new FileReader();
        reader.onload = function(e) {
            filePreview.innerHTML = `
                <div class="file-info">
                    <div class="file-name">📄 ${file.name}</div>
                    <div class="file-size">${formatearTamanoArchivo(file.size)}</div>
                    <button type="button" class="remove-file" onclick="eliminarComprobante()">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
                <img src="${e.target.result}" alt="Comprobante" class="preview-image">
            `;
            filePreview.classList.add('active');
            fileLabel.textContent = 'Archivo seleccionado ✓';
        };
        reader.readAsDataURL(file);
    }
}

window.eliminarComprobante = function() {
    const fileInput = document.getElementById('transfer-proof');
    const filePreview = document.getElementById('file-preview');
    const fileLabel = document.querySelector('label[for="transfer-proof"] span');

    fileInput.value = '';
    filePreview.classList.remove('active');
    filePreview.innerHTML = '';
    fileLabel.textContent = 'Seleccionar comprobante';
}


function formatearTamanoArchivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    const radiosTipoEntrega = document.querySelectorAll('input[name="delivery-type"]');
    radiosTipoEntrega.forEach(radio => {
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
    const radiosEnvio = document.querySelectorAll('input[name="shipping"]');
    radiosEnvio.forEach(radio => {
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
                    text: 'El carrito está vacío',
                    zIndex: 99999
                });
                return;
            }
            
            // Validar dirección si es envío a domicilio
            const tipoEntrega = document.querySelector('input[name="delivery-type"]:checked');
            if (tipoEntrega && tipoEntrega.value === 'home') {
                const departamento = document.getElementById('departamento').value;
                const localidad = document.getElementById('localidad').value;
                const calle = document.getElementById('calle').value;
                const esquina = document.getElementById('esquina').value;
                
                if (!departamento || !localidad || !calle || !esquina) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Datos incompletos',
                        text: 'Por favor completa todos los campos obligatorios: departamento, localidad, calle y esquina',
                        zIndex: 99999
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
//Listener para la subida de comprobante
    const transferProofInput = document.getElementById('transfer-proof');
    if (transferProofInput) {
        transferProofInput.addEventListener('change', manejarSubidaComprobante);
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
                expiry: document.getElementById('card-expiry').value,
                cuotas: document.getElementById('card-installments')?.value || 1
            };
            
            const errores = validarTarjeta(datosТarjeta);
            
            if (errores.length > 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errores en los datos de la tarjeta',
                    html: errores.join('<br>'),
                    confirmButtonText: 'Entendido',
                    zIndex: 99999
                });
                return;
            }
            finalizarCompra(datosТarjeta);
        });
    }

    // Actualizar costos de envío al cambiar la selección
    const opcionesEnvio = document.querySelectorAll('input[name="shipping"]');
    opcionesEnvio.forEach(option => {
        option.addEventListener('change', actualizarCostosEnvio);
    });
});

