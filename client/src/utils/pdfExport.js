import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Exports a DOM element to a styled PDF file.
 * @param {string} elementId - The ID of the DOM element to capture.
 * @param {string} filename - The name of the downloaded PDF file.
 */
export const exportToPDF = async (elementId, filename = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return;
  }

  try {
    // Hide export buttons during capture
    const buttonsToHide = element.querySelectorAll('.no-pdf-export');
    buttonsToHide.forEach(btn => {
      btn.style.visibility = 'hidden';
    });

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution scale
      backgroundColor: '#050505',
      useCORS: true,
      logging: false,
      allowTaint: true
    });

    // Restore hidden buttons
    buttonsToHide.forEach(btn => {
      btn.style.visibility = 'visible';
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions: 210mm x 297mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Remaining pages
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF Generation Failed:', error);
  }
};
