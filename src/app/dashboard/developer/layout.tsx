import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Developer Dashboard - API Keys | CekKirim',
    description: 'Manage your CekKirim API keys for programmatic access to tracking and shipping cost services.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
