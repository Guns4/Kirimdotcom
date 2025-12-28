export const cities = [
    "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang",
    "Makassar", "Palembang", "Tangerang", "Depok", "Bekasi",
    "Yogyakarta", "Bogor", "Malang", "Denpasar", "Pekanbaru",
    "Samarinda", "Bandar Lampung", "Padang", "Banjarmasin", "Balikpapan",
    "Pontianak", "Cimahi", "Jambi", "Surakarta", "Manado",
    "Mataram", "Cilegon", "Palu", "Kupang", "Ambon",
    "Bengkulu", "Kendari", "Sukabumi", "Cirebon", "Pekalongan",
    "Kediri", "Pematangsiantar", "Tegal", "Sorong", "Binjai",
    "Dumai", "Palangkaraya", "Banda Aceh", "Singkawang", "Probolinggo",
    "Padang Sidempuan", "Bitung", "Banjarbaru", "Ternate", "Lubuklinggau"
];

export function generateRouteCombinations() {
    const routes = [];
    // Generate top 500 routes (e.g. Jakarta to all, Surabaya to all)
    // Logic: Prioritize high-volume cities like Jakarta, Surabaya, Bandung
    const originPriorities = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Yogyakarta", "Makassar", "Denpasar"];

    for (const origin of originPriorities) {
        for (const destination of cities) {
            if (origin !== destination) {
                routes.push({
                    origin: origin.toLowerCase(),
                    destination: destination.toLowerCase(),
                });
            }
        }
    }

    // Fill the rest if needed, but for static generation we stick to a subset
    // to avoid building 2500 pages during build time if not necessary.

    return routes;
}
