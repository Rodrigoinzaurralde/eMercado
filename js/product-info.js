const productID = localStorage.getItem('productID');
const URL = `https://japceibal.github.io/emercado-api/products/${productID}.json`;
fetch(URL)
.then(response => response.json())
.then(data => {
        showCar(data);
})
.catch(error => {
    console.error('Error en la obtención de los datos', error);
});

function showCar(auto){
    let divCar = document.querySelector('.auto__item');
    divCar.innerHTML = "";
    const monedaUsuario = localStorage.getItem('monedaUsuario') || 'USD';

    let carouselInner = auto.images.map((img, idx) => `
        <div class="carousel-item${idx === 0 ? ' active' : ''}">
            <img src="${img}" class="d-block w-100 car__img" alt="${auto.name}">
        </div>
    `).join('');

    let carousel = `
        <div id="carImagesCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                ${carouselInner}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carImagesCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carImagesCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
            </button>
        </div>
    `;

    let autoDiv = document.createElement('div');
    autoDiv.className = 'car__card';
    autoDiv.id = 'carInfoCard';
    autoDiv.innerHTML = `
        ${carousel}
        <div class="car__info">
            <h3 class="car__name">${auto.name}</h3>
            <p class="car__desc">${auto.description}</p>
            <div class="car__bottom">
                <span class="car__cost">Precio: ${auto.cost} ${monedaUsuario}</span>
                <span class="car__sold">Vendidos: ${auto.soldCount}</span>
            </div>
        </div>
    `;
    divCar.appendChild(autoDiv);
}