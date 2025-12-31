'use client'

// ESC/POS Commands for Thermal Printers
export class ThermalPrinter {
    private device: USBDevice | null = null
    private interface: USBInterface | null = null
    private endpoint: USBEndpoint | null = null

    async connect() {
        try {
            // Request USB device with thermal printer vendor IDs
            // Common: 0x0416 (SGDY), 0x04b8 (Epson), 0x0483 (Zjiang)
            this.device = await navigator.usb.requestDevice({
                filters: [
                    { vendorId: 0x0416 }, // SGDY
                    { vendorId: 0x04b8 }, // Epson
                    { vendorId: 0x0483 }, // Zjiang
                ]
            })

            await this.device.open()
            await this.device.selectConfiguration(1)
            await this.device.claimInterface(0)

            // Find OUT endpoint
            const iface = this.device.configuration?.interfaces[0]
            this.interface = iface?.alternate
            this.endpoint = this.interface?.endpoints.find(e => e.direction === 'out')

            return true
        } catch (error) {
            console.error('Failed to connect printer:', error)
            throw new Error('No printer connected or permission denied')
        }
    }

    async disconnect() {
        if (this.device) {
            await this.device.close()
            this.device = null
        }
    }

    // ESC/POS command builders
    private encode(text: string) {
        return new TextEncoder().encode(text)
    }

    private buildCommand(...bytes: number[]) {
        return new Uint8Array(bytes)
    }

    async print(content: string) {
        if (!this.device || !this.endpoint) throw new Error('Printer not connected')

        const commands: Uint8Array[] = []

        // Initialize printer
        commands.push(this.buildCommand(0x1B, 0x40)) // ESC @

        // Set alignment center
        commands.push(this.buildCommand(0x1B, 0x61, 0x01))

        // Bold on
        commands.push(this.buildCommand(0x1B, 0x45, 0x01))
        commands.push(this.encode('RESI PENGIRIMAN\n\n'))
        commands.push(this.buildCommand(0x1B, 0x45, 0x00)) // Bold off

        // Set alignment left
        commands.push(this.buildCommand(0x1B, 0x61, 0x00))

        // Print content
        commands.push(this.encode(content))

        // Line feeds
        commands.push(this.encode('\n\n\n'))

        // Cut paper
        commands.push(this.buildCommand(0x1D, 0x56, 0x00))

        // Send all commands
        for (const cmd of commands) {
            await this.device.transferOut(this.endpoint.endpointNumber, cmd)
        }
    }

    async printReceipt(data: {
        trackingNumber: string
        sender: string
        receiver: string
        address: string
        weight: string
        service: string
    }) {
        const receipt = `
Tracking: ${data.trackingNumber}
--------------------------------
Dari: ${data.sender}
Kepada: ${data.receiver}
${data.address}

Layanan: ${data.service}
Berat: ${data.weight}
--------------------------------
Terima kasih!
        `.trim()

        await this.print(receipt)
    }
}
