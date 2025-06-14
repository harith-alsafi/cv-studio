import { Resume } from '@/types/resume';
import { LatexTemplate, LatexTemplateData } from '@/types/latex-template';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const isDevelopment = process.env.NODE_ENV === 'development';
const s3rvePort = process.env.S3RVE_PORT || '4566';

const s3Client = new S3Client({
    region: isDevelopment ? 'us-east-1' : process.env.R2_REGION || 'auto',
    endpoint: isDevelopment ? `http://localhost:${s3rvePort}` : process.env.R2_ENDPOINT,
    credentials: isDevelopment ? {
        accessKeyId: 'test',
        secretAccessKey: 'test'
    } : {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    },
    forcePathStyle: isDevelopment, // Required for S3RVE
});

const bucketName = process.env.R2_BUCKET_NAME || 'pdf-storage';

export async function uploadPdfToR2(userId: string, pdfBuffer: ArrayBuffer, fileName: string): Promise<string> {
    try {
        const key = `${userId}/${fileName}`;
        
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: new Uint8Array(pdfBuffer),
            ContentType: 'application/pdf',
            Metadata: {
                userId: userId,
                uploadedAt: new Date().toISOString()
            }
        });

        await s3Client.send(command);
        
        // Return the key/path for future reference
        return key;
    } catch (error) {
        console.error('Error uploading PDF to R2:', error);
        throw new Error(`Failed to upload PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getPdfFromR2(userId: string, fileName: string): Promise<ArrayBuffer> {
    try {
        const key = `${userId}/${fileName}`;
        
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        });

        const response = await s3Client.send(command);
        
        if (!response.Body) {
            throw new Error('No data received from R2');
        }

        // Convert the response body to ArrayBuffer
        const chunks: Uint8Array[] = [];
        const reader = response.Body.transformToWebStream().getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
        
        // Combine all chunks into a single ArrayBuffer
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }
        
        return result.buffer;
    } catch (error) {
        console.error('Error getting PDF from R2:', error);
        throw new Error(`Failed to retrieve PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deletePdfFromR2(userId: string, fileName: string): Promise<boolean> {
    try {
        const key = `${userId}/${fileName}`;
        
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
        });

        await s3Client.send(command);
        
        return true;
    } catch (error) {
        console.error('Error deleting PDF from R2:', error);
        
        // Check if the error is because the file doesn't exist
        if (error instanceof Error && error.name === 'NoSuchKey') {
            console.warn(`PDF ${fileName} not found for user ${userId}, considering it already deleted`);
            return true;
        }
        
        throw new Error(`Failed to delete PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

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
