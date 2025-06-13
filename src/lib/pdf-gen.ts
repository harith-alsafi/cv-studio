import { Resume } from '@/types/resume';
import { LatexTemplate, LatexTemplateData } from '@/types/latex-template';

export async function generatePdf(resume: Resume, template: LatexTemplateData | undefined): Promise<ArrayBuffer> {
    try {
        if(!template) {
            throw new Error('Template is required to generate PDF');
        }

        const templateObject = new LatexTemplate(template);
        
        // Generate LaTeX document from the resume and template
        const latexDocument = templateObject.generateLatex(resume);
        
        // Generate PDF from the LaTeX document
        const response = await fetch('https://latex.ytotech.com/builds/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                compiler: 'pdflatex',
                resources: [
                    {
                        main: true,
                        content: latexDocument
                    }
                ]
            })
        });
        if (!response.ok) {
            console.error('Failed to generate PDF:', response);
            throw new Error('Failed to generate PDF');
        }
        // Get the PDF buffer from the response
        const pdfBuffer = await response.arrayBuffer();
        return pdfBuffer;

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
}
