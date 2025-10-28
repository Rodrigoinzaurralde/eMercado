const CATEGORIES_URL = atob("aHR0cHM6Ly9qYXBjZWliYWwuZ2l0aHViLmlvL2VtZXJjYWRvLWFwaS9jYXRzL2NhdC5qc29u");
const PUBLISH_PRODUCT_URL = atob("aHR0cHM6Ly9qYXBjZWliYWwuZ2l0aHViLmlvL2VtZXJjYWRvLWFwaS9zZWxsL3B1Ymxpc2guanNvbg==");
const PRODUCTS_URL = atob("aHR0cHM6Ly9qYXBjZWliYWwuZ2l0aHViLmlvL2VtZXJjYWRvLWFwaS9jYXRzX3Byb2R1Y3RzLw==");
const PRODUCT_INFO_URL = atob("aHR0cHM6Ly9qYXBjZWliYWwuZ2l0aHViLmlvL2VtZXJjYWRvLWFwaS9wcm9kdWN0cy8=");
const PRODUCT_INFO_COMMENTS_URL = atob("aHR0cHM6Ly9qYXBjZWliYWwuZ2l0aHViLmlvL2VtZXJjYWRvLWFwaS9wcm9kdWN0c19jb21tZW50cy8=");
const CART_INFO_URL = atob("aHR0cHM6Ly9qYXBjZWliYWwuZ2l0aHViLmlvL2VtZXJjYWRvLWFwaS91c2VyX2NhcnQv");
const CART_BUY_URL = atob("aHR0cHM6Ly9qYXBjZWliYWwuZ2l0aHViLmlvL2VtZXJjYWRvLWFwaS9jYXJ0L2J1eS5qc29u");
const EXT_TYPE = atob("Lmpzb24=");
let todosLosProductos = [];

const paginasSinAuth = ['login.html', 'register.html'];
const paginaActual = window.location.pathname.split('/').pop();

if(!localStorage.getItem('user') && !paginasSinAuth.includes(paginaActual)){
    window.location.href = 'login.html';
}

//---Usuario en navbar---
document.getElementById("boton-desplegable").innerHTML = `${localStorage.getItem('user')}`;
const menuUser = document.getElementById("usuario-desplegable");
const perfilBox = document.querySelector('.perfil-container');
const botonMenu = document.getElementById("boton-desplegable");
botonMenu.addEventListener("click", function(){
if(menuUser.style.display === "none"){
    menuUser.style.display = "flex";
    menuUser.style.width = perfilBox.offsetWidth + "px";
    menuUser.style.left = perfilBox.getBoundingClientRect().left + "px";
    botonMenu.style = "border-radius: 10px 10px 0px 0px;";
}else{
      menuUser.style.display = "none";
      botonMenu.removeAttribute("style");
  }
});
document.addEventListener('click', (e) =>{
  if(!perfilBox.contains(e.target)){
    menuUser.style.display = "none";
    botonMenu.removeAttribute("style");
  }
});
document.getElementById("closeSession").addEventListener("click", ()=>{
  localStorage.removeItem("user");
  // Limpiar marca de notificación para que aparezca en el próximo login
  sessionStorage.removeItem('ubicacion_notificacion_mostrada');
});

const menuMobile = document.getElementById("mobile-navbar");
const botonMobile = document.querySelector(".navbar-button");
const btnCerrarMobile = document.querySelector(".close-mobile")
botonMobile.addEventListener("click", ()=>{
  menuMobile.style.width = "50%";
})
btnCerrarMobile.addEventListener("click", ()=>{
  menuMobile.style.width = "0%";
})

//-----------------------------------------------------------------------------


let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function(url){
    let result = {};
    showSpinner();
    return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }else{
        throw Error(response.statusText);
      }
    })
    .then(function(response) {
          result.status = 'ok';
          result.data = response;
          hideSpinner();
          return result;
    })
    .catch(function(error) {
        result.status = 'error';
        result.data = error;
        hideSpinner();
        return result;
    });
}
async function cargarTodosLosProductos() {
  const categorias = await fetch(CATEGORIES_URL).then(r => r.json());
  const fetches = categorias.map(cat =>
    fetch(`${PRODUCTS_URL}${cat.id}${EXT_TYPE}`).then(r => r.json())
  );
  const productosPorCateogoria = await Promise.all(fetches);
  todosLosProductos = productosPorCateogoria.flatMap(cat => cat.products);
}
cargarTodosLosProductos();
/*Mostrar ubicacion
const url = atob("aHR0cDovL2lwLWFwaS5jb20vanNvbi8/ZmllbGRzPTYxNDM5");
const proxy = atob("aHR0cHM6Ly9jb3JzcHJveHkuaW8vPw==") + encodeURIComponent(url);
*/

// Función para obtener ubicación si falló en login
async function consultarUbicacionFallback() {
  try {
    console.log("Intentando API de respaldo ipapi.co para obtener ubicación...");
    mostrarNotificacionUbicacion("Detectando ubicación con API de respaldo...", "info");
    
    const response = await fetch(atob("aHR0cHM6Ly9pcGFwaS5jby9qc29uLw=="));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Datos de ubicación obtenidos de respaldo:", data);
    
    // Guardar los datos obtenidos
    localStorage.setItem("countryCode", data.country_code || "UY");
    localStorage.setItem("city", data.city || "sin_ciudad");
    localStorage.setItem("region", data.region || "");
    
    console.log(`Ubicación actualizada desde respaldo ${data.city}, ${data.region}, ${data.country_name}`);
    
    actualizarMensajeEnvio(data.city?.toLowerCase() || '');

    mostrarNotificacionUbicacion(`Ubicación detectada: ${data.city}, ${data.country_name}`, "success");
    
  } catch (error) {
    console.error("Error en API de erspaldo", error);
    
    //valores por defecto
    localStorage.setItem("countryCode", "UY");
    localStorage.setItem("city", "montevideo");
    localStorage.setItem("region", "Montevideo");
    
    actualizarMensajeEnvio("montevideo");
    
    mostrarNotificacionUbicacion("No se pudo detectar la ubicación. Usando ubicación por defecto: Montevideo, Uruguay", "warning");
  }
}

function mostrarNotificacionUbicacion(mensaje, tipo = "info") {

  const notificacionAnterior = document.getElementById('ubicacion-notification');
  if (notificacionAnterior) {
    notificacionAnterior.remove();
  }
  
  const notificacion = document.createElement('div');
  notificacion.id = 'ubicacion-notification';
  notificacion.className = `notification-ubicacion ${tipo}`;
  notificacion.innerHTML = `
    <div class="notification-content">
      <i class="bi ${tipo === 'success' ? 'bi-check-circle' : tipo === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'}"></i>
      <span>${mensaje}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Insertar al principio del body
  document.body.insertBefore(notificacion, document.body.firstChild);
  
  // Evento para cerrar la notificación
  const botonCerrar = notificacion.querySelector('.notification-close');
  botonCerrar.addEventListener('click', () => {
    notificacion.remove();
  });
  
  // Auto-cerrar después de 5 segundos para info/success, 8 segundos para warning
  const tiempoAutoClose = tipo === 'warning' ? 8000 : 5000;
  setTimeout(() => {
    if (document.getElementById('ubicacion-notification')) {
      notificacion.remove();
    }
  }, tiempoAutoClose);
}

// Función para actualizar el mensaje de envío
function actualizarMensajeEnvio(ciudad) {
  const envioExistente = document.querySelector('.envio-msg');
  if (envioExistente) {
    let nuevoMensaje = '';
    
    if (ciudad === 'montevideo' || ciudad === 'canelones') {
      nuevoMensaje = 'Envíos gratis en Montevideo y Canelones';
    } else if (ciudad === 'maldonado' || ciudad === 'rocha') {
      nuevoMensaje = 'Envíos a partir de 500 pesos uruguayos';
    } else if (ciudad === 'rivera' || ciudad === 'artigas' || ciudad === 'Punta del este') {
      nuevoMensaje = 'Envíos a partir de 700 pesos uruguayos';
    } else {
      nuevoMensaje = 'Consulte por costo de envíos en su zona';
    }
    
    envioExistente.textContent = nuevoMensaje;
    console.log("Mensaje de envío actualizado:", nuevoMensaje);
  }
}

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html')) {
      const ciudad = localStorage.getItem('city')?.toLowerCase() || '';
      const apiError = localStorage.getItem('api_error');
      const apiErrorMessage = localStorage.getItem('api_error_message');
      
      // Verificar si hubo error en la API del login
      if (apiError === 'true') {
        console.warn("Error detectado en API durante login:", apiErrorMessage);
        mostrarNotificacionUbicacion(apiErrorMessage || "Error en la API de ubicación principal", "warning");
        
        //guardar que se mostró notificación
        sessionStorage.setItem('ubicacion_notificacion_mostrada', 'true');
        localStorage.removeItem('api_error');
        localStorage.removeItem('api_error_message');
        consultarUbicacionFallback();
      } else if (!ciudad || ciudad === 'sin_ciudad') {
        console.warn("No se encontró información de ubicación. Intentando obtener ubicación...");
        
        const notificacionMostrada = sessionStorage.getItem('ubicacion_notificacion_mostrada');
        if (!notificacionMostrada) {
          mostrarNotificacionUbicacion("Detectando ubicación para calcular costos de envío...", "info");
          sessionStorage.setItem('ubicacion_notificacion_mostrada', 'true');
        }
        
        consultarUbicacionFallback();
      } else {
        // Si existe la ubicación, mostrar confirmación
        const notificacionMostrada = sessionStorage.getItem('ubicacion_notificacion_mostrada');
        
        if (!notificacionMostrada) {
          const region = localStorage.getItem('region') || '';
          const nombreCiudad = ciudad.charAt(0).toUpperCase() + ciudad.slice(1);
          const nombreRegion = region ? `, ${region}` : '';
          console.log(`Ubicación detectada correctamente: ${nombreCiudad}${nombreRegion}`);
          mostrarNotificacionUbicacion(`Ubicación: ${nombreCiudad}${nombreRegion}`, "success");
          
          // Marcar que se mostró notificación
          sessionStorage.setItem('ubicacion_notificacion_mostrada', 'true');
        }
      }
      
      let envioMsg = '';
      if (ciudad === 'montevideo' || ciudad === 'canelones') {
          envioMsg = '<div class="envio-msg">Envíos gratis en Montevideo y Canelones</div>';
      } else if (ciudad === 'maldonado' || ciudad === 'rocha'){
          envioMsg = '<div class="envio-msg">Envíos a partir de 500 pesos uruguayos</div>';
      }else if(ciudad === 'rivera' || ciudad === 'artigas' || ciudad === 'punta del este'){
          envioMsg = '<div class="envio-msg">Envíos a partir de 700 pesos uruguayos</div>';
      }else{
          envioMsg = '<div class="envio-msg">Consulte por costo de envíos en su zona</div>'
      }
      const main = document.querySelector('main') || document.body;
      main.insertAdjacentHTML('afterbegin', envioMsg);
    } 
  
  //Busqueda en vivo de productos
  function asignarEventosBuscador() {
  const input = document.getElementById('findProductId');
  const results = document.getElementById('liveResults');
  if (!input || !results) return;
    function mostrarResultados(){
      const valorTextoUser = input.value.trim().toLowerCase();
      if(valorTextoUser.length === 0){
        results.classList.remove('active');
        results.innerHTML = '';
        return;
      }
      const filtrados = todosLosProductos.filter(p => 
        p.name.toLowerCase().includes(valorTextoUser) ||
        p.description.toLowerCase().includes(valorTextoUser) ||
        p.soldCount.toString().toLowerCase().includes(valorTextoUser) ||
        p.cost.toString().toLowerCase().includes(valorTextoUser) ||
        p.currency.toLowerCase().includes(valorTextoUser));
      if(filtrados.length === 0){
        results.innerHTML = '<div class="result-item">Sin resultados</div>';
      } else{
        results.innerHTML = filtrados.map(p =>
          `<div class="result-item" data-id="${p.id}">
            <strong>${p.name}</strong><br>
            <span style="font-size:0.9em;color:#666;">${p.description}</span>
          </div>`
        ).join('');
      }
      results.classList.add('active');
      document.querySelectorAll('.result-item[data-id]').forEach(item =>{
        item.addEventListener('click', function(){
          localStorage.setItem('productID', this.getAttribute('data-id'));
          window.location.href = 'product-info.html';
        })
      })
    }
    input.addEventListener('input', mostrarResultados);
    input.addEventListener('click', mostrarResultados);

    document.addEventListener('click', (e) =>{
      if(!input.contains(e.target) && !results.contains(e.target)){
        results.classList.remove('active');
      }
    });
  }
// Botón switch modo claro/oscuro
const nav = document.querySelector(".nav-container > ul");
if (nav) {
  const switchContainer = document.createElement("label");
  switchContainer.className = "switch-container";

  const switchInput = document.createElement("input");
  switchInput.type = "checkbox";
  switchInput.className = "switch-input";

  const switchSlider = document.createElement("span");
  switchSlider.className = "switch-slider";

  switchContainer.appendChild(switchInput);
  switchContainer.appendChild(switchSlider);
  nav.appendChild(switchContainer);

  // Restaurar modo desde localStorage
  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("dark-mode");
    switchInput.checked = true;
  }

  // Alternar modo
  switchInput.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("modoOscuro", switchInput.checked);
  });
}

  function carrito(){
    const botonUsuario = document.querySelector(".perfil-container");
    if (botonUsuario){
      const carrito = document.createElement("div");
      carrito.className = "carrito";
      const paginaCarrito = document.createElement("a");
      paginaCarrito.href = "cart.html";
      const iconoCarrito = document.createElement("i");
      iconoCarrito.className = "bi bi-cart2";
      //se crea un span para el contador del carrito
      const contador = document.createElement("span");
      contador.className = "cart-count hidden";
      contador.id = "cart-count";
      contador.textContent = "0";
      
      carrito.appendChild(paginaCarrito);
      paginaCarrito.appendChild(iconoCarrito);
      carrito.appendChild(contador); //contador del carrito
      botonUsuario.insertAdjacentElement("afterend", carrito);
    }
  }

  // Función para actualizar el contador del carrito
  function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalProductos = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    const contador = document.getElementById('cart-count');
    
    if (contador) {
        if (totalProductos > 0) {
            contador.textContent = totalProductos;
            contador.classList.remove('hidden');
        } else {
            contador.classList.add('hidden');
        }
    }
  }

  // Escucha cambios entre pestañas
  window.addEventListener('storage', function(e) {
    if (e.key === 'carrito') {
      actualizarContadorCarrito();
    }
  });

  // se actualiza cada 250 mili-segundosn para que cambie en "tiempo real" el contador
  setInterval(actualizarContadorCarrito, 250);

  carrito();
  actualizarContadorCarrito();
  
  function buscadorMobile(){ //Función para asignar id al buscador mobile
  const normalSearch = document.getElementById("product-search");
  const estilo = window.getComputedStyle(normalSearch);
  const mobileInput = document.querySelector("#mobile-p-search input");
  const normalInput = normalSearch.querySelector("input");
  const resultadoMobile = document.querySelector(".mobile-results");
  const resltadoInput = document.querySelector(".live-results");
  if (estilo.display === "none") {
    mobileInput.id = "findProductId";
    normalInput.id = "";
    resultadoMobile.id = "liveResults";
    resltadoInput.id = "";
  } else if(!window.innerWidth < 750){
    mobileInput.id = "";
    resultadoMobile.id = "";
    normalInput.id = "findProductId";
    resltadoInput.id = "liveResults";
  }
  asignarEventosBuscador();
}


// Detectar si es mobile y se aplica el buscador mobile
function isMobile() {
  return /Mobi|iPhone|BlackBerry|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 750;
}
if (isMobile()) {
  window.addEventListener("load", buscadorMobile);
  window.addEventListener("resize", buscadorMobile);
}
asignarEventosBuscador();
});

// Control de visitas rápidas
    const now = Date.now();
    let marcasDeTiempo = JSON.parse(localStorage.getItem('bloqueoDeVisitas') || '[]');
    marcasDeTiempo = marcasDeTiempo.filter(marca => now - marca < 8000);
    marcasDeTiempo.push(now);
    localStorage.setItem('bloqueoDeVisitas', JSON.stringify(marcasDeTiempo));
    if (marcasDeTiempo.length > 8) {
        window.location.href = "error.html";
    }

// Limpiar localStorage tras 10 min de inactividad
let inactividad;
function resetInactividad(){
  clearTimeout(inactividad);

  // Guarda la foto antes de limpiar
  const user = localStorage.getItem('user');
  const fotoKey = user ? `profileImg_${user}` : "profileImg";
  const foto = localStorage.getItem(fotoKey);
  const telefono = localStorage.getItem('phoneNumber');

  inactividad = setTimeout(() =>{
    // Limpia todo
    localStorage.clear();
    // Restaura la foto
    if (foto) {
      localStorage.setItem(fotoKey, foto);
    }
    if (telefono) {
      localStorage.setItem('phoneNumber', telefono);
    }

    window.location.href = 'login.html';
  }, 10 * 60 * 1000)
}

//Eventos que reinician el contador de inactividad
['mousemove', 'keydown', 'scroll', 'click'].forEach(e => {
  window.addEventListener(e, resetInactividad);
});

resetInactividad();



