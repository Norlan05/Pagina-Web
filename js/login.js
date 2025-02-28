document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Evita el comportamiento predeterminado de enviar el formulario

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Verifica si los campos están llenos
  if (!username || !password) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor ingresa ambos campos",
    });
    return;
  }

  // Realiza la petición al backend para verificar las credenciales
  fetch("https://Clinica.somee.com/api/LoginWeb/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Username: username,
      Password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Acceso correcto") {
        // Guardar el correo en localStorage
        localStorage.setItem("userCorreo", data.correo);

        // Redirige a la página del historial si el login es exitoso
        window.location.href = "Historial-Paciente.html";
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Usuario o contraseña incorrectos",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Algo salió mal. Por favor intenta nuevamente.",
      });
    });
});
