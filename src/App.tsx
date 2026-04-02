import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { FilePreview } from './components/FilePreview';
import { PrintButton } from './components/PrintButton';
import { PrintSettingsComponent } from './components/PrintSettings';
import { DynamicPrintStyles } from './components/DynamicPrintStyles';
import { revokeObjectUrl } from './utils/fileUtils';
import type { FileData, PrintSettings } from './utils/fileUtils';
import './index.css';

export function App() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'normal',
    scale: 100,
    fitToPage: true,
    copies: 1,
    gridColumns: 2,
    gridGap: 10,
  });

  const handleFileSelected = (newFileData: FileData) => {
    // Clean up previous URL if exists
    if (fileData?.previewUrl) {
      revokeObjectUrl(fileData.previewUrl);
    }
    setFileData(newFileData);
  };

  const handleClear = () => {
    if (fileData?.previewUrl) {
      revokeObjectUrl(fileData.previewUrl);
    }
    setFileData(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Print.in</h1>
        <p className="subtitle">
          The universal printer. Connect any USB printer directly or print through your browser.
        </p>
      </header>

      <main className="app-main">
        {!fileData ? (
          <FileUpload 
            onFileSelected={handleFileSelected} 
            isProcessing={isProcessing} 
          />
        ) : (
          <div className="preview-section">
            <DynamicPrintStyles settings={printSettings} />
            <div className="preview-layout">
              <div className="preview-main">
                <div className="preview-controls">
                  <FilePreview 
                    fileData={fileData} 
                    onClear={handleClear} 
                    settings={printSettings}
                  />
                  <PrintButton fileData={fileData} />
                </div>
              </div>
              <aside className="preview-sidebar no-print">
                <PrintSettingsComponent 
                  settings={printSettings} 
                  onSettingsChange={setPrintSettings} 
                  fileType={fileData.fileType}
                />
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer no-print">
        <p>Supports: Images, PDF, DOCX, DOC, XLS, XLSX, PPT, PPTX, TXT, and more</p>
      </footer>
    </div>
  );
}

export default App;
