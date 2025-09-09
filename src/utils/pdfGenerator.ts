import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

export const generateTablePDF = async (data: any[], columns: any[], title: string, filename: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(59, 130, 246); // Blue color
  pdf.text(title, 20, 20);
  
  // Date
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
  
  // Table headers
  const startY = 40;
  const rowHeight = 8;
  const colWidth = 30;
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  // Headers
  columns.forEach((col, index) => {
    pdf.text(col.headerName, 20 + (index * colWidth), startY);
  });
  
  // Data rows
  data.forEach((row, rowIndex) => {
    const y = startY + ((rowIndex + 1) * rowHeight);
    
    columns.forEach((col, colIndex) => {
      const value = row[col.field] || '-';
      const text = typeof value === 'string' ? value : String(value);
      pdf.text(text.substring(0, 20), 20 + (colIndex * colWidth), y);
    });
  });
  
  pdf.save(`${filename}.pdf`);
};
