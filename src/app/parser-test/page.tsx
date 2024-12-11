'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Home() {
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const file = acceptedFiles[0];
      let text: string;

      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.json();
      setParsedData(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resume Parser</h1>
      
      <div 
        {...getRootProps()} 
        className="border-2 border-dashed p-8 rounded-lg text-center cursor-pointer hover:bg-gray-50"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the resume here...</p>
        ) : (
          <p>Drag and drop a resume (PDF or TXT), or click to select one</p>
        )}
      </div>

      {loading && (
        <div className="mt-4 text-blue-600">Processing your resume...</div>
      )}

      {error && (
        <div className="mt-4 text-red-600">
          Error: {error}
        </div>
      )}

      {parsedData && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Parsed Resume Data</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}