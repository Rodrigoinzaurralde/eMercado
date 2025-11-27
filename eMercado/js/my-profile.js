document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const nombreInput = document.getElementById("nombre");
  const apellidoInput = document.getElementById("apellido");
  const telefonoInput = document.getElementById("telefono");
  const camposPerfil = [emailInput, nombreInput, apellidoInput, telefonoInput];

  const user = localStorage.getItem("user");
  const nombre = localStorage.getItem("name");
  const apellido = localStorage.getItem("lastname");
  const telefono = localStorage.getItem("phoneNumber");

  const btnSubirFoto = document.getElementById("subirImg");
  const btnTomarFoto = document.getElementById("tomarFoto");
  const fileInput = document.getElementById("fileInput");
  const cameraInput = document.getElementById("cameraInput");
  const profileImg = document.querySelector(".profile-img");
  const img = localStorage.profileImg;
  if (img) {
    profileImg.style.backgroundImage = `url(${img})`;
    profileImg.style.backgroundSize = "cover";
    profileImg.style.backgroundPosition = "center";
  }

  const btnEditar = document.getElementById("editar");
  const btnGuardar = document.getElementById("guardarCambios");
  const btnCancelar = document.getElementById("cancelar");

  function subirFoto() {
    btnSubirFoto.addEventListener("click", () => {
      fileInput.click();
    });

    // Al seleccionar una imagen
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];

      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = (event) => {
          // Insertar la imagen como background del div
          localStorage.setItem("profileImg", event.target.result);
          profileImg.style.backgroundImage = `url(${event.target.result})`;
          profileImg.style.backgroundSize = "cover";
          profileImg.style.backgroundPosition = "center";
        };

        reader.readAsDataURL(file);
      }
    });
  }
  subirFoto();

  function contenidoPerfil() {
    if (user !== "") {
      emailInput.value = user;
      nombreInput.value = nombre;
      apellidoInput.value = apellido;
      telefonoInput.value = telefono;
    }
  }
  contenidoPerfil();

  function botonesPerfil() {
    const setState = (isEditing) => {
      btnEditar.style.display = isEditing ? "none" : "block";
      btnCancelar.style.display = isEditing ? "block" : "none";
      btnGuardar.style.display = isEditing ? "block" : "none";

      for (let input of camposPerfil) {
        if (input) {
          input.readOnly = !isEditing; //No permite editar los campos sin apretar el botón editar
        }
      }
    };

    btnEditar.addEventListener("click", () => setState(true));
    btnCancelar.addEventListener("click", () => {
      setState(false);
      contenidoPerfil();
    });

    // Validación para el teléfono - solo números
    telefonoInput.addEventListener("input", (e) => {
      // Remueve cualquier caracter que no sea número
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    });

    // Validación para el email
    emailInput.addEventListener("input", (e) => {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailValido.test(e.target.value)) {
        emailInput.style.borderColor = "red";
      } else {
        emailInput.style.borderColor = "initial";
      }
    });

    // Validar antes de guardar
    btnGuardar.addEventListener("click", () => {
      const validarEmail = /^[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z]{2,8}$/;
      if (validarEmail.test(emailInput.value)) {
        localStorage.setItem("email", emailInput.value);
        setState(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor, ingrese un email válido",
        });
        setState(true);
        return;
      }

      if (
        telefonoInput.value.length === 9 &&
        /^\d+$/.test(telefonoInput.value)
      ) {
        localStorage.setItem("phoneNumber", telefonoInput.value);
        setState(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "El teléfono no es correcto",
        });
        setState(true);
        return;
      }
      Swal.fire({
        icon: "success",
        title: "¡Guardado con exito!",
        text: "Cambios aplicados correctamente",
      });
    });
    /*let numero = telefonoInput.value;
      if ((numero && numero !== "")) {
        numero = numero.replace(/^0+/, "");
        const telefonoUruguay = "+598" + numero;
        localStorage.setItem("phoneNumber", telefonoUruguay);*/

    setState(false);
  }
  botonesPerfil();

  const btnBorrar = document.getElementById("borrarID");

  btnBorrar.addEventListener("click", () => {
    localStorage.removeItem("profileImg");
    profileImg.style.backgroundImage = "";
  });
  //Tomar foto en tiempo real
  let video, canvas, btnCapturar, btnCerrarCamara;
  function mostrarCamara() {
    if (!video) {
      video = document.createElement("video");
      video.autoplay = true;
      video.style.width = "100%";
      video.style.maxWidth = "180px";
      video.style.borderRadius = "20px";
      video.setAttribute("playsinline", "");

      btnCapturar = document.createElement("button");
      btnCapturar.textContent = "Foto";
      //btnCapturar.style.marginRight = "8px";
      btnCapturar.className = "btn-camara";
      btnCapturar.classList.add("btn-sacarFoto");

      btnCerrarCamara = document.createElement("button");
      btnCerrarCamara.textContent = "Cerrar";
      btnCerrarCamara.className = "btn-camara";
      btnCerrarCamara.classList.add("btn-cerrarCamara");
      canvas = document.createElement("canvas");
      canvas.style.display = "none";
    }

    profileImg.innerHTML = "";
    profileImg.appendChild(video);
    const divBotonesCamara = document.createElement("div");
    divBotonesCamara.className = "botones-camara";
    divBotonesCamara.appendChild(btnCapturar);
    divBotonesCamara.appendChild(btnCerrarCamara);

    profileImg.appendChild(divBotonesCamara);
    profileImg.appendChild(canvas);

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Error de cámara",
          text: "No se pudo acceder a la cámara: " + err.message,
        });
      });

    btnCapturar.onclick = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      const fotoDataUrl = canvas.toDataURL("image/png");
      localStorage.setItem("profileImg", fotoDataUrl);
      profileImg.style.backgroundImage = `url(${fotoDataUrl})`;
      profileImg.style.backgroundSize = "cover";
      profileImg.style.backgroundPosition = "center";
      canvas.style.display = "none";
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      profileImg.innerHTML = "";
    };

    btnCerrarCamara.onclick = () => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      profileImg.innerHTML = "";
      const img = localStorage.profileImg;
      if (img) {
        profileImg.style.backgroundImage = img;
        profileImg.style.backgroundSize = "cover";
        profileImg.style.backgroundPosition = "center";
      }
    };
  }
  let p_ubicacion = document.querySelector(".ubicacion__user");
  let ubicacion = localStorage.getItem("city");
  p_ubicacion.innerHTML = "";
  p_ubicacion.innerHTML = `Su dirección de envío registrada es: <strong>${ubicacion}</strong>`;

  btnTomarFoto.addEventListener("click", mostrarCamara);
});
