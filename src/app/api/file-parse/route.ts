// import fs from 'fs';
// import pdfLib from 'pdf-lib';
// import mammoth from 'mammoth';
// import path from 'path';

// // Utility function to read a PDF file
// async function readPdf(filePath: string): Promise<string> {
//   const pdfBytes = await fs.readFile(filePath);
//   const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);
//   const text = pdfDoc.getPages().map(page => page.getTextContent().then(content => content.items.map(item => item.str).join(' '))).join('\n');
//   return text;
// }

// // Utility function to read a DOCX file
// async function readDocx(filePath: string): Promise<string> {
//   const buffer = await fs.readFile(filePath);
//   const { value } = await mammoth.extractRawText({ buffer });
//   return value;
// }

// // Utility function to read a DOC file (basic text extraction)
// async function readDoc(filePath: string): Promise<string> {
//   // You may want to use a library like `node-libcurl` or another specific DOC parser
//   // For simplicity, you can use basic text extraction (not as accurate as DOCX parsing)
//   const docData = await fs.readFile(filePath, 'utf8');
//   return docData;
// }

// // Utility function to read a plain TXT file
// async function readTxt(filePath: string): Promise<string> {
//   return await fs.readFile(filePath, 'utf8');
// }

// // Main function to read any supported file type
// async function readFileContents(filePath: string): Promise<string> {
//   const ext = path.extname(filePath).toLowerCase();

//   switch (ext) {
//     case '.pdf':
//       return await readPdf(filePath);
//     case '.docx':
//       return await readDocx(filePath);
//     case '.doc':
//       return await readDoc(filePath);
//     case '.txt':
//       return await readTxt(filePath);
//     default:
//       throw new Error('Unsupported file type');
//   }
// }
