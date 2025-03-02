"use server"
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { promises as fs } from 'fs';
import YAML from 'yaml';
import { readFileSync } from 'fs';

async function readDoc(filePath: string): Promise<string> {
    const fullText = (await mammoth.extractRawText({ path: filePath })).value;
    return fullText;
}

async function readPdf(filePath: string): Promise<string> {
  const fileData = await fs.readFile(filePath);
  const pdfData = new Uint8Array(fileData);

  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    const numPages = pdf.numPages;
    const pageTextPromises: any[] = [];

    for (let i = 0; i < numPages; i++) {
      pageTextPromises.push(
        pdf.getPage(i + 1).then((page) => page.getTextContent()),
      );
    }

    const pagesText = await Promise.all(pageTextPromises);
    let fullText = '';

    pagesText.forEach((page) => {
      fullText += page.items.map((item: { str: any; }) => item.str).join('\n');
    });

    return fullText;
  } catch (error) {
    // Handle errors here
    throw error;
  }
}

async function readText(filePath: string): Promise<string> {
    const fullText = await fs.readFile(filePath, 'utf-8');
    return fullText;
}

export async function readFile(filePath: string): Promise<string> {
    if (filePath.endsWith('.pdf')) {
      return await readPdf(filePath);
    } else if (filePath.endsWith('.docx') || filePath.endsWith('.doc')) {
      return await readDoc(filePath);
    } 
    else if (filePath.endsWith('.txt')) {
      return await readText(filePath);
    }
    else {
      throw new Error('File type not supported');
    }
}

export async function readYaml(filePath: string): Promise<Record<string, any>> {
  const fileData = readFileSync(filePath, 'utf-8');
  return YAML.parse(fileData) as Record<string, any>;
}