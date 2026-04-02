import React, { useEffect, useState } from 'react';
import { usbPrinter, USBDevice } from '../utils/usbPrinter';
import { isAndroid } from '../utils/fileUtils';

export function USBStatus() {
  const [device, setDevice] = useState<USBDevice | null>(usbPrinter.getConnectedDevice());
  const [isPluginAvailable, setIsPluginAvailable] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Poll for device changes
    const interval = setInterval(() => {
      const currentDevice = usbPrinter.getConnectedDevice();
      setDevice(currentDevice);
    }, 2000);

    // Initial check for plugin
    if (isAndroid()) {
      usbPrinter.checkRawBT().then(available => {
        setIsPluginAvailable(available);
      });
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="usb-status-wrapper">
      <div className={`usb-status-indicator ${device ? 'connected' : 'disconnected'}`}>
        <div className="status-dot"></div>
        <div className="status-info">
          <span className="status-label">Direct USB:</span>
          <span className="status-value">
            {device ? (device.productName || 'Printer Connected') : 'Not Connected'}
          </span>
        </div>
      </div>

      {isAndroid() && (
        <div className={`plugin-status ${isPluginAvailable ? 'available' : 'unavailable'}`}>
          <div className="plugin-info">
            <span className="status-label">Print Engine:</span>
            <span className="status-value">
              {isPluginAvailable ? 'Settle (RawBT Active)' : 'Not Found'}
            </span>
          </div>
          
          {!isPluginAvailable && (
            <a 
              href="https://play.google.com/store/apps/details?id=ru.a402d.rawbt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="download-plugin-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Get Plugin
            </a>
          )}
        </div>
      )}
    </div>
  );
}
