import { Truck, Clock, DollarSign } from 'lucide-react';

interface OngkirRate {
  id: string;
  courier: string;
  courierCode: string;
  service: string;
  serviceType: string;
  description: string;
  estimatedDays: string;
  price: number;
}

interface OngkirResultsSSRProps {
  data: OngkirRate[];
  origin: string;
  destination: string;
}

export function OngkirResultsSSR({
  data,
  origin,
  destination,
}: OngkirResultsSSRProps) {
  // Sort by price
  const sortedData = [...data].sort((a, b) => a.price - b.price);

  // Get cheapest price for highlighting
  const cheapestPrice = sortedData[0]?.price || 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card p-4 bg-green-600/10 border border-green-500/20">
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <DollarSign className="w-5 h-5" />
          <span className="font-semibold">
            Harga Termurah: Rp {cheapestPrice.toLocaleString('id-ID')}
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Ditemukan {sortedData.length} layanan pengiriman dari {origin} ke{' '}
          {destination}
        </p>
      </div>

      {/* Results Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                Kurir & Layanan
              </th>
              <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium hidden md:table-cell">
                Estimasi
              </th>
              <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">
                Harga
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((rate, index) => (
              <tr
                key={rate.id}
                className={`border-b border-white/5 hover:bg-white/5 ${
                  index === 0 ? 'bg-green-600/5' : ''
                }`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{rate.courier}</p>
                      <p className="text-gray-400 text-sm">{rate.service}</p>
                      {/* Mobile: show estimate here */}
                      <div className="md:hidden flex items-center gap-1 text-gray-500 text-xs mt-1">
                        <Clock className="w-3 h-3" />
                        {rate.estimatedDays}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 hidden md:table-cell">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    {rate.estimatedDays}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`text-lg font-bold ${index === 0 ? 'text-green-400' : 'text-white'}`}
                  >
                    Rp {rate.price.toLocaleString('id-ID')}
                  </span>
                  {index === 0 && (
                    <p className="text-green-400 text-xs">Termurah</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        * Harga dapat berubah sewaktu-waktu. Berat paket dihitung 1 kg.
      </p>
    </div>
  );
}
