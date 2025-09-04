const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

if(!localStorage.getItem('user')){
  window.location.href = 'login.html';
}
document.getElementById("boton-desplegable").innerHTML = `${localStorage.getItem('user')}`;
const menu = document.getElementById("menu-desplegable");
const botonMenu = document.getElementById("boton-desplegable");
botonMenu.addEventListener("click", function(){
if(menu.style.display === "none"){
    menu.style.display = "flex";
    botonMenu.style = "border-radius: 10px 10px 0px 0px;";
}else{
    menu.style.display = "none";
    botonMenu.removeAttribute("style");
}
})
document.getElementById("closeSession").addEventListener("click", ()=>{
  localStorage.clear();
});
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

/*Mostrar ubicacion
const url = "http://ip-api.com/json/?fields=61439";
const proxy = "https://corsproxy.io/?" + encodeURIComponent(url);
*/

fetch("https://98bde383-43b6-4428-bc39-4332b6f161fa-00-3n8s0keoycuru.worf.replit.dev/mi-ip")
  .then(res => res.json())
  .then(data => {
    console.log("Datos recibidos del backend:", data);
    let moneda = "USD";
    localStorage.setItem("monedaUsuario", moneda);
    localStorage.setItem("countryCode", data.countryCode);
    localStorage.setItem("city", data.city || "sin_ciudad")
    console.log("País detectado:", data.country, "Moneda:", moneda);
    guardarUsuarioEnBackend();
  })
  .catch(error => {
    console.error("Error al consultar la API", error);
  });
  
  window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html')) {
      const ciudad = localStorage.getItem('city')?.toLowerCase() || '';
      let envioMsg = '';
      if (ciudad === 'montevideo' || ciudad === 'canelones') {
          envioMsg = '<div class="envio-msg">Envíos gratis</div>';
      } else if (ciudad === 'maldonado'){
          envioMsg = '<div class="envio-msg">Envíos a partir de 500 pesos uruguayos</div>';
      }else if(ciudad === 'rivera' || ciudad === 'artigas'){
          envioMsg = '<div class="envio-msg">Envíos a partir de 700 pesos uruguayos</div>';
      }else{
          envioMsg = '<div class="envio-msg">Envíos a partir de 300 pesos uruguayos</div>'
      }
      const main = document.querySelector('main') || document.body;
      main.insertAdjacentHTML('afterbegin', envioMsg);
  }
});

//Guardar usuarios en el backend
function guardarUsuarioEnBackend() {
    const usuario = localStorage.getItem('user');
    const ciudad = localStorage.getItem('city') || 'sin_ciudad';
    const pais = localStorage.getItem('countryCode') || 'sin_pais';

    fetch("https://98bde383-43b6-4428-bc39-4332b6f161fa-00-3n8s0keoycuru.worf.replit.dev/guardar-usuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": "1234"
        },
        body: JSON.stringify({
            usuario: usuario,
            ciudad: ciudad,
            pais: pais
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Respuesta al guardar usuario:", data);
    })
    .catch(error => {
        console.error("Error al guardar usuario:", error);
    });
}