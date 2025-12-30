import { getTrips } from '@/app/actions/jastip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface Trip {
    id: string;
    origin_city: string;
    destination_city: string;
    departure_date: string;
    capacity_kg: number;
    price_per_kg: number;
    whatsapp_number: string;
    notes: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

export async function TripList({ from, to }: { from?: string; to?: string }) {
    const trips = await getTrips({ from, to });

    if (trips.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">Tidak ada jadwal jastip rute ini.</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(trips as Trip[]).map((trip) => (
                <Card key={trip.id} className="p-4 flex flex-col gap-4 border-2 hover:border-primary/50 transition-colors">
                    {/* Header: Route */}
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-red-500" /> {trip.origin_city}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-green-500" /> {trip.destination_city}</span>
                    </div>

                    {/* Date & Capacity */}
                    <div className="flex justify-between text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {trip.departure_date}</span>
                        <Badge variant="outline">Sisa {trip.capacity_kg} Kg</Badge>
                    </div>

                    {/* Traveler & Note */}
                    <div>
                        <p className="font-medium text-sm">Traveler: {trip.profiles?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 italic">&quot;{trip.notes || 'Bisa titip apa saja asal legal.'}&quot;</p>
                    </div>

                    {/* Pricing */}
                    <div className="font-mono font-bold text-primary">
                        {trip.price_per_kg ? `Rp ${trip.price_per_kg.toLocaleString('id-ID')}/kg` : 'Harga Nego'}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700 relative" asChild>
                            <a href={`https://wa.me/${trip.whatsapp_number}?text=Halo, saya mau titip barang dari ${trip.origin_city} ke ${trip.destination_city} tanggal ${trip.departure_date}`} target="_blank" rel="noopener noreferrer">
                                <Phone className="w-4 h-4 mr-2" /> Titip Barang
                            </a>
                        </Button>
                    </div>

                    {/* Safety Tip */}
                    <div className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 bg-yellow-500/10 p-1 rounded">
                        <ShieldCheck className="w-3 h-3 text-yellow-600" />
                        Gunakan <Link href="/pay/create" className="underline font-bold text-yellow-600">Rekber</Link> agar aman.
                    </div>
                </Card>
            ))}
        </div>
    );
}
