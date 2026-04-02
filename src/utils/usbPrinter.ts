import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';
import WebUsbReceiptPrinter from '@point-of-sale/webusb-receipt-printer';

export interface USBDevice {
  productName?: string;
  manufacturerName?: string;
  vendorId: number;
  productId: number;
}

class UsbPrinterService {
  private device: any | null = null;
  private connectedDevice: USBDevice | null = null;

  /**
   * Request and connect to a USB printer
   */
  async connect(): Promise<USBDevice | null> {
    try {
      this.device = new WebUsbReceiptPrinter();
      
      // Setup a promise to wait for the connection details
      const connectionPromise = new Promise<USBDevice>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
        
        this.device.addEventListener('connected', (deviceInfo: any) => {
          clearTimeout(timeout);
          this.connectedDevice = {
            productName: deviceInfo.productName,
            manufacturerName: deviceInfo.manufacturerName,
            vendorId: deviceInfo.vendorId,
            productId: deviceInfo.productId
          };
          resolve(this.connectedDevice);
        });
      });

      await this.device.connect();
      return await connectionPromise;
    } catch (error) {
      console.error('USB connection failed:', error);
      this.device = null;
      this.connectedDevice = null;
      throw error;
    }
  }

  /**
   * Disconnect from the current printer
   */
  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.disconnect();
      this.device = null;
      this.connectedDevice = null;
    }
  }

  /**
   * Check if a printer is connected
   */
  isConnected(): boolean {
    return this.device !== null;
  }

  /**
   * Get current connected device info
   */
  getConnectedDevice(): USBDevice | null {
    return this.connectedDevice;
  }

  /**
   * Print a file or text via USB
   */
  async print(fileData: { file: File; fileType: string; previewUrl?: string; htmlContent?: string }): Promise<void> {
    if (!this.device) {
      throw new Error('Printer not connected. Please connect via USB first.');
    }

    const encoder = new ReceiptPrinterEncoder({
      language: 'esc-pos',
      width: 48, // 48 is standard for 80mm. 32 for 58mm. 48 is safer for most desktop/thermal.
    });

    try {
      let result: Uint8Array;

      if (fileData.fileType === 'image' && fileData.previewUrl) {
        // Handle images
        const img = new Image();
        img.src = fileData.previewUrl;
        await new Promise((resolve) => (img.onload = resolve));
        
        result = encoder
          .initialize()
          .align('center')
          .image(img, 576, 576, 'atkinson') // Atkinson dithering is much better than threshold
          .newline(5) // Feed 5 lines so the print is visible past the cutter
          .cut()
          .encode();
      } else if (fileData.fileType === 'text' && fileData.htmlContent) {
        // Handle plain text
        result = encoder
          .initialize()
          .text(fileData.htmlContent)
          .newline(6) // Feed 6 lines
          .cut()
          .encode();
      } else {
        // Generic fallback
        result = encoder
          .initialize()
          .align('center')
          .text('--- Print.in Direct USB ---')
          .newline()
          .align('left')
          .text(`File: ${fileData.file.name}`)
          .newline()
          .text(`Type: ${fileData.fileType}`)
          .newline()
          .text(`Size: ${fileData.file.size} bytes`)
          .newline(8)
          .cut()
          .encode();
      }

      await this.device.print(result);
    } catch (error) {
      console.error('Print failed:', error);
      throw new Error('Could not send data to printer.');
    }
  }
}

export const usbPrinter = new UsbPrinterService();
