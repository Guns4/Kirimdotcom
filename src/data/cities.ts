// Indonesian Cities Data for Shipping Calculator
// Grouped by province for better UX

export interface City {
    id: string
    name: string
    province: string
    type: 'Kabupaten' | 'Kota'
}

export const indonesianCities: City[] = [
    // DKI Jakarta
    { id: '151', name: 'Jakarta Barat', province: 'DKI Jakarta', type: 'Kota' },
    { id: '152', name: 'Jakarta Timur', province: 'DKI Jakarta', type: 'Kota' },
    { id: '153', name: 'Jakarta Utara', province: 'DKI Jakarta', type: 'Kota' },
    { id: '154', name: 'Jakarta Selatan', province: 'DKI Jakarta', type: 'Kota' },
    { id: '155', name: 'Jakarta Pusat', province: 'DKI Jakarta', type: 'Kota' },

    // Jawa Barat
    { id: '22', name: 'Bandung', province: 'Jawa Barat', type: 'Kota' },
    { id: '23', name: 'Bandung Barat', province: 'Jawa Barat', type: 'Kabupaten' },
    { id: '39', name: 'Bekasi', province: 'Jawa Barat', type: 'Kota' },
    { id: '80', name: 'Bogor', province: 'Jawa Barat', type: 'Kota' },
    { id: '106', name: 'Cirebon', province: 'Jawa Barat', type: 'Kota' },
    { id: '114', name: 'Depok', province: 'Jawa Barat', type: 'Kota' },
    { id: '444', name: 'Sukabumi', province: 'Jawa Barat', type: 'Kota' },
    { id: '455', name: 'Tasikmalaya', province: 'Jawa Barat', type: 'Kota' },

    // Jawa Tengah
    { id: '398', name: 'Semarang', province: 'Jawa Tengah', type: 'Kota' },
    { id: '445', name: 'Surakarta (Solo)', province: 'Jawa Tengah', type: 'Kota' },
    { id: '318', name: 'Pekalongan', province: 'Jawa Tengah', type: 'Kota' },
    { id: '457', name: 'Tegal', province: 'Jawa Tengah', type: 'Kota' },
    { id: '175', name: 'Magelang', province: 'Jawa Tengah', type: 'Kota' },

    // Jawa Timur
    { id: '444', name: 'Surabaya', province: 'Jawa Timur', type: 'Kota' },
    { id: '180', name: 'Malang', province: 'Jawa Timur', type: 'Kota' },
    { id: '32', name: 'Batu', province: 'Jawa Timur', type: 'Kota' },
    { id: '59', name: 'Blitar', province: 'Jawa Timur', type: 'Kota' },
    { id: '256', name: 'Mojokerto', province: 'Jawa Timur', type: 'Kota' },
    { id: '317', name: 'Pasuruan', province: 'Jawa Timur', type: 'Kota' },
    { id: '362', name: 'Probolinggo', province: 'Jawa Timur', type: 'Kota' },

    // Bali
    { id: '114', name: 'Denpasar', province: 'Bali', type: 'Kota' },
    { id: '17', name: 'Badung', province: 'Bali', type: 'Kabupaten' },
    { id: '128', name: 'Gianyar', province: 'Bali', type: 'Kabupaten' },
    { id: '447', name: 'Tabanan', province: 'Bali', type: 'Kabupaten' },

    // Sumatera Utara
    { id: '249', name: 'Medan', province: 'Sumatera Utara', type: 'Kota' },
    { id: '56', name: 'Binjai', province: 'Sumatera Utara', type: 'Kota' },
    { id: '118', name: 'Deli Serdang', province: 'Sumatera Utara', type: 'Kabupaten' },
    { id: '327', name: 'Pematang Siantar', province: 'Sumatera Utara', type: 'Kota' },

    // Sumatera Selatan
    { id: '339', name: 'Palembang', province: 'Sumatera Selatan', type: 'Kota' },
    { id: '365', name: 'Prabumulih', province: 'Sumatera Selatan', type: 'Kota' },

    // Sumatera Barat
    { id: '337', name: 'Padang', province: 'Sumatera Barat', type: 'Kota' },
    { id: '79', name: 'Bukittinggi', province: 'Sumatera Barat', type: 'Kota' },

    // Kalimantan Timur
    { id: '37', name: 'Balikpapan', province: 'Kalimantan Timur', type: 'Kota' },
    { id: '388', name: 'Samarinda', province: 'Kalimantan Timur', type: 'Kota' },
    { id: '65', name: 'Bontang', province: 'Kalimantan Timur', type: 'Kota' },

    // Sulawesi Selatan
    { id: '187', name: 'Makassar', province: 'Sulawesi Selatan', type: 'Kota' },
    { id: '342', name: 'Palopo', province: 'Sulawesi Selatan', type: 'Kota' },
    { id: '345', name: 'Parepare', province: 'Sulawesi Selatan', type: 'Kota' },

    // Papua
    { id: '166', name: 'Jayapura', province: 'Papua', type: 'Kota' },
]

// Helper function to format city display
export function formatCityDisplay(city: City): string {
    return `${city.type} ${city.name}, ${city.province}`
}

// Helper function for react-select options
export function getCityOptions() {
    return indonesianCities.map((city) => ({
        value: city.id,
        label: formatCityDisplay(city),
        city,
    }))
}
