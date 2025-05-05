import { NextResponse } from 'next/server';
import { Resume } from '@/types/resume';
import { LatexTemplate, LatexTemplateData } from '@/types/latex-template';

export async function POST(req: Request) {
    try {
        // Parse request body
        const { resume, template } : { resume: Resume; template: LatexTemplateData } = await req.json();
        
        if (!resume || !template) {
            return NextResponse.json({ error: 'Missing resume or template' }, { status: 400 });
        }

        const templateObject = new LatexTemplate(template);
        
        // Generate LaTeX document
        const latexDocument = templateObject.generateLatex(resume);
        
        console.log('latexDocument', latexDocument);
        // Call LaTeX.ytotech.com API to generate PDF
        const response = await fetch('https://latex.ytotech.com/builds/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                compiler: 'lualatex',
                resources: [
                    {
                        main: true,
                        content: latexDocument
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate PDF');
        }

        // Get the PDF buffer from the response
        const pdfBuffer = await response.arrayBuffer();
        
        // Return PDF as response
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"'
            }
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
