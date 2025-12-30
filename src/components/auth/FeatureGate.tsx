import { checkFeature } from '@/lib/feature-flags';
import { ReactNode } from 'react';

interface Props {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default async function FeatureGate({
  featureKey,
  children,
  fallback = null,
}: Props) {
  const isEnabled = await checkFeature(featureKey);

  if (isEnabled) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
