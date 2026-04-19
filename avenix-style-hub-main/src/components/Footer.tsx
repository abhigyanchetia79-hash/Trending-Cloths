import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase mb-6">Trending Cloths</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Show the hidden style. Premium fashion for the modern individual.
            </p>
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
              <li><span className="text-sm text-muted-foreground">Customer Service</span></li>
              <li><span className="text-sm text-muted-foreground">Shipping & Returns</span></li>
              <li><span className="text-sm text-muted-foreground">FAQ</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase mb-6">Follow</h4>
            <ul className="space-y-3">
              <li><a href="https://instagram.com/trendingcloths" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
              <li><a href="https://t.me/trendingcloths" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Telegram</a></li>
              <li><a href="https://wa.me/919876543210?text=Hello%20I%20want%20to%20know%20more%20about%20your%20products" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">WhatsApp</a></li>
              <li><a href="https://facebook.com/trendingcloths" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Facebook</a></li>
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
