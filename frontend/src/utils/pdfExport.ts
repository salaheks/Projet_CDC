import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportCanvasToPDF = async (canvasId: string, projectName: string = 'architecture') => {
  const element = document.getElementById(canvasId);
  if (!element) {
    console.error('Canvas element not found');
    return;
  }

  try {
    // Hide controls and minimap for export
    const controls = element.querySelector('.react-flow__controls') as HTMLElement;
    const minimap = element.querySelector('.react-flow__minimap') as HTMLElement;
    if (controls) controls.style.display = 'none';
    if (minimap) minimap.style.display = 'none';

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      backgroundColor: '#f8fafc', // match slate-50
    });

    // Restore UI elements
    if (controls) controls.style.display = '';
    if (minimap) minimap.style.display = '';

    const imgData = canvas.toDataURL('image/png');
    
    // A4 Landscape: 297mm x 210mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    const pdfRatio = pdfWidth / pdfHeight;

    let finalWidth, finalHeight;
    if (imgRatio > pdfRatio) {
      finalWidth = pdfWidth;
      finalHeight = pdfWidth / imgRatio;
    } else {
      finalHeight = pdfHeight;
      finalWidth = pdfHeight * imgRatio;
    }

    const marginX = (pdfWidth - finalWidth) / 2;
    const marginY = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', marginX, marginY, finalWidth, finalHeight);
    pdf.save(`${projectName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Erreur lors de la génération du PDF');
  }
};
