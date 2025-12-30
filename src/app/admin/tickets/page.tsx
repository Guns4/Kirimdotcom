import TicketInbox from '@/components/admin/support/TicketInbox';

export default function SupportTicketsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Support Inbox</h1>
            <TicketInbox />
        </div>
    );
}
