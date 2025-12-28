import * as React from 'react';

interface RenewalEmailProps {
    name: string;
    planName: string;
    daysLeft: number;
    renewalUrl: string;
}

export const RenewalEmail: React.FC<RenewalEmailProps> = ({
    name,
    planName,
    daysLeft,
    renewalUrl,
}) => (
    <div style={{ fontFamily: 'sans-serif', lineHeight: 1.6, color: '#333' }}>
        <h2>Halo {name},</h2>
        <p>
            Paket langganan <strong>{planName}</strong> Anda akan habis dalam <strong>{daysLeft} hari</strong> lagi.
        </p>
        <p>
            Jangan sampai akses fitur premium Anda (Blacklist Checker, Bulk Tracking) terputus.
        </p>
        <div style={{ margin: '24px 0' }}>
            <a
                href={renewalUrl}
                style={{
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    padding: '12px 24px',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}
            >
                Perpanjang Sekarang &rarr;
            </a>
        </div>
        <p style={{ fontSize: '12px', color: '#666' }}>
            Jika Anda sudah melakukan pembayaran, abaikan email ini.
        </p>
    </div>
);
