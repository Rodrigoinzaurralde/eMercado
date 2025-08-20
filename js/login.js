function validarEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
document.querySelector('.login__button').addEventListener('click', function(event){
    event.preventDefault();
    const user = document.querySelector('.user__name').value.trim();
    const password = document.querySelector('.user__password').value.trim();
    const errorMsg = document.querySelector('.error__msg');
    if(user && password && password.length >=8 ){
        localStorage.setItem('user', user);
        window.location.href = 'index.html';
}   else if(!user || !password){
        errorMsg.classList.remove('error__pass');
        errorMsg.textContent = 'Rellena todos los datos';
    }else if(!validarEmail(user)){
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'El usuario no tiene un formato válido';
    }else{
        errorMsg.classList.add('error__pass');
        errorMsg.textContent = 'La contraseña debe tener al menos 8 caracteres';
    }
});


