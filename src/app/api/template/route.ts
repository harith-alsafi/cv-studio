import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'template1.yaml');
    const fileData = readFileSync(templatePath, 'utf-8');
    return NextResponse.json({ template: fileData });
  } catch (error) {
    console.error('Error reading template:', error);
    return NextResponse.json(
      { error: 'Failed to read template file' },
      { status: 500 }
    );
  }
} 