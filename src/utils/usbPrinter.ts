import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';
import { WebUsbReceiptPrinter } from '@point-of-sale/webusb-receipt-printer';

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
      await this.device.connect();
      
      const usbDevice = (this.device as any).device as any; // Access underlying WebUSB device
      this.connectedDevice = {
        productName: usbDevice.productName,
        manufacturerName: usbDevice.manufacturerName,
        vendorId: usbDevice.vendorId,
        productId: usbDevice.productId
      };
      
      return this.connectedDevice;
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
      width: 32, // Default standard for 58mm printers. 42/48 for 80mm.
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
          .image(img, 384, 384, 'threshold') // 384px is standard for 58mm
          .cut()
          .encode();
      } else if (fileData.fileType === 'text' && fileData.htmlContent) {
        // Handle plain text
        result = encoder
          .initialize()
          .text(fileData.htmlContent)
          .newline()
          .cut()
          .encode();
      } else {
        // Fallback or generic message
        result = encoder
          .initialize()
          .text(`Printing: ${fileData.file.name}`)
          .newline()
          .text('Type: ' + fileData.fileType)
          .newline()
          .text('Direct USB printing for this format is experimental.')
          .newline()
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
