import HeroSection from '@/components/home/HeroSection';
import ServiceTabs from '@/components/home/ServiceTabs';
import RecentSearchSection from '@/components/home/RecentSearchSection';
import { AdUnit } from '@/components/ads/AdUnit';
import { IssueTicker } from '@/components/home/IssueTicker';

export default function Home() {
    return (
        <div className="min-h-screen pt-16">
            <IssueTicker />
            <HeroSection />
            <RecentSearchSection />
            <AdUnit slot="home_hero_bottom" />
            <ServiceTabs />
        </div>
    );
}
