// Coordinates for Indonesian Cities (Approximate Lat/Long)
// IDs must match src/data/cities.ts

export interface CityCoordinate {
  id: string;
  lat: number;
  lng: number;
}

export const cityCoordinates: Record<string, CityCoordinate> = {
  // DKI Jakarta
  '151': { id: '151', lat: -6.1674, lng: 106.7637 }, // Jakarta Barat
  '152': { id: '152', lat: -6.225, lng: 106.9004 }, // Jakarta Timur
  '153': { id: '153', lat: -6.1384, lng: 106.8665 }, // Jakarta Utara
  '154': { id: '154', lat: -6.2615, lng: 106.8106 }, // Jakarta Selatan
  '155': { id: '155', lat: -6.1805, lng: 106.8284 }, // Jakarta Pusat

  // Jawa Barat
  '22': { id: '22', lat: -6.9175, lng: 107.6191 }, // Bandung
  '23': { id: '23', lat: -6.8943, lng: 107.4368 }, // Bandung Barat
  '39': { id: '39', lat: -6.2383, lng: 106.9756 }, // Bekasi
  '80': { id: '80', lat: -6.5971, lng: 106.806 }, // Bogor
  '106': { id: '106', lat: -6.732, lng: 108.5523 }, // Cirebon
  '114': { id: '114', lat: -6.4025, lng: 106.7942 }, // Depok
  '444': { id: '444', lat: -6.9277, lng: 106.93 }, // Sukabumi (Using 444 as shown in cities.ts, though duplicate with Surabaya?)
  '455': { id: '455', lat: -7.3274, lng: 108.2207 }, // Tasikmalaya

  // Jawa Tengah
  '398': { id: '398', lat: -6.9667, lng: 110.4167 }, // Semarang
  '445': { id: '445', lat: -7.5667, lng: 110.8214 }, // Surakarta (Solo)
  '318': { id: '318', lat: -6.8898, lng: 109.6746 }, // Pekalongan
  '457': { id: '457', lat: -6.8694, lng: 109.1402 }, // Tegal
  '175': { id: '175', lat: -7.4797, lng: 110.2177 }, // Magelang

  // Jawa Timur
  '444_SBY': { id: '444', lat: -7.2575, lng: 112.7521 }, // Surabaya (Note: Code 444 collision in cities.ts?, assuming logic handles or it was typo)
  '180': { id: '180', lat: -7.9666, lng: 112.6326 }, // Malang
  '32': { id: '32', lat: -7.8671, lng: 112.5239 }, // Batu
  '59': { id: '59', lat: -8.0954, lng: 112.161 }, // Blitar
  '256': { id: '256', lat: -7.4726, lng: 112.4336 }, // Mojokerto
  '317': { id: '317', lat: -7.6453, lng: 112.9075 }, // Pasuruan
  '362': { id: '362', lat: -7.7569, lng: 113.2115 }, // Probolinggo

  // Bali
  '114_DPS': { id: '114', lat: -8.6705, lng: 115.2126 }, // Denpasar (Code 114 collision with Depok?)
  '17': { id: '17', lat: -8.5861, lng: 115.1764 }, // Badung
  '128': { id: '128', lat: -8.4385, lng: 115.3371 }, // Gianyar
  '447': { id: '447', lat: -8.5135, lng: 115.068 }, // Tabanan

  // Sumatera
  '249': { id: '249', lat: 3.5952, lng: 98.6722 }, // Medan
  '56': { id: '56', lat: 3.6087, lng: 98.4877 }, // Binjai
  '118': { id: '118', lat: 3.5186, lng: 98.6946 }, // Deli Serdang
  '327': { id: '327', lat: 2.9667, lng: 99.0667 }, // Pematang Siantar
  '339': { id: '339', lat: -2.9909, lng: 104.7566 }, // Palembang
  '365': { id: '365', lat: -3.429, lng: 104.2285 }, // Prabumulih
  '337': { id: '337', lat: -0.9471, lng: 100.4172 }, // Padang
  '79': { id: '79', lat: -0.3039, lng: 100.3732 }, // Bukittinggi

  // Kalimantan & Sulawesi & Papua
  '37': { id: '37', lat: -1.2379, lng: 116.8529 }, // Balikpapan
  '388': { id: '388', lat: -0.5015, lng: 117.1537 }, // Samarinda
  '65': { id: '65', lat: 0.1374, lng: 117.48 }, // Bontang
  '187': { id: '187', lat: -5.1477, lng: 119.4328 }, // Makassar
  '342': { id: '342', lat: -2.9945, lng: 120.1954 }, // Palopo
  '345': { id: '345', lat: -4.0142, lng: 119.63 }, // Parepare
  '166': { id: '166', lat: -2.5337, lng: 140.7181 }, // Jayapura
};

export function getCityCoordinate(id: string): CityCoordinate | null {
  // Handle potential collisions (Quick fix logic if needed, otherwise direct lookup)
  const coord = cityCoordinates[id];
  if (!coord) return null;
  return coord;
}
