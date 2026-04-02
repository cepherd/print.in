import React from 'react';
import { PrintSettings } from '../utils/fileUtils';

interface DynamicPrintStylesProps {
  settings: PrintSettings;
}

export function DynamicPrintStyles({ settings }: DynamicPrintStylesProps) {
  const { pageSize, orientation, margin, scale, fitToPage } = settings;

  // Margin values
  const marginMap = {
    none: '0',
    normal: '1cm',
    narrow: '0.5cm',
    wide: '2cm',
  };

  const marginValue = marginMap[margin];

  // Logic for fitToPage vs scale
  // Browser print dialog usually handles fit to page, but we can attempt to 
  // provide a better starting point by applying a scale to the preview content.
  const appliedScale = fitToPage ? 'auto' : `${scale / 100}`;

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        @page {
          size: ${pageSize} ${orientation};
          margin: ${marginValue};
        }

        .preview-content {
          ${fitToPage ? 'width: 100% !important; height: auto !important;' : ''}
          ${!fitToPage ? `transform: scale(${appliedScale}); transform-origin: top center;` : ''}
        }

        /* Adjustments for different file types when printing */
        .preview-image-container {
          ${settings.copies > 1 ? `
            display: grid !important;
            grid-template-columns: repeat(${settings.gridColumns}, 1fr) !important;
            gap: ${settings.gridGap}px !important;
          ` : ''}
        }

        .preview-image {
          ${fitToPage ? 'max-width: 100% !important; height: auto !important; object-fit: contain !important;' : ''}
          page-break-inside: avoid;
        }
        
        .preview-pdf-container {
          ${fitToPage ? 'height: auto !important; min-height: 100vh !important;' : ''}
        }
      }
    ` }} />
  );
}
