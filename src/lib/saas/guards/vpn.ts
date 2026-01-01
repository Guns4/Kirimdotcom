// VPN & Datacenter IP Detector
// In production, use GeoIP database or services like IPQualityScore/Cloudflare
// This script simulates logic for blocking non-residential IPs

export function isVpnOrDatacenter(ip: string): boolean {
    // 1. Mock Database of VPN/Datacenter IP Ranges
    // Example: Hackers often use IPs starting with 104. (Cloudflare) or 45. (Cheap VPNs)
    const suspiciousRanges = [
        '104.',    // Cloudflare
        '45.',     // Cheap VPN providers
        '192.168.', // Local network (invalid for public API)
        '10.',     // Private network
        '172.16.', // Private network
        '185.',    // Known datacenter range
        '207.',    // AWS/GCP ranges
    ];

    // 2. Check if IP matches suspicious ranges
    const isSuspicious = suspiciousRanges.some(range => ip.startsWith(range));

    if (isSuspicious) {
        console.log(`[VPN SHIELD] 🛡️ Blocked suspicious IP: ${ip}`);
        return true;
    }

    // 3. (Optional) Check hostname via DNS Reverse Lookup
    // If hostname contains 'vpn', 'proxy', 'tor', 'amazon', 'google', 'digitalocean'
    // → Block for Free Tier (but allow for Enterprise with whitelisting)

    return false;
}

export function isResidentialIP(ip: string): boolean {
    // Common residential ISP ranges in Indonesia
    const residentialRanges = [
        '36.',     // Telkom Indonesia
        '110.',    // Indihome
        '114.',    // Telkomsel
        '120.',    // XL Axiata
        '103.',    // Various Indonesian ISPs
    ];

    return residentialRanges.some(range => ip.startsWith(range));
}

export function getIPRiskScore(ip: string): number {
    // Risk scoring system (0-100)
    // 0 = Safe residential IP
    // 100 = High-risk datacenter/VPN IP

    if (isResidentialIP(ip)) return 0;
    if (isVpnOrDatacenter(ip)) return 100;

    // Unknown IP - medium risk
    return 50;
}
