/**
 * PrintButton component for triggering print
 */

import React from 'react';

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
    window.print();
  };

  return (
    <button className="print-button no-print" onClick={handlePrint}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Print
    </button>
  );
}