"use server"
import { LatexTemplate } from "@/types/latex-template";
import { LanguageLevel, Resume, Section } from "@/types/resume";
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as fss from 'fs';
import path from 'path';

export async function generateLatexPdf(latexDocument: string): Promise<Buffer<ArrayBufferLike>> {
    try {
        // Paths
        const tempDir = path.join(process.cwd(), 'tmp');
        const outputPath = path.join(tempDir, 'temp.pdf');

        // check if tempDir exists and delete it
        if (fss.existsSync(tempDir)) {
            await fs.rm(tempDir, { recursive: true, force: true });
        }

        // Ensure temporary directory exists
        await fs.mkdir(tempDir, { recursive: true });

        // Write the LaTeX document to a temporary file
        const latexFilePath = path.join(tempDir, 'temp.tex');
        await fs.writeFile(latexFilePath, latexDocument);

        // Compile LaTeX to PDF using `pdflatex`
        await new Promise((resolve, reject) => {
            exec(
                `bash -c "pdflatex -interaction=nonstopmode -output-directory=${tempDir} ${latexFilePath}"`,
                (error, stdout, stderr) => {
                    if (error) {
                        console.error('pdflatex error:', stdout, stderr);
                    }
                    resolve(stdout);
                }
            );
        });

        if (!fss.existsSync(outputPath)) {
            throw new Error('Failed to generate PDF');
        }

        // Read the generated PDF
        const pdfBuffer = await fs.readFile(outputPath);

        // Clean up temporary files

        // Return the generated PDF buffer
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Internal Server Error');
    }
}