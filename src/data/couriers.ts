// Courier data for mockup shipping calculations
// Future: Replace with API integration

export interface CourierService {
    id: string
    courier: string
    courierCode: string
    service: string
    serviceType: 'Regular' | 'Express' | 'Economy' | 'Cargo'
    description: string
    estimatedDays: string
    logoUrl: string
}

export const courierList = [
    {
        code: 'jne',
        name: 'JNE',
        logo: '/couriers/jne.png',
    },
    {
        code: 'jnt',
        name: 'J&T Express',
        logo: '/couriers/jnt.png',
    },
    {
        code: 'sicepat',
        name: 'SiCepat',
        logo: '/couriers/sicepat.png',
    },
    {
        code: 'anteraja',
        name: 'AnterAja',
        logo: '/couriers/anteraja.png',
    },
    {
        code: 'ninja',
        name: 'Ninja Xpress',
        logo: '/couriers/ninja.png',
    },
    {
        code: 'pos',
        name: 'POS Indonesia',
        logo: '/couriers/pos.png',
    },
    {
        code: 'tiki',
        name: 'TIKI',
        logo: '/couriers/tiki.png',
    },
]

// Mock shipping rate calculation
export function calculateShippingRate(
    originId: string,
    destinationId: string,
    weight: number
): CourierService[] {
    // Base rate calculation (mockup)
    const baseRate = 10000
    const weightFactor = Math.ceil(weight / 1000) * 2000
    const distanceFactor = Math.abs(parseInt(originId) - parseInt(destinationId)) * 500

    const rates: CourierService[] = [
        {
            id: '1',
            courier: 'JNE',
            courierCode: 'jne',
            service: 'JNE REG',
            serviceType: 'Regular',
            description: 'Layanan reguler JNE',
            estimatedDays: '2-3 hari',
            logoUrl: '/couriers/jne.png',
        },
        {
            id: '2',
            courier: 'JNE',
            courierCode: 'jne',
            service: 'JNE YES',
            serviceType: 'Express',
            description: 'Layanan express JNE',
            estimatedDays: '1-2 hari',
            logoUrl: '/couriers/jne.png',
        },
        {
            id: '3',
            courier: 'J&T Express',
            courierCode: 'jnt',
            service: 'J&T REG',
            serviceType: 'Regular',
            description: 'Layanan reguler J&T',
            estimatedDays: '2-4 hari',
            logoUrl: '/couriers/jnt.png',
        },
        {
            id: '4',
            courier: 'J&T Express',
            courierCode: 'jnt',
            service: 'J&T EXPRESS',
            serviceType: 'Express',
            description: 'Layanan express J&T',
            estimatedDays: '1-2 hari',
            logoUrl: '/couriers/jnt.png',
        },
        {
            id: '5',
            courier: 'SiCepat',
            courierCode: 'sicepat',
            service: 'SIUNT REG',
            serviceType: 'Regular',
            description: 'Layanan reguler SiCepat',
            estimatedDays: '2-3 hari',
            logoUrl: '/couriers/sicepat.png',
        },
        {
            id: '6',
            courier: 'SiCepat',
            courierCode: 'sicepat',
            service: 'BEST',
            serviceType: 'Express',
            description: 'Layanan express SiCepat',
            estimatedDays: '1-2 hari',
            logoUrl: '/couriers/sicepat.png',
        },
        {
            id: '7',
            courier: 'AnterAja',
            courierCode: 'anteraja',
            service: 'Regular',
            serviceType: 'Regular',
            description: 'Layanan reguler AnterAja',
            estimatedDays: '3-4 hari',
            logoUrl: '/couriers/anteraja.png',
        },
        {
            id: '8',
            courier: 'Ninja Xpress',
            courierCode: 'ninja',
            service: 'Standard',
            serviceType: 'Regular',
            description: 'Layanan standard Ninja',
            estimatedDays: '2-4 hari',
            logoUrl: '/couriers/ninja.png',
        },
    ]

    // Add mockup prices to each service
    return rates.map((service, index) => ({
        ...service,
        price: baseRate + weightFactor + distanceFactor + index * 3000,
    })) as any
}

// Mock tracking data
export interface TrackingStatus {
    date: string
    time: string
    status: string
    location: string
    description: string
}

export function generateMockTracking(courier: string, waybill: string): {
    waybill: string
    courier: string
    currentStatus: string
    estimatedDelivery: string
    history: TrackingStatus[]
} {
    const now = new Date()
    const statuses: TrackingStatus[] = [
        {
            date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID'),
            time: '09:15',
            status: 'MANIFEST',
            location: 'Jakarta Selatan',
            description: 'Paket telah diterima di agen',
        },
        {
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID'),
            time: '14:30',
            status: 'PICK UP',
            location: 'Jakarta Selatan',
            description: 'Paket telah di-pickup oleh kurir',
        },
        {
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID'),
            time: '18:45',
            status: 'IN TRANSIT',
            location: 'Jakarta Hub',
            description: 'Paket dalam perjalanan ke kota tujuan',
        },
        {
            date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID'),
            time: '08:20',
            status: 'IN TRANSIT',
            location: 'Bandung Hub',
            description: 'Paket tiba di kota tujuan',
        },
        {
            date: now.toLocaleDateString('id-ID'),
            time: '10:30',
            status: 'OUT FOR DELIVERY',
            location: 'Bandung',
            description: 'Paket sedang dalam pengantaran',
        },
    ]

    return {
        waybill,
        courier: courier.toUpperCase(),
        currentStatus: 'OUT FOR DELIVERY',
        estimatedDelivery: 'Hari ini',
        history: statuses.reverse(), // Latest first
    }
}

export function generateDeliveredTracking(courier: string, waybill: string) {
    const result = generateMockTracking(courier, waybill)
    result.history.unshift({
        date: new Date().toLocaleDateString('id-ID'),
        time: '14:00',
        status: 'DELIVERED',
        location: 'Bandung',
        description: 'Paket telah diterima oleh [Penerima]',
    })
    result.currentStatus = 'DELIVERED'
    result.estimatedDelivery = '-'
    return result
}
