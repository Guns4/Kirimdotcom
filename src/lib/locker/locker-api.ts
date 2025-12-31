// Mock API for Smart Locker Integration
// In production, this would integrate with actual provider APIs (PaxelBox, PopBox, etc.)

export interface LockerLocation {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
    available_sizes: ('S' | 'M' | 'L')[]
}

export interface BookingRequest {
    locationId: string
    size: 'S' | 'M' | 'L'
    trackingNumber?: string
}

export interface BookingResponse {
    success: boolean
    bookingId: string
    lockerCode: string
    address: string
    expiryTime: Date
}

export class SmartLockerAPI {
    private apiKey: string
    private baseUrl: string

    constructor(provider: 'PaxelBox' | 'PopBox' = 'PaxelBox') {
        this.apiKey = process.env.SMART_LOCKER_API_KEY || 'demo_key'
        this.baseUrl = provider === 'PaxelBox' 
            ? 'https://api.paxelbox.com/v1' 
            : 'https://api.popbox.id/v1'
    }

    async getNearbyLocations(latitude: number, longitude: number, radius: number = 5): Promise<LockerLocation[]> {
        // MOCK DATA - In production, call actual API
        return [
            {
                id: 'LOC001',
                name: 'PaxelBox - Mall Grand Indonesia',
                address: 'Jl. MH Thamrin No.1, Jakarta Pusat',
                latitude: -6.1944,
                longitude: 106.8229,
                available_sizes: ['S', 'M', 'L']
            },
            {
                id: 'LOC002',
                name: 'PaxelBox - Senayan City',
                address: 'Jl. Asia Afrika, Jakarta Selatan',
                latitude: -6.2253,
                longitude: 106.7997,
                available_sizes: ['S', 'M']
            },
            {
                id: 'LOC003',
                name: 'PaxelBox - Plaza Semanggi',
                address: 'Jl. Jend. Sudirman, Jakarta Selatan',
                latitude: -6.2214,
                longitude: 106.8083,
                available_sizes: ['M', 'L']
            }
        ]
    }

    async bookLocker(request: BookingRequest): Promise<BookingResponse> {
        // MOCK - Simulate API call
        const lockerCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const expiryTime = new Date()
        expiryTime.setHours(expiryTime.getHours() + 24) // 24 hour expiry

        return {
            success: true,
            bookingId: `BK${Date.now()}`,
            lockerCode,
            address: 'Jl. MH Thamrin No.1, Jakarta Pusat',
            expiryTime
        }
    }

    async cancelBooking(bookingId: string): Promise<boolean> {
        // MOCK
        return true
    }

    async getBookingStatus(bookingId: string): Promise<string> {
        // MOCK
        return 'BOOKED'
    }
}
