/**
 * FileUpload component with drag-and-drop support
 */

import React, { useState, useRef } from 'react';
import { processFile } from '../utils/fileUtils';
import type { FileData } from '../utils/fileUtils';

interface FileUploadProps {
  onFileSelected: (fileData: FileData) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelected, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const fileData = await processFile(file);
      onFileSelected(fileData);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`upload-area ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="file-input"
        accept="*/*"
      />
      <div className="upload-content">
        <svg
          className="upload-icon"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <h2>Upload File</h2>
        <p>Drag and drop a file here, or click to browse</p>
        <p className="supported-formats">
          Supports: Images, PDF, DOCX, DOC, XLS, XLSX, PPT, PPTX, TXT, and more
        </p>
        {isProcessing && (
          <p className="processing">Processing file...</p>
        )}
      </div>
    </div>
  );
}