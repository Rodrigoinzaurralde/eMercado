const URL = 'https://japceibal.github.io/emercado-api/cats_products/101.json';

fetch(URL)
.then(response => response.json())
.then(data => {
        showCars(data.products);
})
.catch(error => {
    console.error('Error en la obtención de los datos', error);
});

function showCars(autos){
    let divCar = document.querySelector('.auto__item'); 
    divCar.innerHTML = "";
    for(let i=0; i < autos.length; i++){
        let autoDiv = document.createElement('div');
        autoDiv.className = 'car__card';
        autoDiv.innerHTML = `
            <img src='${autos[i].image}' alt='${autos[i].name}' class='car__img'>
            <div class="car__info">
                <h3 class="car__name">${autos[i].name}</h3>
                <p class="car__desc">${autos[i].description}</p>
                <div class="car__bottom">
                    <span class="car__cost">Precio: ${autos[i].cost} ${autos[i].currency}</span>
                    <span class="car__sold">Vendidos: ${autos[i].soldCount}</span>
                </div>
            </div>
        `;
    divCar.appendChild(autoDiv);
    }
}