'use client';

import { submitAgent } from '@/app/actions/agent-locator';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AddAgentForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setMessage(null);

        try {
            const result = await submitAgent(formData);
            if (result.success) {
                setMessage({ type: 'success', text: result.message! });
                (document.getElementById('add-agent-form') as HTMLFormElement).reset();
            } else {
                setMessage({ type: 'error', text: result.message! });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Add Missing Agent</h2>
            <p className="text-gray-600 mb-6">Know a logistics drop point not on the map? Add it here!</p>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form id="add-agent-form" action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Agent Name</label>
                    <input name="name" type="text" required placeholder="e.g. JNE Agen Kebayoran" className="mt-1 w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="latitude" type="number" step="any" required placeholder="Latitude (-6.xxx)" className="mt-1 w-full p-2 border rounded" />
                        <input name="longitude" type="number" step="any" required placeholder="Longitude (106.xxx)" className="mt-1 w-full p-2 border rounded" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Services (comma separated)</label>
                    <input name="services" type="text" required placeholder="JNE, J&T, SiCepat" className="mt-1 w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Address</label>
                    <textarea name="address" required className="mt-1 w-full p-2 border rounded" rows={3}></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Operational Hours</label>
                        <input name="hours" type="text" placeholder="08:00 - 21:00" className="mt-1 w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input name="phone" type="text" placeholder="0812..." className="mt-1 w-full p-2 border rounded" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                    {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                    Submit Agent
                </button>
            </form>
        </div>
    );
}
