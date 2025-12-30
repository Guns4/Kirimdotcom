'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import {
  getRegistrationOptions,
  verifyRegistration,
} from '@/app/actions/biometric';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export function BiometricSettings() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Get options from server
      const { data } = await getRegistrationOptions();
      if (!data?.options) throw new Error('Failed to get options');

      // 2. Browser native prompt
      const attResp = await startRegistration(data.options);

      // 3. Verify on server
      const verification = await verifyRegistration(attResp);

      if (verification?.success) {
        toast.success('Fingerprint registered successfully!');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to register biometric');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-6 h-6 text-purple-600" /> Biometric Login
        </CardTitle>
        <CardDescription>
          Enable login using Fingerprint or FaceID on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleRegister}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Fingerprint className="w-4 h-4 mr-2" />
          )}
          Register This Device
        </Button>
      </CardContent>
    </Card>
  );
}
