export interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  weight: number;
}

export interface OptimizationResult {
  shipmentId: string;
  courier: string;
  service: string;
  price: number;
  etd: string;
}

// Mock Pricing Logic (Replace with Real API in Production)
export function getBestCourier(shipment: ShipmentRow, strategy: 'CHEAPEST' | 'FASTEST' | 'BALANCED'): OptimizationResult {
  const couriers = [
    { name: 'JNE', service: 'REG', basePrice: 10000, speed: 2 },
    { name: 'J&T', service: 'EZ', basePrice: 11000, speed: 1.5 },
    { name: 'SiCepat', service: 'REG', basePrice: 10500, speed: 1.8 },
    { name: 'AnterAja', service: 'REG', basePrice: 9500, speed: 2.5 },
    { name: 'LionParcel', service: 'REGPACK', basePrice: 9000, speed: 3 }
  ];

  // Mock calculation based on weight/distance (hash of chars)
  const distanceMultiplier = (shipment.origin.length + shipment.destination.length) / 10;

  const options = couriers.map(c => {
    const price = Math.round((c.basePrice * shipment.weight * distanceMultiplier) / 100) * 100;
    return {
      shipmentId: shipment.id,
      courier: c.name,
      service: c.service,
      price: price,
      etd: `${Math.ceil(c.speed * distanceMultiplier / 2)} days`
    };
  });

  if (strategy === 'CHEAPEST') {
    options.sort((a, b) => a.price - b.price);
  } else if (strategy === 'FASTEST') {
    options.sort((a, b) => parseInt(a.etd) - parseInt(b.etd));
  } else {
    // Balanced: Price * 0.7 + Speed * 0.3 (Conceptual)
    options.sort((a, b) => a.price - b.price); // Simplified for mock
  }

  return options[0];
}

export function parseCSV(csvContent: string): ShipmentRow[] {
  const lines = csvContent.split('\n');
  const shipments: ShipmentRow[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const [origin, destination, weight] = line.split(',');
      if (origin && destination && weight) {
        shipments.push({
          id: `row-${i}`,
          origin: origin.trim(),
          destination: destination.trim(),
          weight: parseFloat(weight.trim())
        });
      }
    }
  }
  return shipments;
}
