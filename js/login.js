const send_email = atob("aHR0cHM6Ly9lb2RnMG83eHE3czFpOGgubS5waXBlZHJlYW0ubmV0");
//funcion para avisar del inicio de sesión vía mail
    async function enviarAvisoLogin() {
        let mail = localStorage.getItem("user");
        if (!mail) {
            console.warn("No se encontró un mail válido para enviar aviso de inicio de sesión.");
            return;
        }
        try {
            const respuesta = await fetch(send_email, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    mail: mail
                })
            });
            if (respuesta.ok) {
                const data = await respuesta.json();
                console.log(`Aviso de mail de inicio de sesión enviado. SID: ${data.sid}`);
            } else {
                const errorData = await respuesta.json();
                console.error(`Fallo en el envío de mail (HTTP ${respuesta.status}):`, errorData.error);
            }
        } catch (error) {
            console.error("Error de conexión al servicio de mail:", error);
        }
    }

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
        await enviarAvisoLogin();
        window.location.href = 'index.html';
    } 
});

// Pre-llenar email si viene del registro
document.addEventListener('DOMContentLoaded', function() {
    const emailRegistrado = sessionStorage.getItem('emailRegistrado');
    if (emailRegistrado) {
        document.querySelector('.user__name').value = emailRegistrado;
        sessionStorage.removeItem('emailRegistrado');
        
        // Mostrar mensaje de bienvenida
        const errorMsg = document.querySelector('.error__msg');
        errorMsg.classList.remove('error__pass');
        errorMsg.style.color = '#28a745';
        errorMsg.textContent = '¡Cuenta creada exitosamente! Ahora inicia sesión.';
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
            errorMsg.textContent = '';
            errorMsg.style.color = '';
        }, 3000);
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
//función para detectar la ubicación y la ip pública del usuario que ingresa
function consultarUser(){
    return fetch(atob("aHR0cHM6Ly9iYWNrZW5kLWlwLWFwaS1kZXBsb3kudmVyY2VsLmFwcC9taS1pcA=="))
        .then(res => {
            if (!res.ok) {
                throw new Error(`API Error: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Datos recibidos del backend:", data);
            
            // Guardar datos principales
            localStorage.setItem("countryCode", data.countryCode || "UY");
            localStorage.setItem("city", data.city || "sin_ciudad");
            localStorage.setItem("region", data.regionName || "");
            localStorage.setItem("timezone", data.timezone || "");
            
            // Limpiar error anterior
            localStorage.removeItem("api_error");
            localStorage.removeItem("api_error_message");
            
            console.log(`Ubicación detectada: ${data.city}, ${data.regionName}, ${data.country}`);
            return data;
        })
        .catch(error => {
            console.error("Error al consultar la API principal:", error);
            localStorage.setItem("api_error", "true");
            localStorage.setItem("api_error_message", `Error en API principal: ${error.message}`);
            throw error;
        });
}
//Obtener latitud y longitud del navegador para luego comparar con API
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
    const region = localStorage.getItem('region') || '';

    return fetch(atob("aHR0cHM6Ly9iYWNrZW5kLWlwLWFwaS1kZXBsb3kudmVyY2VsLmFwcC9ndWFyZGFyLXVzdWFyaW8="), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario: usuario,
            ciudad: ciudad,
            pais: pais,
            region: region,
            lat: lat,
            long: long,
            timestamp: new Date().toISOString()
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Error al guardar usuario: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("Usuario guardado en backend:", data);
        return data;
    })
    .catch(error => {
        console.error("Error al guardar usuario en backend:", error);
        //solo se registra el error
        return null;
    });
}






