/**
 * Utility functions for file handling and conversion
 */

import mammoth from 'mammoth';

export interface FileData {
  file: File;
  previewUrl?: string;
  htmlContent?: string;
  fileType: string;
}

export interface PrintSettings {
  pageSize: 'A4' | 'A5' | 'Letter' | 'Legal' | 'Tabloid';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'normal' | 'narrow' | 'wide';
  scale: number;
  fitToPage: boolean;
  // Grid settings for duplicates
  copies: number;
  gridColumns: number;
  gridGap: number;
}



/**
 * Detect file type category
 */
export function getFileTypeCategory(file: File): string {
  const type = file.type.toLowerCase();
  
  // Images
  if (type.startsWith('image/')) {
    return 'image';
  }
  
  // PDF
  if (type === 'application/pdf') {
    return 'pdf';
  }
  
  // Word documents
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'application/msword') {
    return 'word';
  }
  
  // Excel
  if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      type === 'application/vnd.ms-excel') {
    return 'excel';
  }
  
  // PowerPoint
  if (type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      type === 'application/vnd.ms-powerpoint') {
    return 'powerpoint';
  }
  
  // Text files
  if (type === 'text/plain' || type === 'text/csv' || type === 'text/html') {
    return 'text';
  }
  
  // Other
  return 'other';
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create preview URL for image files
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Convert DOCX file to HTML using mammoth.js
 */
export async function convertDocxToHtml(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error converting DOCX:', error);
    throw new Error('Failed to convert document');
  }
}

/**
 * Read text file content
 */
export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

/**
 * Process file based on type and return preview data
 */
export async function processFile(file: File): Promise<FileData> {
  const fileType = getFileTypeCategory(file);
  const fileData: FileData = {
    file,
    fileType,
  };

  switch (fileType) {
    case 'image':
      fileData.previewUrl = createImagePreview(file);
      break;
      
    case 'pdf':
      fileData.previewUrl = URL.createObjectURL(file);
      break;
      
    case 'word':
      if (file.name.endsWith('.docx')) {
        fileData.htmlContent = await convertDocxToHtml(file);
      } else {
        // For .doc files, just show a message
        fileData.htmlContent = '<div class="fallback-message">Preview not available for .doc files. Please save as .docx or print directly.</div>';
      }
      break;
      
    case 'text':
      fileData.htmlContent = await readTextFile(file);
      break;
      
    case 'excel':
    case 'powerpoint':
    case 'other':
      fileData.previewUrl = URL.createObjectURL(file);
      break;
      
    default:
      fileData.htmlContent = '<div class="fallback-message">Preview not available for this file type.</div>';
  }

  return fileData;
}

/**
 * Clean up object URLs to free memory
 */
export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}