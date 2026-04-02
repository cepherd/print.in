import React, { useEffect, useState } from 'react';
import { isMobileDevice, isAndroid } from '../utils/fileUtils';
import { usbPrinter, USBDevice } from '../utils/usbPrinter';
import { USBStatus } from './USBStatus';

interface PrintButtonProps {
  fileData: {
    file: File;
    previewUrl?: string;
    fileType: string;
    htmlContent?: string;
  } | null;
}

export function PrintButton({ fileData }: PrintButtonProps) {
  const [device, setDevice] = useState<USBDevice | null>(usbPrinter.getConnectedDevice());
  const [isPluginAvailable, setIsPluginAvailable] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Check plugin periodicially if on Android
    if (isAndroid()) {
      const checkPlugin = async () => {
        const available = await usbPrinter.checkRawBT();
        setIsPluginAvailable(available);
      };
      checkPlugin();
      const interval = setInterval(checkPlugin, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Sync device state
    const interval = setInterval(() => {
      setDevice(usbPrinter.getConnectedDevice());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
    setIsPrinting(true);
    setPrintStatus('idle');
    try {
      await usbPrinter.print(fileData);
      setPrintStatus('success');
      setTimeout(() => setPrintStatus('idle'), 3000);
    } catch (error) {
      setPrintStatus('error');
      alert('Print failed: ' + (error as Error).message);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintPlugin = async () => {
    setIsPrinting(true);
    setPrintStatus('idle');
    try {
      await usbPrinter.printViaPlugin(fileData);
      setPrintStatus('success');
      setTimeout(() => setPrintStatus('idle'), 3000);
    } catch (error) {
      setPrintStatus('error');
      alert('Plugin print failed: ' + (error as Error).message);
    } finally {
      setIsPrinting(false);
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
    <div className="print-controls-container no-print">
      <USBStatus />
      
      <div className="print-actions d-flex gap-2">
        <button className="print-button" onClick={handlePrint}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          {isMobileDevice() && fileData.fileType === 'pdf' ? 'Open to Print' : 'Standard Print'}
        </button>

        {/* Direct USB Printing */}
        {!device && !isPluginAvailable ? (
          <button 
            className="usb-button" 
            onClick={handleConnectUSB}
            disabled={isConnecting}
          >
            {isConnecting ? 'Searching...' : 'Connect USB'}
          </button>
        ) : (
          <>
            {device && (
              <button 
                className={`usb-button ${isPrinting ? 'printing' : ''} ${printStatus === 'success' ? 'success' : ''}`} 
                onClick={handlePrintUSB}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <span className="spinner"></span>
                ) : printStatus === 'success' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="dot pulse"></span>
                )}
                USB Print ({device.productName || 'Printer'})
              </button>
            )}

            {isPluginAvailable && (
              <button 
                className={`plugin-button ${isPrinting ? 'printing' : ''} ${printStatus === 'success' ? 'success' : ''}`} 
                onClick={handlePrintPlugin}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <span className="spinner"></span>
                ) : printStatus === 'success' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="dot pulse"></span>
                )}
                Plugin Print (RawBT)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}