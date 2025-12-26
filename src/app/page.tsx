import HeroSection from '@/components/home/HeroSection';
import ServiceTabs from '@/components/home/ServiceTabs';
import RecentSearchSection from '@/components/home/RecentSearchSection';

export default function Home() {
    return (
        <div className="min-h-screen pt-16">
            <HeroSection />
            <RecentSearchSection />
            <ServiceTabs />
        </div>
    );
}
