import { getAgents } from '@/app/actions/agent-locator';
import dynamic from 'next/dynamic';
import AddAgentForm from '@/components/maps/AddAgentForm';

// Dynamically import map to avoid SSR issues with Leaflet
const AgentMap = dynamic(() => import('@/components/maps/AgentMap'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

export default async function AreaPage({ params }: { params: { slug: string[] } }) {
    // Default fetch for Jakarta/General area or based on slug if implemented
    // For now we fetch a wide default range
    const initialAgents = await getAgents(-10, 10, 95, 140);

    const areaName = params.slug?.join(' ') || 'Indonesia';

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Logistics Agents in {decodeURIComponent(areaName)}</h1>
                    <p className="text-gray-600">Find the nearest drop points and courier agents around you.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <AgentMap initialAgents={initialAgents} />
                    </div>
                    <div>
                        <AddAgentForm />
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Popular Agents Near {decodeURIComponent(areaName)}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {initialAgents.slice(0, 6).map(agent => (
                            <div key={agent.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
                                <h3 className="font-bold text-lg">{agent.name}</h3>
                                <div className="flex gap-2 mb-2 mt-1">
                                    {agent.courier_services?.map((s: any) => (
                                        <span key={s} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{s}</span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{agent.address}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
