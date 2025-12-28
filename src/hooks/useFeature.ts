import { useFeatureFlags } from '@/providers/FeatureFlagProvider';

export function useFeature(key: string): boolean {
    const { flags } = useFeatureFlags();
    // Default to false if key missing
    return flags[key] === true;
}
