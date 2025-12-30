export const ESC_POS = {
    INIT: [0x1B, 0x40],
    TEXT_NORMAL: [0x1B, 0x21, 0x00],
    TEXT_BOLD: [0x1B, 0x21, 0x08],
    TEXT_CENTER: [0x1B, 0x61, 0x01],
    TEXT_LEFT: [0x1B, 0x61, 0x00],
    FEED: [0x0A],
    CUT: [0x1D, 0x56, 0x41, 0x00]
};

export class PrinterService {
    private device: any | null = null;
    private characteristic: any | null = null;

    async connect() {
        const nav: any = navigator;
        if (!nav.bluetooth) {
            throw new Error('Bluetooth not accessible. Please use Chrome/Edge on Android/Desktop.');
        }

        try {
            this.device = await nav.bluetooth.requestDevice({
                filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // Standard service for many thermal printers
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
            });

            if (!this.device?.gatt) throw new Error('Device not found');

            const server = await this.device.gatt.connect();
            const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
            this.characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

            return true;
        } catch (error) {
            console.error('Connection failed:', error);
            throw error;
        }
    }

    async print(text: string) {
        if (!this.characteristic) throw new Error('Printer not connected');

        const encoder = new TextEncoder();
        const data = encoder.encode(text + '\n');

        // Send in chunks if needed, but for simple text, direct write is usually fine for BLE
        await this.characteristic.writeValue(new Uint8Array([...ESC_POS.INIT, ...ESC_POS.TEXT_NORMAL, ...data, ...ESC_POS.FEED, ...ESC_POS.FEED]));
    }
}

export const printerService = new PrinterService();
