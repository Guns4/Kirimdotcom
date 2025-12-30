// Route Optimizer Service
// B2B Intelligence for Bulk Shipping Cost Optimization

export interface ShipmentPackage {
  destination: string;
  weight: number;
  city?: string;
  province?: string;
}

export interface CourierQuote {
  courier: string;
  service: string;
  cost: number;
  etd: string;
}

export interface OptimizedPackage extends ShipmentPackage {
  quotes: CourierQuote[];
  recommended: CourierQuote;
  savings: number; // vs most expensive
}

export interface OptimizationResult {
  packages: OptimizedPackage[];
  singleCourierCost: number;
  singleCourierName: string;
  optimizedCost: number;
  totalSavings: number;
  savingsPercentage: number;
}

// Mock courier pricing (In production, call real APIs like RajaOngkir)
const MOCK_COURIERS = ['JNE', 'JNT', 'SiCepat', 'AnterAja', 'Ninja'];

function getMockQuotes(destination: string, weight: number): CourierQuote[] {
  // Simple mock pricing algorithm
  // In real app: call RajaOngkir API or other courier APIs
  const basePrice = weight * 10000; // Rp 10k per kg base

  return MOCK_COURIERS.map((courier, idx) => {
    // Add randomness to simulate different pricing
    const multiplier = 1 + idx * 0.15; // JNE cheapest, others progressively more expensive
    const variance = 0.9 + Math.random() * 0.2; // +/- 10% variance

    return {
      courier,
      service: 'REG',
      cost: Math.floor(basePrice * multiplier * variance),
      etd: `${2 + idx}-${3 + idx} hari`,
    };
  });
}

export function parseCSV(csvText: string): ShipmentPackage[] {
  const lines = csvText.trim().split('\n');
  const packages: ShipmentPackage[] = [];

  // Skip header (assume first line is header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      packages.push({
        destination: parts[0],
        weight: parseFloat(parts[1]) || 1,
        city: parts[2] || '',
        province: parts[3] || '',
      });
    }
  }

  return packages;
}

export function optimizeRoute(
  packages: ShipmentPackage[],
  criteria: 'CHEAPEST' | 'FASTEST' | 'BALANCED' = 'CHEAPEST'
): OptimizationResult {
  const optimizedPackages: OptimizedPackage[] = [];

  // Process each package
  for (const pkg of packages) {
    const quotes = getMockQuotes(pkg.destination, pkg.weight);

    // Sort by criteria
    let sortedQuotes = [...quotes];
    if (criteria === 'CHEAPEST') {
      sortedQuotes.sort((a, b) => a.cost - b.cost);
    } else if (criteria === 'FASTEST') {
      sortedQuotes.sort((a, b) => {
        const aEtd = parseInt(a.etd.split('-')[0]);
        const bEtd = parseInt(b.etd.split('-')[0]);
        return aEtd - bEtd;
      });
    } else {
      // BALANCED: consider both price and speed
      sortedQuotes.sort((a, b) => {
        const aScore = a.cost / 1000 + parseInt(a.etd.split('-')[0]) * 5000;
        const bScore = b.cost / 1000 + parseInt(b.etd.split('-')[0]) * 5000;
        return aScore - bScore;
      });
    }

    const recommended = sortedQuotes[0];
    const mostExpensive = quotes.reduce(
      (max, q) => (q.cost > max.cost ? q : max),
      quotes[0]
    );

    optimizedPackages.push({
      ...pkg,
      quotes,
      recommended,
      savings: mostExpensive.cost - recommended.cost,
    });
  }

  // Calculate totals
  const optimizedCost = optimizedPackages.reduce(
    (sum, p) => sum + p.recommended.cost,
    0
  );

  // Calculate single courier scenario (use most common courier: JNE)
  const singleCourierName = 'JNE';
  const singleCourierCost = packages.reduce((sum, pkg) => {
    const quotes = getMockQuotes(pkg.destination, pkg.weight);
    const jneQuote = quotes.find((q) => q.courier === singleCourierName);
    return sum + (jneQuote?.cost || 0);
  }, 0);

  const totalSavings = singleCourierCost - optimizedCost;
  const savingsPercentage = (totalSavings / singleCourierCost) * 100;

  return {
    packages: optimizedPackages,
    singleCourierCost,
    singleCourierName,
    optimizedCost,
    totalSavings,
    savingsPercentage,
  };
}

export function generateCSVTemplate(): string {
  return `Destination,Weight(kg),City,Province
Jakarta Pusat,2.5,Jakarta,DKI Jakarta
Bandung,1.0,Bandung,Jawa Barat
Surabaya,3.5,Surabaya,Jawa Timur
Medan,2.0,Medan,Sumatera Utara
Yogyakarta,1.5,Yogyakarta,DI Yogyakarta`;
}
