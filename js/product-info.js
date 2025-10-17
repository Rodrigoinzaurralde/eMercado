import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDztICeC_2I7lEd7PLYtIxsZ0FmYtDIWEI",
    authDomain: "comentarios-351d5.firebaseapp.com",
    projectId: "comentarios-351d5",
    storageBucket: "comentarios-351d5.firebasestorage.app",
    messagingSenderId: "214528495023",
    appId: "1:214528495023:web:40dea55ef34a476c1cf35a",
    measurementId: "G-HD1RQ5B6GW"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtener el productID desde la URL o localStorage
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || localStorage.getItem('productID');
}
const productID = getProductId();
localStorage.setItem('productID', productID);

const URL = `https://japceibal.github.io/emercado-api/products/${productID}.json`;
const url_comments = `https://japceibal.github.io/emercado-api/products_comments/${productID}.json`;

let promedioValoraciones = null;
let productoGlobal = null;
let comentariosGlobal = null;
async function cargarComentariosFirestore() {
    const q = query(
        collection(db, "comentarios"),
        where("productID", "==", productID),
        orderBy("dateTime", "desc")
    );
    const querySnapshot = await getDocs(q);
    let firestoreComments = [];
    querySnapshot.forEach((doc) => {
        firestoreComments.push(doc.data());
    });

    // Cargar comentarios de la API
    let apiComments = [];
    try {
        const response = await fetch(url_comments);
        apiComments = await response.json();
    } catch (e) {
        console.error("Error cargando comentarios de la API", e);
    }
// combino comentarios de dbFirestone y la API
    comentariosGlobal = [...firestoreComments, ...apiComments];

    mostrarComentarios(comentariosGlobal);
    mostrarResumenScores(comentariosGlobal);

    // Si el producto ya está cargado, mostrarlo
    if (productoGlobal) {
        showProducts(productoGlobal);
    }
}

// Fetch producto
fetch(URL)
    .then(response => response.json())
    .then(data => {
        productoGlobal = data;
        mostrarProductosRelacionados(data);
        showProducts(productoGlobal);
    })
    .catch(error => {
        console.error('Error en la obtención de los datos', error);
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
    // zoom imagenes
    document.querySelectorAll('.imagenes__product img').forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-img');
            modalImg.src = this.src;
            modal.style.display = 'flex';
        });
    });
    mostrarCarruselBootstrap(products.images);
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
    const usuarioActual = localStorage.getItem('user');
    const imagenPerfilActual = localStorage.getItem('profileImg');
    comments.forEach(comment =>{
        let imgSrc = (comment.user === usuarioActual && imagenPerfilActual)
        ? imagenPerfilActual
        : 'https://i.imgur.com/DKqWBPS.png'
        resenias.innerHTML += `
            <div class="comentario">
                <div class="comentario-header">
                    <img src="${imgSrc}" class="comentario-avatar">
                    <p><strong>${comment.user}</strong> - ${comment.dateTime}</p>
                </div>
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

function mostrarCarruselBootstrap(imagenes) {
    const carruselContainer = document.getElementById('imagenes-carrusel-container');
    if (!carruselContainer) return;
    carruselContainer.innerHTML = '';
    if (window.innerWidth > 1300 || !imagenes || imagenes.length === 0) return;

    let indicators = '';
    let items = '';
imagenes.forEach((img, idx) => {
    const esActivo = idx === 0;
    const clase = esActivo ? 'class="active"' : '';
    const ariaCurrent = esActivo ? 'true' : 'false';
    const label = `Slide ${idx + 1}`;

    indicators += `<button type="button" data-bs-target="#imagenesCarrusel" data-bs-slide-to="${idx}" ${clase} aria-current="${ariaCurrent}" aria-label="${label}"></button>`;

    const itemClase = esActivo ? 'carousel-item active' : 'carousel-item';
    items += `<div class="${itemClase}">
        <img src="${img}" class="d-block w-100" alt="Imagen ${idx + 1}">
    </div>`;
});

    carruselContainer.innerHTML = `
        <div id="imagenesCarrusel" class="carousel slide imagenes-carrusel" data-bs-ride="carousel">
            <div class="carousel-indicators">
                ${indicators}
            </div>
            <div class="carousel-inner">
                ${items}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#imagenesCarrusel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
                <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#imagenesCarrusel" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
                <span class="visually-hidden">Siguiente</span>
            </button>
        </div>
    `;
}
window.addEventListener('resize', () => {
    if (productoGlobal) {
        mostrarCarruselBootstrap(productoGlobal.images);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.resenias .bi-star');
    let comentarioScore = 0;
    stars.forEach((star, idx) => {
        star.addEventListener('mouseover', () => {
            stars.forEach((s, i) => s.classList.toggle('selected', i <= idx));
        });
        star.addEventListener('mouseout', () => {
            stars.forEach((s, i) => s.classList.toggle('selected', i < comentarioScore));
        });
        star.addEventListener('click', () => {
            comentarioScore = idx + 1;
            stars.forEach((s, i) => s.classList.toggle('selected', i < comentarioScore));
        });
    });

    // Enviar comentario a Firestore
    document.getElementById('botonComentarioID').addEventListener('click', async function() {
        const texto = document.getElementById('comentarioID').value.trim();
        if (comentarioScore === 0 || texto === "") {
            alert("Debes seleccionar una calificación y escribir un comentario.");
            return;
        }
        const usuario = localStorage.getItem('user') || 'Usuario';
        const fecha = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const imagenPerfil = localStorage.getItem('profileImg') || null;

        const nuevoComentario = {
            user: usuario,
            dateTime: fecha,
            description: texto,
            score: comentarioScore,
            productID: productID
        };

        await addDoc(collection(db, "comentarios"), nuevoComentario);

        cargarComentariosFirestore();

        document.getElementById('comentarioID').value = "";
        comentarioScore = 0;
        stars.forEach(s => s.classList.remove('selected'));
    });

    function moverTituloMovil() {
    const title = document.querySelector('.title');
    const description = document.querySelector('.product__description')
    const carrusel = document.getElementById('imagenes-carrusel-container');
    if (!title || !carrusel) return;

    if (window.innerWidth <= 1024) {
        // Mueve el título debajo del carrusel
        carrusel.insertAdjacentElement('afterend', title);
        title.insertAdjacentElement('afterend', description);
    }
}
window.addEventListener('resize', moverTituloMovil);
document.addEventListener('DOMContentLoaded', moverTituloMovil);

    // Al cargar la página, carga los comentarios desde Firestore
    cargarComentariosFirestore();

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

console.log(localStorage.getItem('profileImg'));