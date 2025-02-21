document
  .getElementById("buscarPacienteForm")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Prevenir el envío del formulario

    const cedula = document.getElementById("cedulaInput").value.trim();

    if (!cedula) {
      alert("Por favor ingrese una cédula.");
      return;
    }

    const url =
      "https://Clinica.somee.com/api/BuscarPaciente/buscar?cedula=" + cedula;

    // Realizar la solicitud a la API
    fetch(url)
      .then((response) => {
        console.log("Respuesta de la API:", response); // Verificar el objeto de respuesta
        if (!response.ok) {
          throw new Error("No se encontró el paciente o ocurrió un error.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Datos del paciente:", data); // Verificar los datos devueltos

        // Verificar si los datos del paciente están completos
        if (!data || !data.nombre || !data.cedula) {
          throw new Error(
            "No se encontraron datos válidos para este paciente."
          );
        }

        // Mostrar los datos del paciente en los elementos HTML
        document.getElementById("nombre").innerText = data.nombre || "N/A";
        document.getElementById("cedula").innerText = data.cedula || "N/A";
        document.getElementById("direccion").innerText =
          data.direccion || "N/A";
        document.getElementById("fechaNacimiento").innerText =
          data.fecha_Nacimiento ? data.fecha_Nacimiento.split("T")[0] : "N/A";

        // Limpiar cualquier dato previo en el historial de consultas
        const consultasTableBody = document.getElementById("consultas");
        consultasTableBody.innerHTML = "";

        // Verificar si existen consultas y mostrarlas
        if (data.consultas && data.consultas.length > 0) {
          data.consultas.forEach((consulta) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${consulta.motivo_Consulta}</td>
              <td>${consulta.diagnostico}</td>
              <td>${consulta.observaciones}</td>
              <td>${consulta.fecha_Consulta}</td>
            `;
            consultasTableBody.appendChild(row);
          });
        } else {
          // Si no hay consultas, mostrar un mensaje
          const row = document.createElement("tr");
          row.innerHTML = `<td colspan="4" class="text-center">No se han encontrado consultas para este paciente.</td>`;
          consultasTableBody.appendChild(row);
        }
      })
      .catch((error) => {
        console.error("Error al buscar paciente:", error); // Ver más detalles del error
        alert("Ocurrió un error al buscar el paciente. Intente nuevamente.");
      });
  });
// Evento para el botón "Limpiar"
document
  .getElementById("clear-search-btn")
  .addEventListener("click", function () {
    // Limpiar el campo de búsqueda
    document.getElementById("cedulaInput").value = "";

    // Limpiar los datos del paciente
    document.getElementById("nombre").innerText = "";
    document.getElementById("cedula").innerText = "";
    document.getElementById("direccion").innerText = "";
    document.getElementById("fechaNacimiento").innerText = "";

    // Limpiar el historial de consultas
    const consultasTableBody = document.getElementById("consultas");
    consultasTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">Cargando datos...</td>
      </tr>
    `;
  });

document
  .getElementById("export-pdf-btn")
  .addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const leftMargin = 15;
    const topMargin = 20;
    const fontSize = 12;
    const titleFontSize = 18;
    const headerFontSize = 14;
    const rowHeight = 10;
    const cellPadding = 4;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    function addCenteredText(text, fontSize, yOffset) {
      const textWidth = ((doc.getStringUnitWidth(text) * fontSize) / 72) * 25.4;
      const xOffset = (pageWidth - textWidth) / 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fontSize);
      doc.text(text, xOffset, yOffset);
    }

    // Encabezado principal con fondo sombreado
    doc.setFillColor(230);
    doc.rect(leftMargin - 5, topMargin - 8, pageWidth - 30, 12, "F");
    addCenteredText("Historial del Paciente", titleFontSize, topMargin);

    const nombre = document.getElementById("nombre").innerText;
    const cedula = document.getElementById("cedula").innerText;
    const direccion = document.getElementById("direccion").innerText;
    const fechaNacimiento =
      document.getElementById("fechaNacimiento").innerText;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    let yOffset = topMargin + 25;

    doc.setFont("helvetica", "bold");
    doc.text(`Nombre: ${nombre}`, leftMargin, yOffset);
    yOffset += 10;
    doc.text(`Cédula: ${cedula}`, leftMargin, yOffset);
    yOffset += 10;
    doc.text(`Dirección: ${direccion}`, leftMargin, yOffset);
    yOffset += 10;
    doc.text(`Fecha de Nacimiento: ${fechaNacimiento}`, leftMargin, yOffset);
    yOffset += 20;

    // Historial de Consultas con encabezado sombreado
    doc.setFillColor(230);
    doc.rect(leftMargin - 5, yOffset - 10, pageWidth - 30, 12, "F");
    addCenteredText("Historial de Consultas", headerFontSize, yOffset);
    yOffset += 15;

    const headers = [
      "Motivo de la \nConsulta",
      "Diagnóstico",
      "Observaciones",
      "Fecha",
    ];
    const columnWidths = [50, 40, 60, 40];

    headers.forEach((header, index) => {
      const xPosition =
        leftMargin +
        columnWidths.slice(0, index).reduce((a, b) => a + b, 0) +
        cellPadding;
      doc.text(header, xPosition, yOffset);
    });
    yOffset += rowHeight;

    const consultasTableBody = document.getElementById("consultas");
    const filasConsultas = consultasTableBody.getElementsByTagName("tr");

    doc.setFont("helvetica", "normal");
    for (let i = 0; i < filasConsultas.length; i++) {
      const fila = filasConsultas[i];
      const celdas = fila.getElementsByTagName("td");

      if (celdas.length > 0) {
        let xOffset = leftMargin;
        let maxCellHeight = 0;

        for (let j = 0; j < celdas.length; j++) {
          const cellText = celdas[j].innerText;
          const wrappedText = doc.splitTextToSize(
            cellText,
            columnWidths[j] - cellPadding * 2
          );
          const cellHeight = rowHeight * wrappedText.length;
          maxCellHeight = Math.max(maxCellHeight, cellHeight);
          doc.rect(xOffset, yOffset, columnWidths[j], cellHeight, "S");
          const textHeight = (doc.getTextDimensions(wrappedText).h / 72) * 25.4;
          const newYOffset =
            yOffset + (rowHeight - textHeight) / 2 + cellPadding;
          doc.text(wrappedText, xOffset + cellPadding, newYOffset);

          xOffset += columnWidths[j];
        }
        yOffset += maxCellHeight;

        if (yOffset > pageHeight - 30) {
          doc.addPage();
          yOffset = topMargin + 10;
          doc.setFillColor(230);
          doc.rect(leftMargin - 5, yOffset - 10, pageWidth - 30, 12, "F");
          addCenteredText("Historial de Consultas", headerFontSize, yOffset);
          yOffset += 15;

          xOffset = leftMargin;
          headers.forEach((header, index) => {
            const headerX = xOffset + cellPadding;
            doc.text(header, headerX, yOffset);
            xOffset += columnWidths[index];
          });
          yOffset += rowHeight;
        }
      }
    }

    doc.save("Historial_paciente.pdf");
  });
