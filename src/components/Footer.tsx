import { Instagram, Linkedin, Facebook, Twitter, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-xl mb-1">Raune Launch</h3>
            <p className="text-sm opacity-90">{t('footer.tagline')}</p>
            <p className="text-xs opacity-75 mt-2">{t('footer.builtBy')}</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75 transition-opacity"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75 transition-opacity"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75 transition-opacity"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75 transition-opacity"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://lovable.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75 transition-opacity"
              aria-label="Website"
            >
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs opacity-75 mt-6 pt-4 border-t border-primary-foreground/20">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
}
