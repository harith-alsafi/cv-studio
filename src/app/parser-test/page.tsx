"use client";

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Type for OpenAI response
interface OpenAIResponse {
  role: string;
  content: string;
  refusal: null | string;
}

// Type for the parsed JSON data
interface ParsedJSON {
  [key: string]: any;
}

export default function Home() {
  const [parsedData, setParsedData] = useState<ParsedJSON | null>(null);
  const [rawResponse, setRawResponse] = useState<OpenAIResponse | null>(null);
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
    setRawResponse(null);
    setParsedData(null);
    
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

      const data: OpenAIResponse = await response.json();
      setRawResponse(data);

      // Parse the content string to get the actual JSON data
      if (data.content) {
        try {
          // Parse the JSON string from the content field
          const parsedContent: ParsedJSON = JSON.parse(data.content);
          setParsedData(parsedContent);
        } catch (e) {
          console.error('Error parsing content JSON:', e);
          setError('Failed to parse response content');
        }
      }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display the parsed JSON data in a formatted way */}
            <div className="bg-white p-6 rounded-lg shadow">
              <pre className="whitespace-pre-wrap break-words text-black">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </div>
            
            {/* Display the data in a more readable format */}
            <div className="bg-white p-6 rounded-lg shadow">
  {Object.entries(parsedData).map(([key, value]) => (
    <div key={key} className="mb-4">
      <h3 className="font-semibold capitalize text-black">{key}</h3>
      {Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' ? (
        // Render array of objects (experience, education, etc.)
        <ul className="list-disc pl-6 mt-1">
          {value.map((item: any, index: number) => (
            <li key={index} className="mb-2">
              <div className="text-sm text-black">
                {Object.entries(item).map(([itemKey, itemValue]) => (
                  <div key={itemKey} className="text-black">
                    <strong>{itemKey}: </strong>
                    <span>{String(itemValue)}</span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        // Render simple values or nested JSON strings
        <p className="mt-1 text-black">
          {typeof value === 'object'
            ? JSON.stringify(value, null, 2)
            : String(value)}
        </p>
      )}
    </div>
  ))}
</div>

          </div>
        </div>
      )}

      {/* Optional: Display raw response for debugging */}
      {rawResponse && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Raw Response</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-black">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
