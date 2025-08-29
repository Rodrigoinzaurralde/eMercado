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

document.getElementById("boton-desplegable").innerHTML = `${localStorage.user}`;
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
