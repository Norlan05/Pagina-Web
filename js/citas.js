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

  // Restricción de fecha mínima (solo hoy en adelante)
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // Opciones de horas disponibles
  const horasDisponibles = [
    { value: "08:00", label: "08:00 AM" },
    { value: "09:00", label: "09:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "01:00 PM" },
    { value: "14:00", label: "02:00 PM" },
    { value: "15:00", label: "03:00 PM" },
    { value: "16:00", label: "04:00 PM" },
    { value: "17:00", label: "05:00 PM" },
  ];

  // Generar horas disponibles según la fecha seleccionada
  function actualizarHoras() {
    const fechaSeleccionada = dateInput.value || today;
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0];
    const horaActual = hoy.getHours();
    const minutoActual = hoy.getMinutes();

    timeSelect.innerHTML =
      '<option value="">-- Selecciona una hora --</option>';

    horasDisponibles.forEach((hora) => {
      const [horaStr, minutoStr] = hora.value.split(":");
      const horaInt = parseInt(horaStr);
      const minutoInt = parseInt(minutoStr);

      let mostrar = true;

      if (fechaSeleccionada === fechaHoy) {
        if (
          horaInt < horaActual ||
          (horaInt === horaActual && minutoInt <= minutoActual)
        ) {
          mostrar = false;
        }
      }

      if (mostrar) {
        const option = new Option(hora.label, hora.label);
        timeSelect.add(option);
      }
    });

    // Refrescar Nice Select si lo estás usando
    if (typeof $ !== "undefined" && $(timeSelect).niceSelect) {
      $(timeSelect).niceSelect("update");
    }
  }

  // Inicializar horas al cargar
  actualizarHoras();

  // Cambiar horas al seleccionar fecha
  dateInput.addEventListener("change", actualizarHoras);

  // Validación de formulario
  const validateForm = () => {
    let errors = [];

    if (!dateInput.value) errors.push("Por favor, selecciona una fecha.");
    if (!timeSelect.value) errors.push("Por favor, selecciona una hora.");

    return errors;
  };

  // Alerta con SweetAlert
  const showAlert = (message, type) => {
    Swal.fire({
      icon: type === "error" ? "error" : "success",
      title: type === "error" ? "Error" : "Éxito",
      text: message,
      confirmButtonText: "Aceptar",
    });
  };

  // Verificación de reserva existente
  const checkExistingReservation = async (cedula, email, date) => {
    const url = `https://Clinica.somee.com/api/CheckReservation?cedula=${cedula}&email=${email}&fecha=${date}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error("Error al verificar reserva:", error);
      return false;
    }
  };

  // Enviar datos a la API
  const sendReservation = async (data) => {
    const url = "https://Clinica.somee.com/api/Insert";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        const errorMessage = await response.text();
        showAlert(errorMessage || "Ya existe una reserva.", "error");
        return null;
      }

      if (!response.ok) {
        const result = await response.text();
        throw new Error(result || "Error al enviar los datos.");
      }

      const result = await response.json();
      showAlert(result.message || "¡Reserva realizada con éxito!", "success");
      return result;
    } catch (error) {
      console.error("Error al enviar la reserva:", error);
      showAlert(error.message, "error");
      return null;
    }
  };

  // Envío del formulario
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    phoneErrorDiv.textContent = "";
    emailErrorDiv.textContent = "";

    const errors = validateForm();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Errores en el formulario",
        text: errors.join("\n"),
      });
      return;
    }

    const date = dateInput.value;
    const time = timeSelect.value;
    const cedulaValue = cedula.value;
    const emailValue = emailInput.value;

    const reservationExists = await checkExistingReservation(
      cedulaValue,
      emailValue,
      date
    );
    if (reservationExists) {
      showAlert(
        "Ya tienes una reserva para esta fecha. Solo se permite una por día.",
        "error"
      );
      return;
    }

    const reservaData = {
      nombre: firstName.value,
      apellido: lastName.value,
      correo_electronico: emailValue,
      numero_telefono: phoneInput.value,
      Cedula: cedulaValue,
      fecha: date,
      hora: time,
    };

    const result = await sendReservation(reservaData);
    if (result) {
      form.reset();
      timeSelect.selectedIndex = 0;
      actualizarHoras(); // Actualizar horas después del reset
    }
  });
});
