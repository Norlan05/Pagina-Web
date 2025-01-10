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

  // Restricción de fecha: solo hoy en adelante
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // Generar las opciones de hora
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

  generateTimeOptions();

  // **Validación del formulario**
  const validateForm = () => {
    let errors = [];

    const date = dateInput.value;
    const time = timeSelect.value;
    const phone = phoneInput.value;
    const email = emailInput.value;

    // Validaciones
    if (!date) errors.push("Por favor, selecciona una fecha.");
    if (!time) errors.push("Por favor, selecciona una hora.");

    // Validación del teléfono
    const phoneRegex = /^(\+505\d{8}|\d{8})$/;
    if (!phoneRegex.test(phone)) {
      errors.push(
        "El número de teléfono debe ser en formato +50582100905 o 82100905."
      );
    }

    return errors;
  };

  // **Mostrar alerta de errores o éxito**
  const showAlert = (message, type) => {
    const icon = type === "error" ? "error" : "success";
    Swal.fire({
      icon: icon,
      title: type === "error" ? "Error" : "Éxito",
      text: message,
      confirmButtonText: "Aceptar",
    });
  };

  // **Verificar si ya existe una reserva**
  const checkExistingReservation = async (cedula, email, date) => {
    const url = `https://Clinica.somee.com/api/CheckReservation?cedula=${cedula}&email=${email}&fecha=${date}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      return result.exists; // true si ya existe una reserva
    } catch (error) {
      console.error("Error al verificar reserva existente", error);
      return false;
    }
  };

  // **Llamada a la API para realizar la reserva**
  const sendReservation = async (data) => {
    const url = "https://Clinica.somee.com/api/Insert";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data),
      });

      // Verificamos si la respuesta es un conflicto (código 409)
      if (response.status === 409) {
        // Leer la respuesta como texto, no JSON, ya que es un mensaje de error
        const errorMessage = await response.text();
        showAlert(
          errorMessage || "Ya existe una reserva para esta fecha y hora.",
          "error"
        );
        return null;
      }

      // Si hay un error general (no es 200 o 409), lo mostramos
      if (!response.ok) {
        // Intentamos leer la respuesta como JSON
        const result = await response.text(); // Usamos text() si no es JSON
        console.error("Error en la respuesta:", result); // Para depurar la respuesta
        throw new Error(
          result || "Error en el envío de datos. Inténtalo más tarde."
        );
      }

      // Si la respuesta es exitosa
      const result = await response.json();
      showAlert(result.message || "¡Reserva realizada con éxito!", "success");
      return result;
    } catch (error) {
      console.error("Error en la llamada a la API:", error);
      showAlert(
        error.message || "Error en el envío de datos. Inténtalo más tarde.",
        "error"
      );
      return null;
    }
  };

  // **Gestión del envío del formulario**
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Limpiar errores
    phoneErrorDiv.textContent = "";
    emailErrorDiv.textContent = "";

    // Validar formulario
    const errors = validateForm();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Errores en el formulario",
        text: errors.join("\n"),
      });
      return;
    }

    // Obtener los datos del formulario
    const date = dateInput.value;
    const time = timeSelect.value;
    const cedulaValue = cedula.value;
    const emailValue = emailInput.value;

    // Verificar si ya existe una reserva con la misma cédula o correo
    const reservationExists = await checkExistingReservation(
      cedulaValue,
      emailValue,
      date
    );
    if (reservationExists) {
      showAlert(
        "Ya tienes una reserva para esta fecha. Solo se permite una reserva por día.",
        "error"
      );
      return;
    }

    // Datos de la reserva
    const reservaData = {
      nombre: firstName.value,
      apellido: lastName.value,
      correo_electronico: emailInput.value,
      numero_telefono: phoneInput.value,
      Cedula: cedulaValue,
      fecha: date,
      hora: time,
    };

    // Llamar a la API para enviar los datos
    sendReservation(reservaData).then((result) => {
      if (result) {
        form.reset();
        timeSelect.selectedIndex = 0;
      }
    });
  });
});
