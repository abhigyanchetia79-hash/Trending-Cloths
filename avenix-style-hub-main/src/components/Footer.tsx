import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { useSocialSettings } from "@/hooks/useSocialSettings";

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Footer = () => {
  const { settings, getWhatsAppUrl } = useSocialSettings();
  const whatsappUrl = getWhatsAppUrl();

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase mb-6">Trending Cloths</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Show the hidden style. Premium fashion for the modern individual.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition-all"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon size={18} />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:text-white transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                  aria-label="Facebook"
                >
                  <Facebook size={17} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase mb-6">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/category/men" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Men</Link></li>
              <li><Link to="/category/women" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Women</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase mb-6">Help</h4>
            <ul className="space-y-3">
              {whatsappUrl ? (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <WhatsAppIcon size={13} />
                    Customer Service
                  </a>
                </li>
              ) : (
                <li><span className="text-sm text-muted-foreground">Customer Service</span></li>
              )}
              <li><span className="text-sm text-muted-foreground">Shipping & Returns</span></li>
              <li><span className="text-sm text-muted-foreground">FAQ</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase mb-6">Follow</h4>
            <ul className="space-y-3">
              {settings.instagram && (
                <li>
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <Instagram size={13} /> Instagram
                  </a>
                </li>
              )}
              {settings.facebook && (
                <li>
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <Facebook size={13} /> Facebook
                  </a>
                </li>
              )}
              {whatsappUrl && (
                <li>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <WhatsAppIcon size={13} /> WhatsApp
                  </a>
                </li>
              )}
              {!settings.instagram && !settings.facebook && !whatsappUrl && (
                <li><span className="text-sm text-muted-foreground">No socials configured</span></li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-14 pt-8 text-center">
          <p className="text-xs text-muted-foreground tracking-wide">
            © 2026 Trending Cloths. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
