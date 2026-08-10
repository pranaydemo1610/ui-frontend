// Export a result object as PDF using jsPDF
import jsPDF from 'jspdf';

export function exportPDF(title: string, sections: { label: string; value: string }[][]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235);
  doc.text(title, margin, y);
  y += 24;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, 555, y);
  y += 24;

  sections.forEach((section) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    section.forEach(({ label, value }) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(value), margin + 140, y);
      y += 18;
    });
    y += 12;
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

// Export a 2D array to Excel using SheetJS (xlsx)
import * as XLSX from 'xlsx';

export function exportExcel(filename: string, sheets: { name: string; rows: (string | number)[][] }[]) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function copyJSON(data: unknown) {
  const text = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(text);
}

export function printResult() {
  window.print();
}

export function formatINR(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}
