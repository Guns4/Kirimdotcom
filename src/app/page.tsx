import HeroSection from '@/components/home/HeroSection';
import ServiceTabs from '@/components/home/ServiceTabs';

export default function Home() {
    return (
        <div className="min-h-screen pt-16">
            <HeroSection />
            <ServiceTabs />
        </div>
    );
}
