function validarEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
document.querySelector('.login__button').addEventListener('click', function(event){
    event.preventDefault();
    const user = document.querySelector('.user__name').value.trim();
    const password = document.querySelector('.user__password').value.trim();
    const errorMsg = document.querySelector('.error__msg');
    if(!user || !password){
        errorMsg.classList.remove('error__pass');
        errorMsg.textContent = 'Rellena todos los datos';
    }else if(!validarEmail(user)){
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'El usuario no tiene un formato válido';
    }else if(password.length < 8){
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'La contraseña debe tener al menos 8 caracteres';
    }else{
        localStorage.setItem('user', user);
        consultarUser().then(() => {
            window.location.href = 'index.html';
        });
    }
});

const passwordInput = document.getElementById('passwordId');
const passwordLabel = document.querySelector('label[for="passwordId"]');

function updateLabelColor() {
    if (!passwordInput.checkValidity() && passwordInput === document.activeElement) {
    passwordLabel.style.color = '#B90000';
    } else {
    passwordLabel.style.color = '';
    }
}
passwordInput.addEventListener('focus', updateLabelColor);
passwordInput.addEventListener('input', updateLabelColor);
passwordInput.addEventListener('blur', updateLabelColor);

document.querySelector('.input-group-text').addEventListener('click', function(){
    const passwordInput = document.getElementById('passwordId');
    const icon = this.querySelector('i');
    if(passwordInput.type === 'password'){
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    } else{
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }
});
function consultarUser(){
    return fetch("https://98bde383-43b6-4428-bc39-4332b6f161fa-00-3n8s0keoycuru.worf.replit.dev/mi-ip")
        .then(res => res.json())
        .then(data => {
            console.log("Datos recibidos del backend:", data);
            let moneda = "USD";
            localStorage.setItem("monedaUsuario", moneda);
            localStorage.setItem("countryCode", data.countryCode);
            localStorage.setItem("city", data.city || "sin_ciudad");
            console.log("País detectado:", data.country, "Moneda:", moneda);
            return guardarUsuarioEnBackend();
        })
        .catch(error => {
            console.error("Error al consultar la API", error);
        });
    }
    
//Guardar usuarios en el backend
function guardarUsuarioEnBackend() {
    const usuario = localStorage.getItem('user');
    const ciudad = localStorage.getItem('city') || 'sin_ciudad';
    const pais = localStorage.getItem('countryCode') || 'sin_pais';

    return fetch("https://98bde383-43b6-4428-bc39-4332b6f161fa-00-3n8s0keoycuru.worf.replit.dev/guardar-usuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": "1234"
        },
        body: JSON.stringify({
            usuario: usuario,
            ciudad: ciudad,
            pais: pais
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Respuesta al guardar usuario:", data);
    })
    .catch(error => {
        console.error("Error al guardar usuario:", error);
    });
}





