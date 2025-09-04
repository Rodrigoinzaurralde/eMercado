const catID = localStorage.getItem('catID') || '101'
const URL = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;

fetch(URL)
.then(response => response.json())
.then(data => {
    showCars(data.products);
})
.catch(error => {
console.error('Error en la obtención de los datos', error);
});

let minPrecio = undefined;
let maxPrecio = undefined;
document.getElementById("rangeFilterCount").addEventListener("click", ()=>{
    minPrecio = document.getElementById("rangeFilterPriceMin").value;
    maxPrecio = document.getElementById("rangeFilterPriceMax").value;
    minPrecio = minPrecio !== "" ? parseInt(minPrecio) : undefined;
    maxPrecio = maxPrecio !== "" ? parseInt(maxPrecio) : undefined;

    fetch(URL)
    .then(response => response.json())
    .then(data => {
        showCars(data.products);
    })
    .catch(error => {
    console.error('Error en la obtención de los datos', error);
    });
})

document.getElementById("clearRangeFilter").addEventListener("click", ()=>{
    minPrecio = undefined;
    maxPrecio = undefined;
    document.getElementById("rangeFilterPriceMin").value = "";
    document.getElementById("rangeFilterPriceMax").value = "";

    fetch(URL)
    .then(response => response.json())
    .then(data => {
        showCars(data.products);
    })
    .catch(error => {
    console.error('Error en la obtención de los datos', error);
    });
})

function showCars(autos){
    let divCar = document.querySelector('.auto__item');
    divCar.innerHTML = "";
    const monedaUsuario = localStorage.getItem('monedaUsuario') || 'USD';
    for(let i=0; i < autos.length; i++){
        if((minPrecio === undefined || autos[i].cost >= minPrecio)&&(maxPrecio === undefined || autos[i].cost <= maxPrecio)){ //Filtro de precios
            let autoDiv = document.createElement('div');
        autoDiv.className = 'car__card';
        autoDiv.innerHTML = `
            <img src='${autos[i].image}' alt='${autos[i].name}' class='car__img'>
            <div class="car__info">
                <h3 class="car__name">${autos[i].name}</h3>
                <p class="car__desc">${autos[i].description}</p>
                <div class="car__bottom">
                    <span class="car__cost">Precio: ${autos[i].cost} ${monedaUsuario}</span>
                    <span class="car__sold">Vendidos: ${autos[i].soldCount}</span>
                </div>
            </div>
        `;
        autoDiv.addEventListener('click', () => {
            localStorage.setItem('productID', autos[i].id);
            window.location.href = 'product-info.html';
    });
    divCar.appendChild(autoDiv);
    }
    }
        
}


