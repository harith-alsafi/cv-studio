// src/lib/pdf-gen-basic.ts
import { jsPDF } from 'jspdf';
import { Resume } from '@/types/resume';
import autoTable from 'jspdf-autotable';

export function generateResumePDF(resumeData: Resume): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;
  
  // Helper function for text wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return (lines.length * 7); // Return total height used
  };

  // Header Section
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.name, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(resumeData.title, pageWidth / 2, yPosition, { align: 'center' });

  // Contact Information
  yPosition += 15;
  doc.setFontSize(10);
  const contactInfo = [
    `Email: ${resumeData.email}`,
    `Phone: ${resumeData.phone}`,
    `Address: ${resumeData.address}`,
  ].join(' | ');
  doc.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });

  // Links
  yPosition += 7;
  const links = [
    `Portfolio: ${resumeData.portfolio}`,
    `LinkedIn: ${resumeData.linkedin}`,
    `GitHub: ${resumeData.github}`,
  ].join(' | ');
  doc.text(links, pageWidth / 2, yPosition, { align: 'center' });

  // About Section
  yPosition += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('About', 20, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += addWrappedText(resumeData.about, 20, yPosition, pageWidth - 40);

  // Experience Section
  yPosition += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Professional Experience', 20, yPosition);
  yPosition += 7;

  resumeData.experience.forEach(exp => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(exp.title, 20, yPosition);
    
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.organization}, ${exp.location}`, 20, yPosition);
    doc.text(`${exp.startDate} - ${exp.endDate}`, pageWidth - 60, yPosition);
    
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    if (Array.isArray(exp.content)) {
      exp.content.forEach(item => {
        doc.text('•', 25, yPosition);
        yPosition += addWrappedText(item, 30, yPosition, pageWidth - 50);
        yPosition += 5;
      });
    } else {
      yPosition += addWrappedText(exp.content, 20, yPosition, pageWidth - 40);
      yPosition += 5;
    }
  });

  // Education Section
  yPosition += 5;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Education', 20, yPosition);
  yPosition += 7;

  resumeData.education.forEach(edu => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.title, 20, yPosition);
    
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`${edu.organization}, ${edu.location}`, 20, yPosition);
    doc.text(`${edu.startDate} - ${edu.endDate}`, pageWidth - 60, yPosition);
    
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    if (Array.isArray(edu.content)) {
      yPosition += addWrappedText(edu.content.join(', '), 20, yPosition, pageWidth - 40);
    } else {
      yPosition += addWrappedText(edu.content, 20, yPosition, pageWidth - 40);
    }
    yPosition += 5;
  });

  // Skills Section
  if (yPosition > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 5;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Skills', 20, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const skillsText = resumeData.skills.join(', ');
  yPosition += addWrappedText(skillsText, 20, yPosition, pageWidth - 40);

  // Languages Section
  if (resumeData.languages.length > 0) {
    yPosition += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Languages', 20, yPosition);
    yPosition += 7;

    const languagesData = resumeData.languages.map(lang => [
      lang.name,
      lang.level
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Language', 'Proficiency']],
      body: languagesData,
      margin: { left: 20 },
      theme: 'striped',
      styles: { fontSize: 10 }
    });
  }

  // Generate data URL
  const pdfDataUrl = doc.output('dataurlstring');
  return pdfDataUrl;
}