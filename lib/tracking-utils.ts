export function isInternationalAWB(awb: string): boolean {
    // Matches Standard International Format (e.g. LP000000000CN, UX123456789SG)
    return /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(awb);
}

export function getTrackingEndpoint(awb: string): string {
    if (isInternationalAWB(awb)) {
        return '/api/tracking/global';
    }
    return '/api/tracking'; // Local Default
}
