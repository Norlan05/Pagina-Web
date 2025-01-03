document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");
  const firstName = document.getElementById("first-name");
  const lastName = document.getElementById("last-name");
  const dateInput = document.getElementById("date");
  const cedula = document.getElementById("cedula");
  const timeSelect = document.getElementById("time");
  const phoneInput = document.getElementById("phone");
  const phoneErrorDiv = document.getElementById("phone-error");
  const emailInput = document.getElementById("email");
  const emailErrorDiv = document.getElementById("email-error");

  // Restringir la fecha solo a hoy en adelante
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // Generar opciones de tiempo en intervalos de 1 hora
  const generateTimeOptions = () => {
    const start = 8; // Hora de inicio: 8:00 AM
    const end = 19; // Hora de fin: 7:00 PM

    timeSelect.innerHTML =
      '<option value="" disabled selected>Selecciona la Hora</option>';
    for (let hour = start; hour < end; hour++) {
      let hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
      let period = hour < 12 ? "AM" : "PM";

      timeSelect.appendChild(
        new Option(
          `${hourFormatted}:00 ${period}`,
          `${hourFormatted}:00 ${period}`
        )
      );
    }
  };

  // Generar las opciones de hora al cargar la página
  generateTimeOptions();

  // **Función para actualizar las reservas**
  // (Eliminamos esta función ya que no se usa el localStorage)

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Obtener los datos del formulario
    const date = dateInput.value;
    const time = timeSelect.value;
    const phone = phoneInput.value;
    const email = emailInput.value;
    const cedulaValue = cedula.value;

    let isValid = true;

    // **Validaciones**
    if (!date) {
      showAlert("Por favor, selecciona una fecha.", "error");
      isValid = false;
    }

    if (!time) {
      showAlert("Por favor, selecciona una hora.", "error");
      isValid = false;
    }

    // Validación de número de teléfono
    const phoneRegex = /^(\+505\d{8}|\d{8})$/; // Permite +505 opcional seguido de 8 dígitos
    if (!phoneRegex.test(phone)) {
      phoneErrorDiv.textContent =
        "El número de teléfono debe ser en formato +50582100905 o 82100905.";
      isValid = false;
    } else {
      phoneErrorDiv.textContent = ""; // Limpia el mensaje de error si es válido
    }

    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      emailErrorDiv.textContent = "Por favor ingresa un correo válido.";
      isValid = false;
    } else {
      emailErrorDiv.textContent = ""; // Limpia el mensaje de error si es válido
    }

    if (!isValid) {
      Swal.fire({
        icon: "error",
        title: "Errores en el formulario",
        text: "Por favor, corrige los errores antes de enviar.",
      });
      return;
    }

    // Construir el objeto con los datos para enviar al servidor
    const reservaData = {
      nombre: firstName.value,
      apellido: lastName.value,
      correo_electronico: email,
      numero_telefono: phone,
      Cedula: cedulaValue,
      fecha: date,
      hora: time,
    };

    // Llamar a la API
    get_parameter(reservaData);

    showAlert("¡Reserva realizada con éxito!", "success");
    form.reset();
    phoneErrorDiv.textContent = "";
    emailErrorDiv.textContent = "";
    timeSelect.selectedIndex = 0;
  });

  // **Llamada a la API**
  async function get_parameter(data) {
    const url = "https://Clinica.somee.com/api/Insert"; // Cambiar por la URL correcta de tu API

    try {
      const response = await fetch(url, {
        method: "POST",

        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        showAlert("Error al enviar los datos. Inténtalo de nuevo.", "error");
        return;
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(error);
      showAlert("Error en el envío de datos. Inténtalo más tarde.", "error");
    }
  }

  // Mostrar alertas
  function showAlert(message, type) {
    const icon = type === "error" ? "error" : "success";
    Swal.fire({
      icon: icon,
      title: type === "error" ? "Error" : "Éxito",
      text: message,
      confirmButtonText: "Aceptar",
    });
  }
});
