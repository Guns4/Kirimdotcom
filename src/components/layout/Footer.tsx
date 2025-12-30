import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { footerLinks } from '@/data/footer-links';
import { LiteModeToggle } from '../ui/LiteModeToggle';
import { siteConfig } from '@/config/site';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-muted/30 border-t border-border pb-20 md:pb-0"
      id="footer"
    >
      {/* Top Wave Decoration (Optional) or simply border */}

      {/* Main Content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Section (Col Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                {siteConfig.name}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {siteConfig.description}
              </p>
            </div>

            {/* Social Signals */}
            <div className="flex gap-4">
              {[
                {
                  icon: Facebook,
                  href: siteConfig.links.github,
                  label: 'Facebook',
                }, // Using Github as placeholder for FB if not in config, or we should add FB to config types. For now, assuming user will update config.
                {
                  icon: Instagram,
                  href: siteConfig.links.instagram,
                  label: 'Instagram',
                },
                {
                  icon: Twitter,
                  href: siteConfig.links.twitter,
                  label: 'Twitter',
                },
                {
                  icon: Mail,
                  href: `mailto:${siteConfig.links.email}`,
                  label: 'Email',
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-xl transition-all hover:scale-105 border border-border/50"
                  title={`Kunjungi kami di ${social.label}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="pt-4">
              <LiteModeToggle />
            </div>
          </div>

          {/* Silo 1: Popular Routes (Col Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-foreground font-semibold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              Rute Populer
            </h4>
            <nav aria-label="Rute Pengiriman Populer">
              <ul className="space-y-3">
                {footerLinks.popularRoutes.slice(0, 8).map((link, i) => (
                  <li key={i}>
                    <Link
                      href={`/cek-ongkir/${link.slug}`}
                      className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                      title={`Cek ongkir ${link.origin} ke ${link.destination}`}
                    >
                      <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-indigo-500 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Silo 2: Tools & Dictionary (Col Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-foreground font-semibold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
              Tools Seller
            </h4>
            <nav aria-label="Tools Seller & Kamus">
              <ul className="space-y-3 mb-8">
                {footerLinks.sellerTools.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-purple-400 transition-colors flex items-center gap-2 group"
                      title={link.title}
                    >
                      <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h5 className="text-foreground font-medium mb-3 text-sm opacity-80">
                Kamus Logistik
              </h5>
              <ul className="space-y-2">
                {footerLinks.logisticsDictionary.slice(0, 3).map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      title={link.title}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Silo 3: Legal & Support (Col Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-foreground font-semibold mb-6">Informasi</h4>
            <nav aria-label="Legal & Bantuan">
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    Hubungi Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    FAQ / Bantuan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Tracking Links Horizontal (SEO Juice) */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
            Cek Resi Kilat
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.courierTracking.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-indigo-400 transition-colors"
                title={link.title}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {currentYear} {siteConfig.name} Indonesia. Dibuat dengan{' '}
            <Heart className="w-3 h-3 inline text-red-500 mx-0.5 animate-pulse" />{' '}
            untuk UMKM.
          </p>
          <p>CekOngkir & CekResi All-in-One.</p>
        </div>
      </div>
    </footer>
  );
}
