/**
 * FilePreview component for displaying different file types
 */

import React from 'react';
import { formatFileSize } from '../utils/fileUtils';
import type { FileData, PrintSettings } from '../utils/fileUtils';

interface FilePreviewProps {
  fileData: FileData | null;
  onClear: () => void;
  settings: PrintSettings;
}

export function FilePreview({ fileData, onClear, settings }: FilePreviewProps) {
  if (!fileData) return null;

  const { file, previewUrl, htmlContent, fileType } = fileData;

  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        const containerStyle = settings.copies > 1 ? {
          display: 'grid',
          gridTemplateColumns: `repeat(${settings.gridColumns}, 1fr)`,
          gap: `${settings.gridGap}px`,
        } : {};

        return (
          <div className="preview-image-container" style={containerStyle}>
            {Array.from({ length: settings.copies }).map((_, index) => (
              <img 
                key={index}
                src={previewUrl} 
                alt={`${file.name} (Copy ${index + 1})`} 
                className="preview-image" 
              />
            ))}
          </div>
        );

      case 'pdf':
        return (
          <div className="preview-pdf-container">
            <iframe
              src={previewUrl}
              className="preview-pdf"
              title={file.name}
            />
          </div>
        );

      case 'word':
        if (htmlContent) {
          return (
            <div className="preview-html-container">
              <div 
                className="preview-html"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          );
        }
        return (
          <div className="fallback-preview">
            <p>Word document: {file.name}</p>
            <p className="fallback-hint">Please print to view the full document</p>
          </div>
        );

      case 'text':
        return (
          <div className="preview-text-container">
            <pre className="preview-text">{htmlContent}</pre>
          </div>
        );

      case 'excel':
      case 'powerpoint':
      case 'other':
        return (
          <div className="fallback-preview">
            <svg
              className="file-icon-large"
              width="96"
              height="96"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3>{file.name}</h3>
            <p>File size: {formatFileSize(file.size)}</p>
            <p className="fallback-hint">
              {fileType === 'excel' && 'Excel spreadsheet - Please print to view'}
              {fileType === 'powerpoint' && 'PowerPoint presentation - Please print to view'}
              {fileType === 'other' && 'File preview not available - Please print to view'}
            </p>
          </div>
        );

      default:
        return (
          <div className="fallback-preview">
            <p>Unsupported file type</p>
          </div>
        );
    }
  };

  return (
    <div className="preview-wrapper" id="print-area">
      <div className="preview-header no-print">
        <div className="file-info">
          <h3>{file.name}</h3>
          <span className="file-meta">{formatFileSize(file.size)}</span>
        </div>
        <button className="clear-button" onClick={onClear}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      </div>
      
      <div className="preview-content">
        {renderPreview()}
      </div>
    </div>
  );
}