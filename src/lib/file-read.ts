import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { promises as fs } from "fs";
import YAML from "yaml";
import path from "path";

// Initialize PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

async function extractPdfText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Error reading PDF:", error);
    throw new Error("Failed to read PDF file");
  }
}

async function extractWordText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error reading Word document:", error);
    throw new Error("Failed to read Word document");
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return await extractPdfText(file);
  } else if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/msword"
  ) {
    return await extractWordText(file);
  } else {
    return await file.text();
  }
}

export async function readYaml(fileName: string): Promise<Record<string, any>> {
  // Use path.join() with __dirname to get the absolute path from the current directory
  // This is more reliable than process.cwd() across environments
  const filePath = path.join(process.cwd(), "templates", fileName);

  try {
    // Using promises-based fs for better async handling
    const fileData = await fs.readFile(filePath, "utf-8");
    return YAML.parse(fileData) as Record<string, any>;
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw error;
  }
}
