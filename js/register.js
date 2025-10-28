function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function togglePasswordVisibility(inputId, iconElement) {
    const passwordInput = document.getElementById(inputId);
    const icon = iconElement.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }
}

document.querySelector('.show-password').addEventListener('click', function() {
    togglePasswordVisibility('passwordRegister', this);
});

document.querySelector('.show-password-confirm').addEventListener('click', function() {
    togglePasswordVisibility('confirmPasswordRegister', this);
});

const termsModal = document.getElementById('termsModal');
const openTermsModal = document.getElementById('openTermsModal');
const closeTermsModal = document.querySelector('.close-terms-modal');
const closeTermsBtn = document.getElementById('closeTermsBtn');
const acceptTermsBtn = document.getElementById('acceptTermsBtn');
const termsCheckbox = document.getElementById('termsCheckbox');


openTermsModal.addEventListener('click', function(e) {
    e.preventDefault();
    termsModal.showModal();
});

closeTermsModal.addEventListener('click', function() {
    termsModal.close();
});

closeTermsBtn.addEventListener('click', function() {
    termsModal.close();
});

acceptTermsBtn.addEventListener('click', function() {
    termsCheckbox.checked = true;
    termsModal.close();
    Swal.fire({
        icon: 'success',
        title: 'Términos Aceptados',
        text: 'Has aceptado los términos y condiciones.',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: 'top-end'
    });
});

termsModal.addEventListener('click', function(e) {
    if (e.target === termsModal) {
        termsModal.close();
    }
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('nameRegister').value.trim();
    const email = document.getElementById('emailRegister').value.trim();
    const password = document.getElementById('passwordRegister').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordRegister').value.trim();
    const termsAccepted = document.getElementById('termsCheckbox').checked;
    const promotionsAccepted = document.getElementById('promotionsCheckbox').checked;
    const errorMsg = document.querySelector('.error__msg');
    
    errorMsg.classList.remove('error__pass');
    errorMsg.textContent = '';
    
    if (!name || !email || !password || !confirmPassword) {
        errorMsg.classList.remove('error__pass');
        errorMsg.textContent = 'Todos los campos son obligatorios';
        return;
    }
    
    if (name.length < 2) {
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'El nombre debe tener al menos 2 caracteres';
        return;
    }
    
    if (!validarEmail(email)) {
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'El correo electrónico no tiene un formato válido';
        return;
    }
    
    if (password.length < 8) {
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'La contraseña debe tener al menos 8 caracteres';
        return;
    }
    
    if (password !== confirmPassword) {
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'Las contraseñas no coinciden';
        return;
    }
    
    if (!termsAccepted) {
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'Debes aceptar los términos y condiciones para continuar';
        return;
    }
    
    // Si llegamos aquí, el registro es válido
    let mensajePromocion = promotionsAccepted ? 
        '<br><small>Recibirás nuestras mejores ofertas y promociones.</small>' : 
        '<br><small>No recibirás promociones comerciales.</small>';
    
    Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada exitosamente!',
        html: `¡Bienvenido/a <strong>${name}</strong>!<br>Tu cuenta ha sido registrada correctamente.${mensajePromocion}<br><br>Ahora puedes iniciar sesión.`,
        confirmButtonText: 'Ir a Login',
        confirmButtonColor: '#F09100',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.setItem('emailRegistrado', email);
            sessionStorage.setItem('nombreRegistrado', name);
            sessionStorage.setItem('promocionesAceptadas', promotionsAccepted);
            window.location.href = 'login.html';
        }
    });
});