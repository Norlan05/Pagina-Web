document.addEventListener("DOMContentLoaded", function () {
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const emailInput = document.getElementById("email");
  const resetTokenInput = document.getElementById("resetToken");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  resetPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Validación básica
    if (newPasswordInput.value !== confirmPasswordInput.value) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    if (newPasswordInput.value.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }

    // Enviar los datos del formulario a la API
    fetch("https://Clinica.somee.com/api/Auth/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Asegura que los datos sean enviados como JSON
      },
      body: JSON.stringify({
        email: emailInput.value,
        resetToken: resetTokenInput.value,
        newPassword: newPasswordInput.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Imprimir la respuesta para depuración

        if (data.message === "Contraseña restablecida con éxito") {
          Swal.fire({
            icon: "success",
            title: "¡Contraseña Restablecida!",
            text: "Tu contraseña ha sido restablecida con éxito.",
          }).then(() => {
            window.location.href = "login.html"; // Redirigir al login
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              data.message || "Hubo un problema al restablecer la contraseña.",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al procesar la solicitud. Intenta nuevamente.",
        });
      });
  });
});
