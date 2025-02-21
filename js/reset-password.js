document.addEventListener("DOMContentLoaded", function () {
  // Obtener el formulario y el campo de correo electrónico
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const emailInput = document.getElementById("email");

  // Comprobar si los elementos existen
  if (!resetPasswordForm || !emailInput) {
    console.error("Formulario o campo de correo no encontrado");
    return; // Si no se encuentra el formulario o campo, detener la ejecución
  }

  // Añadir evento de submit al formulario
  resetPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Evita el envío del formulario por defecto

    const email = emailInput.value; // Obtener el valor del correo electrónico

    if (!email) {
      alert("Por favor, ingresa tu correo electrónico");
      return;
    }

    // Realiza la llamada a la API de restablecimiento de contraseña
    fetch("https://Clinica.somee.com/api/Reset/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          // Si la respuesta contiene un mensaje, redirige al login
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Se ha enviado un correo para restablecer tu contraseña.",
            confirmButtonText: "Aceptar",
          }).then(() => {
            window.location.href = "Reset_Contraseña.html";
          });
        } else {
          // Si hay un error, mostrar mensaje
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error_text || "Hubo un problema con la solicitud.",
            confirmButtonText: "Aceptar",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al procesar tu solicitud. Intenta nuevamente.",
          confirmButtonText: "Aceptar",
        });
      });
  });
});
