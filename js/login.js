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
        Username: usernameInput.value, // Cambié "email" por "Username" para coincidir con la API
        Password: passwordInput.value, // Cambié "password" para coincidir con la API
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Imprimir la respuesta para depuración

        // Comprobar si la respuesta tiene el mensaje de acceso correcto
        if (data.message === "Acceso correcto") {
          Swal.fire({
            icon: "success",
            title: "¡Bienvenido!",
            text: "Acceso exitoso.",
          }).then(() => {
            // Redirigir a la página principal o dashboard
            window.location.href = "registrocitas.html"; // Cambia la URL según tu ruta
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
