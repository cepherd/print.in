import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';
import WebUsbReceiptPrinter from '@point-of-sale/webusb-receipt-printer';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
   * Request and connect to a USB printer via WebUSB
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
   * Check if RawBT plugin is available (WebSocket server on 40213)
   */
  async checkRawBT(): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new WebSocket('ws://127.0.0.1:40213/');
      const timeout = setTimeout(() => {
        socket.close();
        resolve(false);
      }, 1000);

      socket.onopen = () => {
        clearTimeout(timeout);
        socket.close();
        resolve(true);
      };

      socket.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    });
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
   * Check if a printer is connected via WebUSB
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
   * Encode file data into ESC/POS commands
   */
  private async encode(fileData: { file: File; fileType: string; previewUrl?: string; htmlContent?: string }): Promise<Uint8Array> {
    const encoder = new ReceiptPrinterEncoder({
      language: 'esc-pos',
      width: 48, 
    });

    if (fileData.fileType === 'image' && fileData.previewUrl) {
      const img = new Image();
      img.src = fileData.previewUrl;
      await new Promise((resolve) => (img.onload = resolve));
      
      return encoder
        .initialize()
        .align('center')
        .image(img, 576, 576, 'atkinson')
        .newline(5)
        .cut()
        .encode();
    } else if (fileData.fileType === 'pdf') {
      const arrayBuffer = await fileData.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      encoder.initialize().align('center');

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const targetWidth = 576;
        const viewport = page.getViewport({ scale: 1 });
        const scale = targetWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create canvas context');

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
          canvasContext: context,
          viewport: scaledViewport
        }).promise;

        encoder.image(canvas, targetWidth, scaledViewport.height, 'atkinson');
        if (i < numPages) encoder.newline(2);
      }

      return encoder.newline(6).cut().encode();
    } else if (fileData.fileType === 'text' && fileData.htmlContent) {
      return encoder
        .initialize()
        .text(fileData.htmlContent)
        .newline(6)
        .cut()
        .encode();
    } else {
      return encoder
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
  }

  /**
   * Print via WebUSB (Current connected device)
   */
  async print(fileData: { file: File; fileType: string; previewUrl?: string; htmlContent?: string }): Promise<void> {
    if (!this.device) {
      throw new Error('Printer not connected. Please connect via USB first.');
    }

    try {
      const data = await this.encode(fileData);
      await this.device.print(data);
    } catch (error) {
      console.error('WebUSB Print failed:', error);
      throw new Error('Could not send data to printer.');
    }
  }

  /**
   * Print via RawBT Plugin
   */
  async printViaPlugin(fileData: { file: File; fileType: string; previewUrl?: string; htmlContent?: string }): Promise<void> {
    try {
      const data = await this.encode(fileData);
      return new Promise((resolve, reject) => {
        const socket = new WebSocket('ws://127.0.0.1:40213/');
        
        socket.onopen = () => {
          socket.send(data);
          setTimeout(() => {
            socket.close();
            resolve();
          }, 500);
        };

        socket.onerror = (err) => {
          console.error('RawBT WebSocket error:', err);
          reject(new Error('RawBT plugin not found. Please install RawBT from Play Store and enable its background service.'));
        };

        setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            socket.close();
            reject(new Error('Connection to RawBT timed out.'));
          }
        }, 3000);
      });
    } catch (error) {
      console.error('Plugin Print failed:', error);
      throw error;
    }
  }
}

export const usbPrinter = new UsbPrinterService();

