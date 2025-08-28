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
    });
});

/*document.getElementById("userId").addEventListener("change",function(){
    if(this.value === "cerrarSesion"){
        localStorage.clear();
        window.location.href = "login.html";
    }
    if(this.value === "perfil"){
        window.location.href = "my-profile.html";
    }
})*/