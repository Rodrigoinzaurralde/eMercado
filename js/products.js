const catID = localStorage.getItem('catID') || '101'
const URL = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;

function extraerDatos(){
    fetch(URL)
    .then(response => response.json())
    .then(data => {
        showProducts(data.products, data.catName);
    })
    .catch(error => {
    console.error('Error en la obtención de los datos', error);
    });
}
extraerDatos();

let minPrecio = undefined;
let maxPrecio = undefined;
document.getElementById("rangeFilterCount").addEventListener("click", ()=>{
    minPrecio = document.getElementById("rangeFilterPriceMin").value;
    maxPrecio = document.getElementById("rangeFilterPriceMax").value;
    minPrecio = minPrecio !== "" ? parseInt(minPrecio) : undefined;
    maxPrecio = maxPrecio !== "" ? parseInt(maxPrecio) : undefined;
    extraerDatos();
})

document.getElementById("clearRangeFilter").addEventListener("click", ()=>{
    minPrecio = undefined;
    maxPrecio = undefined;
    document.getElementById("rangeFilterPriceMin").value = "";
    document.getElementById("rangeFilterPriceMax").value = "";
    extraerDatos();
})

function showProducts(products, catName){
    let titulo = document.getElementById('subtituloAutosId');
    let divCar = document.querySelector('.auto__item');
    divCar.innerHTML = "";
    titulo.innerHTML = catName;
    if(!products || products.length === 0){
        divCar.innerHTML = `<div id ="sin__stockID" class="alert alert-warning">Lamentamos las disculpas pero momentaneamente no contamos con stock</div>`
        return;
    }
    for(let i=0; i < products.length; i++){
        if((minPrecio === undefined || products[i].cost >= minPrecio)&&(maxPrecio === undefined || products[i].cost <= maxPrecio)){ //Filtro de precios
            let autoDiv = document.createElement('div');
        autoDiv.className = 'car__card';
        autoDiv.innerHTML = `
            <img src='${products[i].image}' alt='${products[i].name}' class='car__img'>
            <div class="car__info">
                <h3 class="car__name">${products[i].name}</h3>
                <p class="car__desc">${products[i].description}</p>
                <div class="car__bottom">
                    <span class="car__cost">Precio: ${products[i].cost} ${products[i].currency}</span>
                    <span class="car__sold">Vendidos: ${products[i].soldCount}</span>
                </div>
            </div>
        `;
        autoDiv.addEventListener('click', () => {
            localStorage.setItem('productID', products[i].id);
            window.location.href = 'product-info.html';
        });
        divCar.appendChild(autoDiv);
        }
    }
        
}


