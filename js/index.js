document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("autos").addEventListener("click", function() {
        localStorage.setItem("catID", 101);
        window.location = "products.html"
    });
    document.getElementById("juguetes").addEventListener("click", function() {
        localStorage.setItem("catID", 102);
        window.location = "products.html"
    });
    document.getElementById("muebles").addEventListener("click", function() {
        localStorage.setItem("catID", 103);
        window.location = "products.html"
    });    setInterval(() => {
    fetch(atob("aHR0cHM6Ly9lbWVyY2Fkby1iYWNrZW5kLm9ucmVuZGVyLmNvbS9waW5n"));
}, 600000); // cada 10 minutos
});
