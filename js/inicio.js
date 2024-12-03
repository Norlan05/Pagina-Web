function updateClock() {
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  var period = hours >= 12 ? "PM" : "AM";

  // Convertir a formato de 12 horas
  hours = hours % 12;
  hours = hours ? hours : 12; // El '0' se convierte en '12'

  // Formatear el tiempo con ceros a la izquierda
  var clockText = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${period}`;
  document.getElementById("clock").innerHTML = clockText;
}

updateClock();
setInterval(updateClock, 1000);
