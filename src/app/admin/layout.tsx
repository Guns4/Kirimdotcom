import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AdminCommandPalette />
            {children}
        </>
    );
}
