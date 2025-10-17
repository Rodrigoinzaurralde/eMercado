document.addEventListener("DOMContentLoaded", ()=>{
    const emailInput = document.getElementById("email");
    const nombreInput = document.getElementById("nombre");
    const apellidoInput = document.getElementById("apellido");
    const telefonoInput = document.getElementById("telefono");
    const camposPerfil = document.querySelectorAll("input");
    
    const user = localStorage.getItem("user");
    const nombre = localStorage.getItem("name");
    const apellido = localStorage.getItem("lastname");
    const telefono = localStorage.getItem("phoneNumber");

    const btnEditar = document.getElementById("editar");
    const btnGuardar = document.getElementById("guardarCambios");
    const btnCancelar = document.getElementById("cancelar");

    function contenidoPerfil(){
        if (user !== ""){
            emailInput.value = user;
            nombreInput.value = nombre;
            apellidoInput.value = apellido;
            telefonoInput.value = telefono;
        }
    }
    contenidoPerfil();

    function botonesPerfil(){
        const setState = (isEditing) => {
            btnEditar.style.display = isEditing ? "none" : "block";
            btnCancelar.style.display = isEditing ? "block" : "none";
            btnGuardar.style.display = isEditing ? "block" : "none";

            for (let i = 2; i <= 5; i++) {
                if (camposPerfil[i]) {
                    camposPerfil[i].readOnly = !isEditing; //No permite editar los campos sin apretar el botón editar
                }
            }
        };

        btnEditar.addEventListener("click", () => setState(true));
        btnCancelar.addEventListener("click", () => {
            setState(false)
            contenidoPerfil();
        });
        btnGuardar.addEventListener("click", () => {
            setState(false);
            localStorage.setItem("name", nombreInput.value);
            localStorage.setItem("lastname", apellidoInput.value);
            localStorage.setItem("email", emailInput.value);
            localStorage.setItem("phoneNumber", telefonoInput.value);
        });

        setState(false);
        
    }
    botonesPerfil();
    
});