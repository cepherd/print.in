/**
 * PrintButton component for triggering print
 */

import React from 'react';
import { isMobileDevice } from '../utils/fileUtils';

interface PrintButtonProps {
  fileData: {
    file: File;
    previewUrl?: string;
    fileType: string;
  } | null;
}

export function PrintButton({ fileData }: PrintButtonProps) {
  if (!fileData) return null;

  const handlePrint = () => {
    const isMobile = isMobileDevice();
    
    // For PDFs on mobile, printing the current window with an iframe 
    // is notoriously broken. Opening the PDF in a new tab is the standard fix.
    if (isMobile && fileData.fileType === 'pdf' && fileData.previewUrl) {
      const printWindow = window.open(fileData.previewUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        // Some mobile browsers will show the print dialog automatically for PDFs 
        // when opened directly. If not, the user has the browser's native share/print.
      } else {
        alert('Please allow pop-ups to print on mobile.');
      }
      return;
    }

    // Standard print for images, text, and all desktop browsers
    window.print();
  };

  return (
    <button className="print-button no-print" onClick={handlePrint}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      {isMobileDevice() && fileData.fileType === 'pdf' ? 'Open to Print' : 'Print'}
    </button>
  );
}