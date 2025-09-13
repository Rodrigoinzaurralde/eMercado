const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";
let todosLosProductos = [];

if(!localStorage.getItem('user')){
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
const url = "http://ip-api.com/json/?fields=61439";
const proxy = "https://corsproxy.io/?" + encodeURIComponent(url);
*/

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html')) {
      const ciudad = localStorage.getItem('city')?.toLowerCase() || '';
      let envioMsg = '';
      if (ciudad === 'montevideo' || ciudad === 'canelones') {
          envioMsg = '<div class="envio-msg">Envíos gratis en Montevideo y Canelones</div>';
      } else if (ciudad === 'maldonado' || ciudad === 'rocha'){
          envioMsg = '<div class="envio-msg">Envíos a partir de 500 pesos uruguayos</div>';
      }else if(ciudad === 'rivera' || ciudad === 'artigas'){
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
  
  function buscadorMobile(){
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
    console.log("id asignado a mobile-p-search y a .mobile-results");
    console.log(mobileInput, resultadoMobile);
  } else {
    mobileInput.id = "";
    resultadoMobile.id = "";
    normalInput.id = "findProductId";
    resltadoInput.id = "liveResults";
    console.log("product-search tiene el id");
  }
  asignarEventosBuscador();
}

function isMobile() {
  return /Mobi|iPhone|BlackBerry|iPad|iPod|Android/i.test(navigator.userAgent) ;
}
if (isMobile()) {
  window.addEventListener("load", buscadorMobile);
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
  inactividad = setTimeout(() =>{
    localStorage.clear();
    window.location.href = 'login.html';
  }, 10 * 60 * 1000)
}

//Eventos que reinician el contador de inactividad
['mousemove', 'keydown', 'scroll', 'click'].forEach(e => {
  window.addEventListener(e, resetInactividad);
});

resetInactividad();



