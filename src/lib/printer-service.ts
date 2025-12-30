export const ESC_POS = {
  INIT: [0x1b, 0x40],
  TEXT_NORMAL: [0x1b, 0x21, 0x00],
  TEXT_BOLD: [0x1b, 0x21, 0x08],
  TEXT_DOUBLE_HEIGHT: [0x1b, 0x21, 0x10],
  TEXT_DOUBLE_WIDTH: [0x1b, 0x21, 0x20],
  TEXT_CENTER: [0x1b, 0x61, 0x01],
  TEXT_LEFT: [0x1b, 0x61, 0x00],
  TEXT_RIGHT: [0x1b, 0x61, 0x02],
  FEED_LINES: (n: number) => [0x1b, 0x64, n],
  CUT: [0x1d, 0x56, 0x41, 0x00],

  // QR Code commands (Model 2)
  QR_MODEL: [0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00],
  QR_SIZE: [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x06], // Size 6
  QR_ERROR: [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31], // Error correction level L
  QR_STORE: (len: number) => [
    0x1d,
    0x28,
    0x6b,
    (len + 3) & 0xff,
    ((len + 3) >> 8) & 0xff,
    0x31,
    0x50,
    0x30,
  ],
  QR_PRINT: [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30],
};

// Standard BLE UUIDs for Thermal Printers
const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
const PRINTER_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

export interface PrinterDevice {
  id: string;
  name: string;
  gatt?: {
    connect: () => Promise<any>;
  };
}

export class PrinterService {
  private device: any | null = null;
  private characteristic: any | null = null;
  private server: any | null = null;

  isConnected(): boolean {
    return !!this.characteristic && !!this.device?.gatt?.connected;
  }

  async connect(): Promise<boolean> {
    const nav: any = navigator;
    if (!nav.bluetooth) {
      throw new Error(
        'Bluetooth not accessible. Please use Chrome/Edge on Android/Desktop.'
      );
    }

    try {
      console.log('Requesting Bluetooth Device...');
      this.device = await nav.bluetooth.requestDevice({
        filters: [{ services: [PRINTER_SERVICE_UUID] }],
        optionalServices: [PRINTER_SERVICE_UUID],
      });

      if (!this.device) throw new Error('No device selected');

      console.log('Connecting to GATT Server...');
      this.device.addEventListener(
        'gattserverdisconnected',
        this.onDisconnected.bind(this)
      );

      this.server = await this.device.gatt.connect();
      console.log('Getting Service...');
      const service = await this.server.getPrimaryService(PRINTER_SERVICE_UUID);

      console.log('Getting Characteristic...');
      this.characteristic = await service.getCharacteristic(
        PRINTER_CHARACTERISTIC_UUID
      );

      console.log('Printer Connected!');
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  private onDisconnected() {
    console.log('Printer disconnected');
    this.characteristic = null;
    this.server = null;
  }

  async disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.onDisconnected();
  }

  async printText(
    text: string,
    style: 'NORMAL' | 'BOLD' | 'CENTER' | 'LEFT' | 'RIGHT' = 'NORMAL'
  ) {
    if (!this.isConnected()) throw new Error('Printer not connected');

    const encoder = new TextEncoder();
    const commands: number[] = [];

    // Style commands
    if (style === 'BOLD') commands.push(...ESC_POS.TEXT_BOLD);
    else commands.push(...ESC_POS.TEXT_NORMAL);

    if (style === 'CENTER') commands.push(...ESC_POS.TEXT_CENTER);
    else if (style === 'RIGHT') commands.push(...ESC_POS.TEXT_RIGHT);
    else commands.push(...ESC_POS.TEXT_LEFT);

    // Content
    // Note: Simple text encoding. For special chars, might need generic code page handling
    const data = encoder.encode(text + '\n');

    await this.sendCommand([...commands, ...Array.from(data)]);
  }

  async feed(lines: number = 2) {
    await this.sendCommand(ESC_POS.FEED_LINES(lines));
  }

  async cut() {
    await this.sendCommand(ESC_POS.CUT);
  }

  private async sendCommand(command: number[]) {
    if (!this.characteristic) return;

    // Bluetooth LE has a limit on packet size (usually 20 bytes for default MTU, can be higher)
    // We'll chunk it to be safe (e.g., 100 bytes if MTU negotiation happened, but 20 is safest base)
    // Many modern implementations handle 512, sticking to 512 chunks is usually fine for writing

    const chunkSize = 100;
    const buffer = new Uint8Array(command);

    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
    }
  }

  // Helper to print a receipt structure
  async printReceipt(transaction: {
    id: string;
    date: string;
    agentName: string;
    items: Array<{ name: string; price: number; weight: number }>;
    total: number;
  }) {
    try {
      await this.sendCommand(ESC_POS.INIT);

      // Header
      await this.printText('Kirim.com Agent', 'CENTER');
      await this.printText('Receipt / Bukti Tanda Terima', 'CENTER');
      await this.feed(1);

      // Info
      await this.printText(`Date: ${transaction.date}`);
      await this.printText(`Trx ID: ${transaction.id}`);
      await this.printText(`Agent: ${transaction.agentName}`);
      await this.printText('--------------------------------', 'CENTER');

      // Items
      for (const item of transaction.items) {
        await this.printText(`${item.name}`);
        await this.printText(
          `${item.weight}kg x Rp${item.price.toLocaleString('id-ID')}   Rp${(item.weight * item.price).toLocaleString('id-ID')}`,
          'RIGHT'
        );
      }

      await this.printText('--------------------------------', 'CENTER');

      // Total
      await this.printText(
        `TOTAL: Rp${transaction.total.toLocaleString('id-ID')}`,
        'BOLD'
      );
      await this.printText('--------------------------------', 'CENTER');

      // Footer
      await this.feed(1);
      await this.printText('Terima kasih!', 'CENTER');
      await this.printText('Simpan resi ini sebagai bukti.', 'CENTER');

      await this.feed(3);
      await this.cut();
    } catch (e) {
      console.error('Print receipt failed', e);
      throw e;
    }
  }
}

export const printerService = new PrinterService();
