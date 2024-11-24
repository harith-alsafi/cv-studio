import React from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Download } from 'lucide-react'

interface PDFViewerProps {
  pdfUrl: string | null
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  if (!pdfUrl) {
    return (
      <div className="h-full flex items-center justify-center border rounded">
        No PDF generated yet
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end space-x-2 mb-2">
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
      <iframe
        src={pdfUrl}
        className="w-full flex-1 border rounded"
        title="Generated CV"
      />
    </div>
  )
}

