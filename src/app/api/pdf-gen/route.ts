import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        // Parse incoming JSON
        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Paths
        const templatePath = path.join(process.cwd(), 'public', 'template.tex');
        const tempDir = path.join(process.cwd(), 'tmp');
        const outputPath = path.join(tempDir, 'temp.pdf');

        // Ensure temporary directory exists
        await fs.mkdir(tempDir, { recursive: true });

        // Read LaTeX template
        const latexTemplate = await fs.readFile(templatePath, 'utf-8');

        // Replace placeholder in the template
        const processedLatex = latexTemplate.replace('PLACEHOLDER_TEXT', text);

        // Write processed LaTeX to a temporary file
        const latexFilePath = path.join(tempDir, 'temp.tex');
        await fs.writeFile(latexFilePath, processedLatex);

        // Compile LaTeX to PDF using `pdflatex`
        await new Promise((resolve, reject) => {
            exec(
                `bash -c "pdflatex -interaction=nonstopmode -output-directory=${tempDir} ${latexFilePath}"`,
                (error, stdout, stderr) => {
                    if (error) {
                        console.error('pdflatex error:', stderr);
                        return reject(new Error('Failed to compile LaTeX'));
                    }
                    resolve(stdout);
                }
            );
        });

        // Read the generated PDF
        const pdfBuffer = await fs.readFile(outputPath);

        // Clean up temporary files
        await fs.rm(tempDir, { recursive: true, force: true });

        // Return the PDF as a response
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="temp.pdf"',
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
