// utils/exportToPdf.ts

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AuditTrailReport } from '@/types/auditTrail';

export const exportToPdf = (data: AuditTrailReport[], fileName: string): void => {
  // Initialize jsPDF
  const doc = new jsPDF('l', 'mm', 'a4');

  // Define the columns
  const columns = [
    { header: 'SrNo', dataKey: 'RowNo' },
    { header: 'Plant Code', dataKey: 'PlantCode' },
    { header: 'App Type', dataKey: 'AppType' },
    { header: 'Activity', dataKey: 'Activity' },
    { header: 'Action', dataKey: 'Action' },
    { header: 'OldData', dataKey: 'OldData' },
    { header: 'NewData', dataKey: 'NewData' },
    { header: 'Remarks', dataKey: 'Remark' },
    { header: 'UserId', dataKey: 'UserId' },
    { header: 'TransDate', dataKey: 'ActivityDate' }
  ];

  // Format the data
  const formattedData = data.map(row => ({
    ...row,
    ActivityDate: new Date(row.ActivityDate).toLocaleString()
  }));

  // Set the title
  doc.setFontSize(18);
  doc.text('Audit Trail Report', 14, 22);

  // Create the table
  (doc as any).autoTable({
    columns: columns,
    body: formattedData,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 10 },  
      1: { cellWidth: 20 },  
      2: { cellWidth: 20 },  // App Type
      3: { cellWidth: 25 },  // Activity
      4: { cellWidth: 25 },  // Action
      5: { cellWidth: 45 },  // OldData
      6: { cellWidth: 45 },  // NewData
      7: { cellWidth: 25 },  // Remarks
      8: { cellWidth: 20 },  // UserId
      9: { cellWidth: 30 }   // TransDate
    },
    headStyles: { fillColor: [66, 66, 66] },
    didDrawPage: (data: any) => {
      // Footer
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  // Save the PDF
  doc.save(`${fileName}.pdf`);
};