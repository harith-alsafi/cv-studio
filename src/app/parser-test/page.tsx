// src/app/parser-test/page.tsx
"use client";

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Resume } from '@/types/resume';
import { extractTextFromFile } from '@/lib/file-read-new';

interface OpenAIResponse {
  role: string;
  content: string;
  refusal: null | string;
}

export default function ResumeParsePage() {
  const [parsedData, setParsedData] = useState<Resume | null>(null);
  const [rawResponse, setRawResponse] = useState<OpenAIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');

  const onDrop = async (acceptedFiles: File[]) => {
    setLoading(true);
    setError(null);
    setRawResponse(null);
    setParsedData(null);
    
    try {
      const file = acceptedFiles[0];
      const text = await extractTextFromFile(file);

      // Log the raw text content
      console.log('Raw file content:', text);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          jobDescription: jobDescription.trim() 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data: OpenAIResponse = await response.json();
      setRawResponse(data);

      if (data.content) {
        try {
          const parsedContent = JSON.parse(data.content) as Resume;
          setParsedData(parsedContent);
          console.log('Parsed Resume Schema:', parsedContent);
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
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  return (
    <main className="container mx-auto p-4 text-black">
      <h1 className="text-2xl font-bold mb-4">Resume Parser</h1>
      
      {/* Job Description Input */}
      <div className="mb-6">
        <label htmlFor="jobDescription" className="block text-sm font-medium mb-2">
          Job Description (Optional)
        </label>
        <textarea
          id="jobDescription"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Paste the job description here to get tailored parsing results..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <div 
        {...getRootProps()} 
        className="border-2 border-dashed p-8 rounded-lg text-center cursor-pointer hover:bg-gray-50"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the resume here...</p>
        ) : (
          <p>Drag and drop a resume (PDF, DOC, DOCX, or TXT), or click to select one</p>
        )}
      </div>

      {loading && (
        <div className="mt-4 font-medium">Processing your resume...</div>
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
            {/* JSON View */}
            <div className="bg-white p-6 rounded-lg shadow">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </div>
            
            {/* Formatted View */}
            <div className="bg-white p-6 rounded-lg shadow">
              {Object.entries(parsedData).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <h3 className="font-semibold capitalize">{key}</h3>
                  {Array.isArray(value) ? (
                    <ul className="list-disc pl-6 mt-1">
                      {value.map((item, index) => (
                        <li key={index} className="mb-2">
                          {typeof item === 'object' ? (
                            <div className="text-sm">
                              {Object.entries(item).map(([itemKey, itemValue]) => (
                                <div key={itemKey}>
                                  <strong>{itemKey}: </strong>
                                  {Array.isArray(itemValue) 
                                    ? itemValue.join(', ')
                                    : String(itemValue)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            String(item)
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {rawResponse && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Raw Response</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}