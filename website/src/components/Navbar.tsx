import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Search, Heart, User,
  ShoppingBag, ChevronDown, ChevronRight, MessageCircle, Sparkles
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:8000';

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.state]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data.filter((c: any) => !c.parent)))
      .catch(() => {});

    fetch(`${BASE_URL}/api/config/`)
      .then(res => res.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const whatsappNumber = config?.whatsapp_number || '7356198300';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <>
    <div className="fixed top-0 w-full z-[100] flex justify-center mt-2 md:mt-6 px-2 md:px-4 pointer-events-none">
      <nav className={`pointer-events-auto transition-all duration-700 w-full lg:w-fit ${scrolled ? 'bg-brand-accent/80 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-brand-primary/20 rounded-full py-3 md:py-4 px-4 md:px-8' : 'bg-transparent py-4 px-3 md:px-6'}`}>
        <div className="flex justify-between items-center gap-1 md:gap-12">
          
          {/* Logo (Left on desktop) */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className={`text-xl sm:text-2xl font-serif tracking-tighter leading-none transition-colors text-brand-secondary`}>
              CASA<span className="italic text-brand-primary">AMORA</span>
            </span>
            <Sparkles size={10} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Center Navigation Links (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-8 border-l border-brand-primary/20 pl-8">
             <div 
               className="relative group"
               onMouseEnter={() => setShowCategories(true)}
               onMouseLeave={() => setShowCategories(false)}
             >
                <button className="meta-text transition-colors cursor-pointer py-2 flex items-center gap-2 text-brand-secondary/80 hover:text-brand-primary">
                  Atelier <ChevronDown size={10} className={`transition-transform duration-500 group-hover:rotate-180`} />
                </button>
                
                <AnimatePresence>
                  {showCategories && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-brand-accent/95 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-brand-primary/20 rounded-3xl p-6 grid grid-cols-1 gap-2"
                    >
                       {categories.map(cat => (
                         <Link 
                           key={cat.id} 
                           to={`/category/${cat.slug}`}
                           className="meta-text text-brand-secondary/60 hover:text-brand-primary hover:bg-brand-primary/5 p-3 rounded-xl transition-all flex items-center justify-between group/link"
                         >
                           {cat.name}
                           <ChevronRight size={10} className="translate-x-[-10px] opacity-0 group-hover/link:translate-x-0 group-hover/link:opacity-100 transition-all" />
                         </Link>
                       ))}
                       <div className="h-px bg-brand-primary/10 my-2"></div>
                       <Link to="/shop" className="meta-text text-brand-primary text-center hover:text-brand-secondary italic p-3">View All Collections</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <Link to="/customize" className="meta-text transition-colors text-brand-secondary/80 hover:text-brand-primary relative group">
                Custom Creations
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-brand-primary transition-all duration-500 group-hover:w-full"></span>
             </Link>
             <Link to="/testimonials" className="meta-text transition-colors text-brand-secondary/80 hover:text-brand-primary relative group">
                Diaries
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-brand-primary transition-all duration-500 group-hover:w-full"></span>
             </Link>
             <Link to="/contact" className="meta-text transition-colors text-brand-secondary/80 hover:text-brand-primary relative group">
                Contact
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-brand-primary transition-all duration-500 group-hover:w-full"></span>
             </Link>
          </div>

          {/* Action Icons (Right) */}
          <div className="flex items-center gap-3 md:gap-6 border-l border-brand-primary/20 pl-4 md:pl-8">
            <button className="transition-all text-brand-secondary/60 hover:text-brand-primary hover:scale-110">
              <Search size={16} strokeWidth={1.5} />
            </button>
            <Link to={user?.isLoggedIn ? "/user-profile" : "/login"} className="transition-all text-brand-secondary/60 hover:text-brand-primary hover:scale-110 flex items-center gap-2 group/user">
               <div className={`w-8 h-8 rounded-full border border-brand-primary/10 flex items-center justify-center transition-all ${user?.isLoggedIn ? 'bg-brand-primary/10' : ''}`}>
                  <User size={14} strokeWidth={1.5} className={user?.isLoggedIn ? 'text-brand-primary' : ''} />
               </div>
               {user?.isLoggedIn && (
                 <span className="hidden xl:block text-[9px] font-black uppercase tracking-widest text-brand-primary opacity-0 group-hover/user:opacity-100 transition-opacity">Registry Access</span>
               )}
            </Link>
            <Link to="/wishlist" className="transition-all text-brand-secondary/60 hover:text-brand-primary hover:scale-110">
               <Heart size={16} strokeWidth={1.5} />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="transition-all text-brand-secondary/60 hover:text-brand-primary hover:scale-110 relative"
            >
                <ShoppingBag size={16} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-primary text-brand-accent text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-brand-accent">
                    {totalItems}
                  </span>
                )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden md:flex lg:hidden p-2 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-accent transition-all"
            >
              {isOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </nav>
    </div>

    {/* Mobile Screen Overlay */}
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0, filter: 'blur(20px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            className="fixed inset-0 z-[90] bg-brand-accent/95 backdrop-blur-3xl hidden md:flex lg:hidden flex-col justify-center items-center"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            
            <div className="flex flex-col gap-8 text-center relative z-10 w-full px-10">
              {[
                { name: 'Home', path: '/' },
                { name: 'Shop Archive', path: '/shop' },
                { name: 'Custom Blueprint', path: '/customize' },
                { name: 'Member Diaries', path: '/testimonials' },
                { name: 'Concierge', path: '/contact' }
              ].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="block text-4xl font-serif text-brand-secondary hover:text-brand-primary transition-all italic tracking-tighter"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.6 }}
               className="absolute bottom-12 meta-text text-brand-primary italic opacity-40 text-center"
            >
               Volume No. 01 <br/> Architectural Heritage
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>

    {/* Floating WhatsApp Support */}
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden lg:flex fixed bottom-8 right-8 z-[150] bg-[#D4AF37] text-[#1A0A16] p-4 rounded-full shadow-[0_10px_40px_rgba(212,175,55,0.4)] border border-[#FAF9F6]/20 hover:scale-110 transition-transform items-center justify-center group"
    >
      <div className="absolute inset-0 bg-[#D4AF37] rounded-full animate-ping opacity-20" />
      <MessageCircle size={24} className="relative z-10" />
      <span className="absolute right-full mr-4 bg-[#1A0A16] border border-[#D4AF37]/30 text-[#FAF9F6] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl pointer-events-none whitespace-nowrap">
        Boutique Concierge
      </span>
    </a>
    </>
  );
}
