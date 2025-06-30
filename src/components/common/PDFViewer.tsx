"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";

// Configuração do worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
  showControls?: boolean;
}

export function PDFViewer({
  fileUrl,
  fileName,
  className,
  showControls = true,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    setError("Erro ao carregar o PDF: " + error.message);
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "documento.pdf";
    link.click();
  };

  if (error) {
    return (
      <ErrorMessage
        title="Erro no PDF"
        message={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
        }}
      />
    );
  }

  return (
    <div className={className}>
      {/* Controles */}
      {showControls && (
        <div className="flex items-center justify-between p-4 bg-gray-100  rounded-t-lg border-b">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Página {pageNumber} de {numPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-sm">{Math.round(scale * 100)}%</span>

            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Visualizador */}
      <div className="relative bg-gray-50  rounded-b-lg overflow-auto max-h-96">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner text="Carregando PDF..." />
          </div>
        )}

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          className="flex justify-center p-4"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading=""
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
}
