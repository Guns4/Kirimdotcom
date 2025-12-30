export interface PredictionResult {
  etaText: string;
  progress: number;
  color: string;
  description: string;
}

export function calculatePrediction(
  history: any[],
  currentStatus: string
): PredictionResult {
  const status = currentStatus.toUpperCase();
  const isDelivered =
    status.includes('DELIVERED') || status.includes('TERKIRIM');

  // 1. Delivered
  if (isDelivered) {
    return {
      etaText: 'Terkirim',
      progress: 100,
      color: 'bg-green-500',
      description: 'Paket telah diterima dengan baik.',
    };
  }

  // 2. Last Mile (With Delivery Courier)
  if (
    status.includes('WITH DELIVERY COURIER') ||
    status.includes('KURIR') ||
    status.includes('PENGANTARAN')
  ) {
    return {
      etaText: 'Hari Ini (Dalam 4 Jam)',
      progress: 85,
      color: 'bg-green-500',
      description: 'Kurir sedang menuju lokasi Anda. Pastikan ada penerima.',
    };
  }

  // 3. Arrived at Destination City
  if (status.includes('RECEIVED AT INBOUND') || status.includes('HUB TUJUAN')) {
    return {
      etaText: 'Besok Siang',
      progress: 75,
      color: 'bg-blue-500',
      description: 'Paket sudah di kota tujuan, menunggu jadwal pengantaran.',
    };
  }

  // 4. In Transit (Departed)
  if (status.includes('DEPARTED') || status.includes('BERANGKAT')) {
    return {
      etaText: '1-2 Hari',
      progress: 50,
      color: 'bg-yellow-500',
      description: 'Paket sedang dalam perjalanan antar kota.',
    };
  }

  // 5. Picked Up / Manifested
  if (status.includes('PICKED UP') || status.includes('MANIFESTED')) {
    return {
      etaText: '2-3 Hari',
      progress: 25,
      color: 'bg-gray-500',
      description: 'Paket baru saja diserahkan ke kurir.',
    };
  }

  // Fallback
  return {
    etaText: 'Menunggu Update',
    progress: 10,
    color: 'bg-gray-400',
    description: 'Status paket belum terupdate secara detail.',
  };
}
