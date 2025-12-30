'use client';

import { useState } from 'react';
import {
    Palette, Upload, Eye, Save, Lock, Crown,
    Image, Type, Link2, Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    BRANDING_PRICING,
    DEFAULT_BRANDING,
    isBrandingUnlocked,
    formatPrice,
    type ShopBranding
} from '@/lib/shop-branding';

interface ThemeEditorProps {
    initialBranding?: Partial<ShopBranding>;
    onSave?: (branding: Partial<ShopBranding>) => void;
}

export default function ThemeEditor({ initialBranding, onSave }: ThemeEditorProps) {
    const [branding, setBranding] = useState<Partial<ShopBranding>>({
        ...DEFAULT_BRANDING,
        ...initialBranding,
        subscriptionStatus: 'BRANDING_PRO' // Demo: unlocked
    });
    const [saving, setSaving] = useState(false);

    const isUnlocked = branding.subscriptionStatus === 'BRANDING_PRO';

    const handleColorChange = (key: keyof ShopBranding, value: string) => {
        setBranding(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        onSave?.(branding);
        toast.success('Pengaturan tersimpan!');
        setSaving(false);
    };

    const ColorPicker = ({ label, colorKey }: { label: string; colorKey: keyof ShopBranding }) => (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="flex gap-2">
                <input
                    type="color"
                    value={branding[colorKey] as string || '#3B82F6'}
                    onChange={(e) => handleColorChange(colorKey, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                    disabled={!isUnlocked}
                />
                <Input
                    value={branding[colorKey] as string || ''}
                    onChange={(e) => handleColorChange(colorKey, e.target.value)}
                    placeholder="#3B82F6"
                    className="font-mono"
                    disabled={!isUnlocked}
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Subscription Banner */}
            {!isUnlocked && (
                <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                    <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Crown className="w-6 h-6" />
                                    <span className="font-bold text-lg">Branding Pro</span>
                                </div>
                                <p className="text-purple-100 text-sm">
                                    Unlock custom logo, colors, dan banner iklan sendiri
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">
                                    {formatPrice(BRANDING_PRICING.BRANDING_PRO.monthly)}/bulan
                                </div>
                                <Button className="mt-2 bg-white text-purple-600 hover:bg-purple-50">
                                    Upgrade Sekarang
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Logo & Banner Upload */}
            <Card className={!isUnlocked ? 'opacity-50 pointer-events-none' : ''}>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Image className="w-5 h-5 text-blue-500" />
                        Logo & Banner
                        {!isUnlocked && <Lock className="w-4 h-4 text-gray-400" />}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Logo Upload */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Logo Toko</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                {branding.logoUrl ? (
                                    <img src={branding.logoUrl} alt="Logo" className="h-16 mx-auto" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Upload Logo (Max 2MB)</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Banner Upload */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Banner Iklan</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                {branding.adBannerUrl ? (
                                    <img src={branding.adBannerUrl} alt="Banner" className="h-16 mx-auto" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Upload Banner (Max 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Link Banner Iklan</label>
                        <Input
                            value={branding.adBannerLink || ''}
                            onChange={(e) => setBranding(prev => ({ ...prev, adBannerLink: e.target.value }))}
                            placeholder="https://tokosaya.com/promo"
                            disabled={!isUnlocked}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Color Settings */}
            <Card className={!isUnlocked ? 'opacity-50 pointer-events-none' : ''}>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="w-5 h-5 text-pink-500" />
                        Warna Tema
                        {!isUnlocked && <Lock className="w-4 h-4 text-gray-400" />}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <ColorPicker label="Warna Utama" colorKey="primaryColor" />
                        <ColorPicker label="Warna Sekunder" colorKey="secondaryColor" />
                        <ColorPicker label="Warna Aksen" colorKey="accentColor" />
                        <ColorPicker label="Background" colorKey="backgroundColor" />
                        <ColorPicker label="Warna Teks" colorKey="textColor" />
                    </div>
                </CardContent>
            </Card>

            {/* Shop Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Type className="w-5 h-5 text-green-500" />
                        Informasi Toko
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Nama Toko</label>
                            <Input
                                value={branding.shopName || ''}
                                onChange={(e) => setBranding(prev => ({ ...prev, shopName: e.target.value }))}
                                placeholder="Nama Toko Anda"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tagline</label>
                            <Input
                                value={branding.tagline || ''}
                                onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                                placeholder="Belanja Mudah, Kirim Cepat!"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">WhatsApp</label>
                            <Input
                                value={branding.whatsappNumber || ''}
                                onChange={(e) => setBranding(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                                placeholder="6281234567890"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Instagram</label>
                            <Input
                                value={branding.instagramHandle || ''}
                                onChange={(e) => setBranding(prev => ({ ...prev, instagramHandle: e.target.value }))}
                                placeholder="@tokosaya"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Link */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium">Link Tracking Kustom:</span>
                            <code className="bg-white px-2 py-1 rounded text-sm">
                                cekkkirim.com/track?shop_id={branding.shopId || 'tokosaya'}
                            </code>
                        </div>
                        <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <Button
                className="w-full"
                size="lg"
                onClick={handleSave}
                disabled={saving}
            >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
        </div>
    );
}
