const catID = localStorage.getItem('catID') || '101'
const URL = `${atob("aHR0cHM6Ly9qYXBjZWliYWwuZ2l0aHViLmlvL2VtZXJjYWRvLWFwaS9jYXRzX3Byb2R1Y3RzLw==")}${catID}.json`;
let productos = [];

function extraerDatos(){
    fetch(URL)
    .then(response => response.json())
    .then(data => {
        productos = data.products;
        showProducts(productos, data.catName);
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
    minPrecio = minPrecio !== "" ? Math.max(0, parseInt(minPrecio)) : undefined;
    maxPrecio = maxPrecio !== "" ? Math.max(0, parseInt(maxPrecio)) : undefined;
    extraerDatos();
})

//De mayor a menor
document.getElementById('sortAsc').addEventListener('click', ()=>{
    let titulo = document.getElementById('subtituloAutosId');
    const sortedByMaxPrice = [...productos].sort((a, b) => b.cost - a.cost);
    showProducts(sortedByMaxPrice, titulo.textContent);
});

//De menor a mayor
document.getElementById('sortDesc').addEventListener('click', () => {
    let titulo = document.getElementById('subtituloAutosId');
    const sortedByMinPrice = [...productos].sort((a, b) => a.cost - b.cost);
    showProducts(sortedByMinPrice, titulo.textContent);
});

//Por cantidad
document.getElementById('sortByCount').addEventListener('click', ()=>{
    let titulo = document.getElementById('subtituloAutosId');
    const sortedByCount = [...productos].sort((a, b)=> b.soldCount - a.soldCount); 
    showProducts(sortedByCount, titulo.textContent);
});

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
        autoDiv.addEventListener('click', () => {
            localStorage.setItem('productID', products[i].id);
            window.location.href = 'product-info.html';
        });
        divCar.appendChild(autoDiv);
        }
    }
        
}


