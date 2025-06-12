'use client'

import React, { Suspense } from 'react'
import ResumeEditor from '@/components/resume-editor'

interface OpenAIResponse {
  role: string
  content: string
  refusal: null | string
}

export default function CVEditor() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeEditor/>
    </Suspense>
  );
}