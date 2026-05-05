import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaccion } from '../types';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => `"${val}"`).join(',')
  ).join('\n');
  
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTransactionsToPDF = (transactions: Transaccion[], title: string = 'Estado de Cuenta - OldMoney Bank') => {
  const doc = new jsPDF();
  
  // Header Branding
  doc.setFillColor(18, 30, 24); // Deep Emerald
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(201, 168, 76); // Gold
  doc.setFont('playfair', 'bold');
  doc.setFontSize(24);
  doc.text('OldMoney Bank', 20, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Institutional Financial Services', 20, 32);
  
  // Title & Date
  doc.setTextColor(18, 30, 24);
  doc.setFontSize(16);
  doc.text(title, 20, 55);
  
  doc.setFontSize(10);
  doc.text(`Fecha de Emisión: ${new Date().toLocaleString()}`, 20, 62);
  
  // Table
  const tableData = transactions.map(tx => [
    new Date(tx.createdAt).toLocaleDateString(),
    tx.tipo.toUpperCase(),
    tx.descripcion || '-',
    `$${Number(tx.monto).toLocaleString()}`,
    (tx.cuentaOrigenId || tx.cuentaDestinoId || '-').toString()
  ]);
  
  autoTable(doc, {
    startY: 70,
    head: [['Fecha', 'Operación', 'Descripción', 'Monto', 'Cuenta ID']],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [18, 30, 24],
      textColor: [201, 168, 76],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'Documento generado por el sistema interno de auditoría de OldMoney Bank. Confidencial.',
      105, 285, { align: 'center' }
    );
  }
  
  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
