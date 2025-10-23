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

  // Validar formato de cédula en tiempo real
  cedula.addEventListener("input", () => {
    cedula.value = cedula.value.replace(/[^0-9A-Z]/gi, "").toUpperCase();
  });

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

  // ✅ Verificación de reserva existente (con logs mejorados)
  const checkExistingReservation = async (cedula, email, date, hora) => {
    const url = `https://Clinica.somee.com/api/CheckReservation?cedula=${cedula}&email=${email}&date=${date}&hora=${hora}`;
    try {
      const response = await fetch(url);
      console.log("📡 Verificando reserva en:", url);
      console.log("🟢 Estado HTTP:", response.status);
      console.log("📦 Headers:", [...response.headers.entries()]);

      if (!response.ok) {
        console.error("❌ Error HTTP al verificar reserva:", response.status);
        return { exists: false };
      }

      let result = {};
      try {
        const text = await response.text();
        console.log("📄 Respuesta bruta del servidor:", text);

        if (text && text.trim().startsWith("{")) {
          result = JSON.parse(text);
        } else {
          console.warn(
            "⚠️ La respuesta no contenía JSON válido o estaba vacía:",
            text
          );
        }
      } catch (e) {
        console.error("💥 Error al intentar parsear JSON:", e);
      }

      console.log("✅ Resultado final de verificación:", result);
      return result;
    } catch (error) {
      console.error("💥 Error al verificar reserva:", error);
      return { exists: false };
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

    // 🔒 Bloquear el botón al hacer clic
    const boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.innerText = "Procesando...";
    console.log("✅ Botón bloqueado:", boton.disabled);

    phoneErrorDiv.textContent = "";
    emailErrorDiv.textContent = "";

    const errors = validateForm();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Errores en el formulario",
        text: errors.join("\n"),
      });
      // 🔓 Volver a habilitar el botón si hay errores
      boton.disabled = false;
      boton.innerText = "Reservar Cita";
      return;
    }

    const date = dateInput.value;
    const time = timeSelect.value;
    const cedulaValue = cedula.value.trim().toUpperCase();
    const emailValue = emailInput.value.trim().toLowerCase();

    // Validar existencia de reserva
    const resultCheck = await checkExistingReservation(
      cedulaValue,
      emailValue,
      date,
      time
    );

    if (resultCheck.exists) {
      if (resultCheck.reason === "cliente_ya_tiene_reserva") {
        showAlert(
          "Ya tienes una reserva para esta fecha. Solo se permite una por día.",
          "error"
        );
      } else if (resultCheck.reason === "hora_ocupada") {
        showAlert(
          "La hora seleccionada ya está ocupada. Elige otra hora.",
          "error"
        );
      } else {
        showAlert("Ya existe una reserva conflictiva.", "error");
      }
      // 🔓 Volver a habilitar el botón
      boton.disabled = false;
      boton.innerText = "Reservar Cita";
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
      actualizarHoras();
    }

    // 🔓 Habilitar nuevamente el botón después del proceso
    boton.disabled = false;
    boton.innerText = "Reservar Cita";
    console.log("🔓 Botón desbloqueado:", boton.disabled);
  });
});
