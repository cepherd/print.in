/**
 * PrintButton component for triggering print
 */

import React from 'react';
import { isMobileDevice } from '../utils/fileUtils';
import { usbPrinter, USBDevice } from '../utils/usbPrinter';

interface PrintButtonProps {
  fileData: {
    file: File;
    previewUrl?: string;
    fileType: string;
    htmlContent?: string;
  } | null;
}

export function PrintButton({ fileData }: PrintButtonProps) {
  const [device, setDevice] = React.useState<USBDevice | null>(usbPrinter.getConnectedDevice());
  const [isConnecting, setIsConnecting] = React.useState(false);

  if (!fileData) return null;

  const handleConnectUSB = async () => {
    setIsConnecting(true);
    try {
      const connected = await usbPrinter.connect();
      setDevice(connected);
    } catch (error: any) {
      alert('Failed to connect USB printer: ' + (error?.message || 'Unknown error') + '\n\nEnsure it is plugged in and you are using Chrome on Android or Desktop.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrintUSB = async () => {
    if (!device) return;
    try {
      await usbPrinter.print(fileData);
    } catch (error) {
      alert('Print failed: ' + (error as Error).message);
    }
  };

  const handlePrint = () => {
    const isMobile = isMobileDevice();
    
    if (isMobile && fileData.fileType === 'pdf' && fileData.previewUrl) {
      const printWindow = window.open(fileData.previewUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        alert('Please allow pop-ups to print on mobile.');
      }
      return;
    }

    window.print();
  };

  return (
    <div className="print-controls no-print d-flex gap-2">
      <button className="print-button" onClick={handlePrint}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        {isMobileDevice() && fileData.fileType === 'pdf' ? 'Open to Print' : 'Standard Print'}
      </button>

      {/* Direct USB Printing (Game Changer) */}
      {!device ? (
        <button 
          className="usb-button" 
          onClick={handleConnectUSB}
          disabled={isConnecting}
        >
          {isConnecting ? 'Searching...' : 'Connect USB Printer'}
        </button>
      ) : (
        <button className="usb-button print-now" onClick={handlePrintUSB}>
          <span className="dot pulse"></span>
          Print via USB ({device.productName || 'Printer'})
        </button>
      )}
    </div>
  );
}