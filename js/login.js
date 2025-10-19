document.addEventListener("DOMContentLoaded", () => {
    const RENDER_SMS_API = "https://emercado-backend.onrender.com/enviar-sms";

    async function enviarAvisoLogin() {
        let telefono = localStorage.getItem("phoneNumber");
        if (!telefono) {
            console.warn("No se encontró número de teléfono para enviar aviso de inicio de sesión.");
            return;
        }
        if (!telefono.startsWith("+598")) {
            telefono = "+598" + telefono.replace(/^0+/, "");
        }
        const mensaje = "Se realizó un nuevo inicio de sesión en tu cuenta de eMercado. Si no fuiste tú, contacta con nosotros y cambia tu contraseña.";
        try {
            const respuesta = await fetch(RENDER_SMS_API, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    telefono: telefono,
                    mensaje: mensaje
                })
            });
            if (respuesta.ok) {
                const data = await respuesta.json();
                console.log(`✅ Aviso de SMS de inicio de sesión enviado. SID: ${data.sid}`);
            } else {
                const errorData = await respuesta.json();
                console.error(`❌ Fallo en el envío de SMS (HTTP ${respuesta.status}):`, errorData.error);
            }
        } catch (error) {
            console.error("❌ Error de conexión al servicio de SMS de Render:", error);
        }
    }
    
    enviarAvisoLogin();
});


function validarEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
document.querySelector('.login__button').addEventListener('click', async function(event){
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
        const {lat, long} = await obtenerLatLong();
        await consultarUser();
        await guardarUsuarioEnBackend(lat, long);
        window.location.href = 'index.html';
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
    return fetch("https://backend-ip-api.onrender.com/mi-ip")
        .then(res => {
            return res.json();
        })
        .then(data => {
            console.log("Datos recibidos del backend:", data);
            localStorage.setItem("countryCode", data.countryCode);
            localStorage.setItem("city", data.city || "sin_ciudad");
            console.log("País detectado:", data.country, "Moneda:", moneda);
        })
        .catch(error => {
            console.error("Error al consultar la API", error);
        });
}
//Obtener latitud y longitud del navegador para comparar con API
function obtenerLatLong(){
    return new Promise((resolve) => {
    if('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(
            function(position){
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            console.log('Ubicacion GPS:', lat, long);

            //Guardamos en el localStorage
            localStorage.setItem('lat', lat);
            localStorage.setItem('long', long);
            resolve({ lat, long })
            },
            function(error) {
            console.error('Error al obtener la ubicacion GPS', error.message);
            resolve({ lat: null, long: null });
            }
        );
        } else{
            console.log('Geolocalizacion no soportada en este navegador');
            resolve({ lat: null, long: null });
        }
    });
}
    
//Guardar usuarios en el backend
function guardarUsuarioEnBackend(lat , long) {
    const usuario = localStorage.getItem('user');
    const ciudad = localStorage.getItem('city') || 'sin_ciudad';
    const pais = localStorage.getItem('countryCode') || 'sin_pais';

    return fetch("https://backend-ip-api.onrender.com/guardar-usuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario: usuario,
            ciudad: ciudad,
            pais: pais,
            lat: lat,
            long: long
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






