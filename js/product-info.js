// Obtener el productID desde la URL o localStorage
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || localStorage.getItem('productID');
}
const productID = getProductId();
localStorage.setItem('productID', productID); // Mantener actualizado

const URL = `https://japceibal.github.io/emercado-api/products/${productID}.json`;
const url_comments = `https://japceibal.github.io/emercado-api/products_comments/${productID}.json`;

let promedioValoraciones = null;
let productoGlobal = null;
let comentariosGlobal = null;

// Fetch producto
fetch(URL)
    .then(response => response.json())
    .then(data => {
        productoGlobal = data;
        mostrarProductosRelacionados(data);
        // Si los comentarios ya están, muestra el producto
        if (comentariosGlobal !== null) {
            showProducts(productoGlobal);
        }
    })
    .catch(error => {
        console.error('Error en la obtención de los datos', error);
    });

// Fetch comentarios
fetch(url_comments)
    .then(response => response.json())
    .then(comments => {
        comentariosGlobal = comments;
        mostrarComentarios(comments);
        mostrarResumenScores(comments);
        // Si el producto ya está, muestra el producto
        if (productoGlobal !== null) {
            showProducts(productoGlobal);
        }
    })
    .catch(error => {
        console.error('Error en la obtención de los comentarios', error);
    });

function showProducts(products){
    let imagenes = document.querySelector('.imagenes__product');
    imagenes.innerHTML = products.images.map((element, index) => 
        `<img src='${element}' class='${index === 0 ? 'imagen-principal' : 'imagen'}'>`
    ).join('');
    let title = document.querySelector('.title');
    let soldCount = document.querySelector('.opinions');
    let description = document.querySelector('.item__description');
    title.innerHTML = products.name;
    let promedioHTML = promedioValoraciones ? ` | <span class='promedio'>Promedio: ${promedioValoraciones} ⭐</span>` : '';
    soldCount.innerHTML = `<p><span class='cost__product'>${products.cost} ${products.currency}</span> (${products.soldCount} vendidos) ${promedioHTML}</p>`;
    description.innerHTML = `<h4>Descripción: </h4>${products.description}`;

    // Asigna el listener de zoom a las imágenes recién agregadas
    document.querySelectorAll('.imagenes__product img').forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-img');
            modalImg.src = this.src;
            modal.style.display = 'flex';
        });
    });
}

function mostrarResumenScores(comments) {
    const scores = [0, 0, 0, 0, 0]; 
    let totalScore = 0;
    comments.forEach(comment => {
        if (comment.score >= 1 && comment.score <= 5) {
            scores[comment.score - 1]++;
            totalScore += comment.score;
        }
    });
    let scoreResenias = '<h4>Calificaciones</h4><ul>';
    for (let i = 5; i >= 1; i--) {
        const cantidad = scores[i - 1];
        scoreResenias += `<li>
            ${i} ⭐: ${cantidad}
            <progress value="${cantidad}" max="${comments.length}"></progress>
        </li>`;
    }
    scoreResenias += '</ul>';
    promedioValoraciones = comments.length > 0 ? (totalScore / comments.length).toFixed(2) : null;
    document.querySelector('.cant__resenias').innerHTML = scoreResenias;
}

function mostrarComentarios(comments){
    let resenias = document.querySelector('.resenias_de_usuarios');
    resenias.innerHTML = '<h4>Reseñas de Usuarios</h4>';
    if(!comments || comments.length === 0){
        resenias.innerHTML += '<p>No existen reseñas para este producto.</p>';
        return;
    }
    comments.forEach(comment =>{
        resenias.innerHTML += `
            <div class="comentario">
                <p><strong>${comment.user}</strong> - ${comment.dateTime}</p>
                <p>${comment.description}</p>
                <p>Calificación: ${comment.score} ⭐</p>
            </div>
        `;
    });
}

function mostrarProductosRelacionados(product){
    let related_products = document.querySelector('.productos__relacionados');
    related_products.innerHTML = '<h4>Productos Relacionados</h4><br>';
    if(!product.relatedProducts || product.relatedProducts.length === 0){
        related_products.innerHTML += '<p>No existen productos relacionados</p>';
        return;
    }
    product.relatedProducts.forEach(prod =>{
        related_products.innerHTML += `
            <div class='relacionados'>
                <img src='${prod.image}' class='relacionados_imagen' alt='Imagen de ${prod.name}' data-id='${prod.id}'>
                <p>${prod.name}</p>
            </div>
        `;
    });
    document.querySelectorAll('.relacionados_imagen').forEach(img => {
        img.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            localStorage.setItem('productID', id);
            window.location.href = `product-info.html?id=${id}`;
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Interacción de estrellas
    const stars = document.querySelectorAll('.star-rating .bi-star');
    let selected = -1;
    stars.forEach((star, idx) => {
        star.addEventListener('mouseover', () => {
            stars.forEach((s, i) => s.classList.toggle('selected', i <= idx));
        });
        star.addEventListener('mouseout', () => {
            stars.forEach((s, i) => s.classList.toggle('selected', i <= selected));
        });
        star.addEventListener('click', () => {
            selected = idx;
            stars.forEach((s, i) => s.classList.toggle('selected', i <= selected));
        });
    });

    // Listeners para el modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('image-modal').style.display = 'none';
    });
    document.getElementById('image-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});