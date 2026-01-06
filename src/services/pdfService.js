// PDF Service para generación de reportes de servicio
import jsPDF from 'jspdf';
import { getStatusText } from '../utils/statusHelpers';

/**
 * Generar PDF con el reporte de servicio
 * @param {Object} serviceData - Datos del servicio
 * @returns {void}
 */
export const generateServicePDF = async (serviceData) => {
  const pdf = new jsPDF();

  // Configuración de colores
  const primaryColor = [220, 38, 38]; // Red
  const secondaryColor = [42, 42, 42]; // Dark gray
  const textColor = [51, 51, 51];

  // Header con logo y título
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RACCOONS', 105, 20, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Taller Especializado en Motocicletas', 105, 28, { align: 'center' });

  // Código de seguimiento destacado
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, 50, 180, 20, 'F');
  pdf.setTextColor(...textColor);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Código de Seguimiento: ${serviceData.code}`, 105, 62, { align: 'center' });

  // Información del servicio
  let yPos = 85;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('Información del Servicio', 15, yPos);
  yPos += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...textColor);

  const infoFields = [
    { label: 'Cliente:', value: serviceData.clientName },
    { label: 'Teléfono:', value: serviceData.clientPhone || 'N/A' },
    { label: 'Motocicleta:', value: serviceData.motorcycle },
    { label: 'Tipo de Servicio:', value: serviceData.serviceType },
    { label: 'Estado:', value: getStatusText(serviceData.status) },
    { label: 'Fecha de Ingreso:', value: new Date(serviceData.dateCreated).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })},
    { label: 'Última Actualización:', value: new Date(serviceData.dateUpdated).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
  ];

  infoFields.forEach(field => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(field.label, 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(field.value, 70, yPos);
    yPos += 8;
  });

  // Notas del servicio
  if (serviceData.notes) {
    yPos += 5;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('Notas del Servicio', 15, yPos);
    yPos += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...textColor);

    const notesLines = pdf.splitTextToSize(serviceData.notes, 170);
    pdf.text(notesLines, 20, yPos);
    yPos += (notesLines.length * 7) + 5;
  }

  // Evidencias fotográficas
  if (serviceData.evidence && serviceData.evidence.length > 0) {
    yPos += 10;

    // Verificar si necesitamos nueva página
    if (yPos > 240) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('Evidencias del Trabajo Realizado', 15, yPos);
    yPos += 10;

    // Agregar imágenes (máximo 2 por página)
    for (let i = 0; i < serviceData.evidence.length; i++) {
      const evidence = serviceData.evidence[i];

      // Nueva página si es necesario
      if (i > 0 && i % 2 === 0) {
        pdf.addPage();
        yPos = 20;
      }

      try {
        // Agregar imagen
        const imgWidth = 170;
        const imgHeight = 100;

        pdf.addImage(evidence.url, 'JPEG', 20, yPos, imgWidth, imgHeight);

        // Descripción de la imagen
        if (evidence.description) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(...textColor);
          pdf.text(evidence.description, 20, yPos + imgHeight + 5);
        }

        yPos += imgHeight + 15;
      } catch (error) {
        console.error('Error al agregar imagen al PDF:', error);
      }
    }
  }

  // Footer en todas las páginas
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    pdf.setFillColor(...secondaryColor);
    pdf.rect(0, 277, 210, 20, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Raccoons Taller - Av. Principal #123, Ciudad', 105, 285, { align: 'center' });
    pdf.text('Tel: +1 234 567 8900 | info@raccoons.com', 105, 290, { align: 'center' });
    pdf.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' });

    // Fecha de generación
    const generatedDate = new Date().toLocaleString('es-MX');
    pdf.setFontSize(8);
    pdf.text(`Generado: ${generatedDate}`, 15, 290);
  }

  // Descargar el PDF
  const fileName = `Servicio_${serviceData.code}_${new Date().getTime()}.pdf`;
  pdf.save(fileName);
};

/**
 * Generar PDF simple sin evidencias (para tracking público)
 * @param {Object} serviceData - Datos del servicio
 */
export const generateSimpleServicePDF = (serviceData) => {
  const pdf = new jsPDF();

  const primaryColor = [220, 38, 38];
  const textColor = [51, 51, 51];

  // Header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 35, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RACCOONS', 105, 18, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Taller Especializado en Motocicletas', 105, 26, { align: 'center' });

  // Título
  pdf.setFontSize(16);
  pdf.setTextColor(...textColor);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Estado de Servicio', 105, 50, { align: 'center' });

  // Código
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, 60, 180, 15, 'F');
  pdf.setFontSize(14);
  pdf.text(`Código: ${serviceData.code}`, 105, 70, { align: 'center' });

  // Información
  let yPos = 90;
  pdf.setFontSize(11);

  const fields = [
    { label: 'Cliente:', value: serviceData.clientName },
    { label: 'Motocicleta:', value: serviceData.motorcycle },
    { label: 'Servicio:', value: serviceData.serviceType },
    { label: 'Estado Actual:', value: getStatusText(serviceData.status) },
    { label: 'Fecha de Ingreso:', value: new Date(serviceData.dateCreated).toLocaleDateString('es-MX') }
  ];

  fields.forEach(field => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(field.label, 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(field.value, 70, yPos);
    yPos += 10;
  });

  // Timeline
  yPos += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('Progreso del Servicio', 20, yPos);
  yPos += 10;

  const statuses = ['recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado'];
  const currentIndex = statuses.indexOf(serviceData.status);

  pdf.setFontSize(10);
  statuses.forEach((status, index) => {
    const isCompleted = index <= currentIndex;

    if (isCompleted) {
      pdf.setFillColor(...primaryColor);
      pdf.circle(25, yPos, 3, 'F');
      pdf.setTextColor(...primaryColor);
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setDrawColor(200, 200, 200);
      pdf.circle(25, yPos, 3, 'S');
      pdf.setTextColor(150, 150, 150);
      pdf.setFont('helvetica', 'normal');
    }

    pdf.text(getStatusText(status), 35, yPos + 1);

    if (index < statuses.length - 1) {
      if (isCompleted) {
        pdf.setDrawColor(...primaryColor);
      } else {
        pdf.setDrawColor(200, 200, 200);
      }
      pdf.line(25, yPos + 3, 25, yPos + 10);
    }

    yPos += 13;
  });

  // Footer
  pdf.setFillColor(42, 42, 42);
  pdf.rect(0, 277, 210, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Raccoons Taller', 105, 285, { align: 'center' });
  pdf.text('Tel: +1 234 567 8900 | info@raccoons.com', 105, 290, { align: 'center' });

  const fileName = `Estado_Servicio_${serviceData.code}.pdf`;
  pdf.save(fileName);
};
