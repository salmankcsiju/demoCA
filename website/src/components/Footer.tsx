'use client';

import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

export default function Footer() {
  return (
    <footer className="bg-brand-accent text-brand-secondary relative overflow-hidden pt-16 sm:pt-20 md:pt-28 lg:pt-32 pb-10 sm:pb-12 md:pb-16 border-t border-brand-primary/10">

      {/* Background Texture */}
      <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none">
        <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-brand-primary/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-brand-light/5 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 md:gap-16 lg:gap-8 mb-16 sm:mb-20 md:mb-24">

          {/* BRAND */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            <Reveal>
              <Link to="/" className="inline-block">
                <span className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-tight italic leading-none">
                  CASA<span className="text-brand-primary">AMORA</span>
                </span>
                <span className="block text-[8px] sm:text-[9px] tracking-[0.5em] text-brand-secondary/40 mt-2 uppercase">
                  The Modern Atelier
                </span>
              </Link>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-sm sm:text-base md:text-lg text-brand-secondary/60 font-serif italic leading-relaxed pr-0 sm:pr-4 md:pr-8">
                A legacy of threads, woven with silent luxury. We sculpt architectural heritage into modern silhouettes.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex gap-4 sm:gap-6 pt-2 sm:pt-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-brand-primary/30 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* COLLECTIONS */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <Reveal delay={0.4}>
              <h4 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-brand-primary">
                Collections
              </h4>
              <ul className="space-y-3 sm:space-y-4">
                <li><Link to="/shop" className="text-sm sm:text-base italic font-serif text-brand-secondary/70 hover:text-brand-primary">All Pieces</Link></li>
                <li><Link to="/category/kurti" className="text-sm sm:text-base italic font-serif text-brand-secondary/70 hover:text-brand-primary">Kurti</Link></li>
                <li><Link to="/category/gown" className="text-sm sm:text-base italic font-serif text-brand-secondary/70 hover:text-brand-primary">Gown</Link></li>
                <li><Link to="/category/saree" className="text-sm sm:text-base italic font-serif text-brand-secondary/70 hover:text-brand-primary">Saree</Link></li>
              </ul>
            </Reveal>
          </div>

          {/* ATELIER */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <Reveal delay={0.5}>
              <h4 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-brand-primary">
                Atelier
              </h4>
              <ul className="space-y-3 sm:space-y-4">
                <li><Link to="/customize" className="text-sm sm:text-base italic font-serif text-brand-secondary/70 hover:text-brand-primary">Custom Creation</Link></li>
                <li><Link to="/testimonials" className="text-sm sm:text-base italic font-serif text-brand-secondary/70 hover:text-brand-primary">Archive</Link></li>
                <li><Link to="/contact" className="text-sm sm:text-base italic font-serif text-brand-secondary/70 hover:text-brand-primary">Contact</Link></li>
                <li><Link to="/profile" className="text-sm sm:text-base italic font-serif text-brand-secondary/70 hover:text-brand-primary">Account</Link></li>
              </ul>
            </Reveal>
          </div>

          {/* NEWSLETTER */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            <Reveal delay={0.6}>
              <h4 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-brand-primary">
                The Dispatch
              </h4>

              <p className="text-sm sm:text-base text-brand-secondary/60 font-serif italic leading-relaxed">
                Subscribe to receive updates on new collections and exclusive releases.
              </p>

              <form className="relative mt-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-transparent border-b border-brand-primary/30 py-3 pr-10 text-sm outline-none focus:border-brand-primary transition placeholder:text-brand-secondary/30"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            </Reveal>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="pt-6 sm:pt-8 md:pt-12 border-t border-brand-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">

          <Reveal className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-brand-secondary/40">
            <span className="flex items-center gap-1"><MapPin size={10}/> India</span>
            <span className="flex items-center gap-1"><Phone size={10}/> +91 7356198300</span>
            <span className="flex items-center gap-1"><Mail size={10}/> contact@casaamora.com</span>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-brand-secondary/30">
              © {new Date().getFullYear()} CASA AMORA
            </p>
          </Reveal>
        </div>
      </div>

      {/* GIANT TEXT */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none opacity-[0.03] text-[18vw] sm:text-[14vw] md:text-[12vw] font-serif font-black tracking-tight whitespace-nowrap">
        CASA AMORA
      </div>
    </footer>
  );
}