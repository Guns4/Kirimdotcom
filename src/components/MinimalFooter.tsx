import Link from 'next/link';

/**
 * Minimal Footer Component
 * Clean, focused on credibility
 */

// Partner logos (grayscale)
const PARTNERS = [
  { name: 'JNE', logo: '/partners/jne.svg' },
  { name: 'J&T', logo: '/partners/jnt.svg' },
  { name: 'SiCepat', logo: '/partners/sicepat.svg' },
  { name: 'Anteraja', logo: '/partners/anteraja.svg' },
  { name: 'BCA', logo: '/partners/bca.svg' },
  { name: 'Mandiri', logo: '/partners/mandiri.svg' },
];

// Social links
const SOCIALS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/cekkirim',
    icon: InstagramIcon,
  },
  { name: 'Twitter', href: 'https://twitter.com/cekkirim', icon: TwitterIcon },
  { name: 'YouTube', href: 'https://youtube.com/@cekkirim', icon: YouTubeIcon },
];

export function MinimalFooter() {
  return (
    <footer className="bg-surface-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left: Logo & Contact */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-white">CekKirim</span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed">
              Platform all-in-one untuk seller online Indonesia. Cek resi,
              ongkir, dan kelola bisnis lebih mudah.
            </p>
            <div className="space-y-2 text-sm text-surface-400">
              <p className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4" />
                <a
                  href="https://wa.me/6281234567890"
                  className="hover:text-white transition-colors"
                >
                  +62 812-3456-7890
                </a>
              </p>
              <p className="flex items-center gap-2">
                <EmailIcon className="w-4 h-4" />
                <a
                  href="mailto:support@cekkirim.com"
                  className="hover:text-white transition-colors"
                >
                  support@cekkirim.com
                </a>
              </p>
            </div>
          </div>

          {/* Center: Official Partners */}
          <div>
            <h4 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">
              Official Partners
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="h-10 bg-white/10 rounded-lg flex items-center justify-center px-3 grayscale hover:grayscale-0 transition-all"
                  title={partner.name}
                >
                  <span className="text-xs font-semibold text-white/60">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Legal & Social */}
          <div className="space-y-6">
            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-surface-400 hover:text-white transition-colors"
                  >
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-surface-400 hover:text-white transition-colors"
                  >
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund"
                    className="text-surface-400 hover:text-white transition-colors"
                  >
                    Kebijakan Refund
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Icons */}
            <div>
              <h4 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">
                Ikuti Kami
              </h4>
              <div className="flex items-center gap-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-xl flex items-center justify-center transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-surface-500">
            <p>© {new Date().getFullYear()} CekKirim. All rights reserved.</p>
            <p>Made with ❤️ in Indonesia 🇮🇩</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// Icon Components
// ============================================

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default MinimalFooter;
