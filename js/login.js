document.addEventListener("DOMContentLoaded", function () {
  // Obtener los elementos del formulario
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // Obtener el formulario y agregar el evento de envío
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevenir el envío tradicional del formulario

    // Validación básica de los campos
    if (usernameInput.value === "" || passwordInput.value === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, complete todos los campos.",
      });
      return;
    }

    // Enviar los datos del formulario a la API
    fetch("https://Clinica.somee.com/api/LoginWeb/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Asegura que los datos sean enviados como JSON
      },
      body: JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Verifica la respuesta de la API en la consola

        // Comprobar si la respuesta tiene el mensaje de acceso correcto
        if (data.message === "Acceso correcto") {
          // Guardar el correo en sessionStorage
          const correoUsuario = data.correo;
          sessionStorage.setItem("correoUsuario", correoUsuario); // Guardamos el correo en sessionStorage

          // Mostrar el correo en la consola para verificar
          console.log("Correo del usuario: ", correoUsuario);

          Swal.fire({
            icon: "success",
            title: "¡Bienvenido!",
            text: "Acceso exitoso.",
          }).then(() => {
            // Redirigir a la página principal o dashboard, pasando el correo por URL
            window.location.href = `Historial-Paciente.html?correo=${encodeURIComponent(
              correoUsuario
            )}`;
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message || "Credenciales inválidas.",
          });
        }
      })
      .catch((error) => {
        // Capturar errores en la solicitud
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al procesar la solicitud. Intenta nuevamente.",
        });
      });
  });
});
