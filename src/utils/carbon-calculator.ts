import { CityCoordinate, getCityCoordinate } from "@/data/city-coordinates"

export interface EmissionResult {
    distanceKm: number
    emissionKg: number
    comparisons: {
        label: string
        value: string
        icon: string
    }[]
}

// Factors
// Road transport (Truck/Van) approx 0.1 - 0.2 kg CO2 per ton-km
// For small parcels, we can estimate per kg-km or simply use a higher factor for LCV (Light Commercial Vehicle)
// LCV Emission: ~0.15 kg CO2 per vehicle-km? No, that's too simple.
// Parcel delivery estimate: ~100g CO2 per ton-km is common for efficient trucking.
// Let's use user's suggestion: "0.1 kg CO2/km" multiplied by weight factor?
// User prompt: "Input: Jarak Tempuh (Asal -> Tujuan) x Berat Paket x Faktor Emisi"
// User Example: "Truk Diesel = 0.1 kg CO2/km" (This might imply per kg of package per km? Or just distance factor?)
// Let's assume a formula: Distance (km) * Weight (ton) * 0.2 (kg CO2/ton-km) * RouteEfficiencyFactor (1.5 for non-straight roads)

// Revised Simple Formula for "Shock Value" / Education:
// Distance (km) * Weight (kg) * 0.0001 (Emission Factor per kg-km)
// 1000km * 1kg * 0.0001 = 0.1 kg CO2

const EMISSION_FACTOR_PER_KG_KM = 0.0002 // 0.2 grams CO2 per kg-km (conservative estimate for logistics)

export function calculateCarbonFootprint(
    originId: string,
    destinationId: string,
    weightInfo: { value: number, isGrams: boolean } // weight usually in grams in this app
): EmissionResult | null {
    const origin = getCityCoordinate(originId)
    const dest = getCityCoordinate(destinationId)

    if (!origin || !dest) return null

    // 1. Calculate Distance (Haversine)
    const distanceKm = haversineDistance(origin, dest) * 1.3 // 1.3x multiplier for road curvature approx

    // 2. Calculate Weight in Kg
    const weightKg = weightInfo.isGrams ? weightInfo.value / 1000 : weightInfo.value

    // 3. Calculate Emission
    // Formula: Distance (km) * Weight (kg) * Factor
    const emissionKg = distanceKm * weightKg * EMISSION_FACTOR_PER_KG_KM

    // 4. Generate Comparisons
    const comparisons = getComparisons(emissionKg)

    return {
        distanceKm: Math.round(distanceKm),
        emissionKg: parseFloat(emissionKg.toFixed(2)),
        comparisons
    }
}

function haversineDistance(coord1: CityCoordinate, coord2: CityCoordinate): number {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(coord2.lat - coord1.lat)
    const dLon = deg2rad(coord2.lng - coord1.lng)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
}

function getComparisons(emissionKg: number) {
    // 1 kg CO2 approx = 
    // - 5 hours of 10W LED bulb ? 
    //   10W = 0.01 kW. 
    //   Grid emission factor Indonesia ~0.8 kg CO2/kWh
    //   1 hours = 0.008 kg. 
    //   1 kg / 0.008 = 125 hours. 
    //   Maybe old bulbs (60W)? 0.06 kW * 0.8 = 0.048 kg/h. 1/0.048 ~= 20 hours.
    // Let's use user's "5 jam lampu bohlam" as anchor if possible, or calculate generally.
    // 
    // Bottles: 500ml PET bottle ~0.08 - 0.1 kg CO2 usually?
    // Let's use:
    // 1. Smartphone Charge: ~0.005 kg CO2 (very small) -> 1 kg = 200 charges
    // 2. Plastic Bags: 1 bag ~0.03 kg CO2 -> 1 kg = 33 bags

    const items = []

    // Example 1: Plastic Bottles (500ml) ~ 0.0828 kg CO2
    const bottles = Math.max(1, Math.round(emissionKg / 0.08))
    items.push({
        label: 'Setara Botol Plastik',
        value: `${bottles} botol`,
        icon: 'bottle'
    })

    // Example 2: Smartphone Charges ~ 0.005 kg (iPhone 11)
    if (emissionKg < 1) {
        const charges = Math.max(1, Math.round(emissionKg / 0.005))
        items.push({
            label: 'Charge HP',
            value: `${charges}x full`,
            icon: 'smartphone'
        })
    } else {
        // Example 3: Driving Car (km) ~ 0.12 kg/km (efficient car)
        const kmDrive = (emissionKg / 0.12).toFixed(1)
        items.push({
            label: 'Nyetir Mobil',
            value: `${kmDrive} km`,
            icon: 'car'
        })
    }

    return items
}
