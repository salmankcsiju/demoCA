import { Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { User, MessageCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import MiniCart from './components/MiniCart';
import SmoothScroll from './components/SmoothScroll';
import PageTransition from './components/PageTransition';
import Footer from './components/Footer';

// Context
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Customizer from './pages/Customizer';
import Shop from './pages/Shop';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import StaffPortal from './pages/StaffPortal';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';

function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const dialRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(location.pathname);
  const scrollTimeout = useRef<any>(null);

  const routes = [
    { path: '/customize', name: 'CUSTOM' },
    { path: '/shop', name: 'ATELIER' },
    { path: '/', name: 'HOME' },
    { path: '/testimonials', name: 'DIARIES' },
    { path: '/contact', name: 'CONTACT' }
  ];

  // Sync state with location
  useEffect(() => {
    setActiveTab(location.pathname);
    if (dialRef.current) {
       const activeEl = dialRef.current.querySelector(`[data-path="${location.pathname}"]`);
       if (activeEl) {
         activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
       }
    }
  }, [location.pathname]);

  const handleScroll = () => {
    if (!dialRef.current) return;
    
    // Find centered item
    const container = dialRef.current;
    const center = container.scrollLeft + container.offsetWidth / 2;
    const items = Array.from(container.children) as HTMLElement[];
    
    let closestPath = activeTab;
    let minDistance = Infinity;

    items.forEach((item) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(center - itemCenter);
      
      const path = item.getAttribute('data-path');
      if (distance < minDistance && path) {
        minDistance = distance;
        closestPath = path;
      }

      // Dynamic styling based on distance
      const maxDistance = 150;
      const scale = Math.max(0.7, 1.2 - (distance / maxDistance) * 0.5);
      const opacity = Math.max(0.2, 1 - (distance / maxDistance) * 0.8);
      
      const span = item.querySelector('span');
      if (span) {
        span.style.transform = `scale(${scale})`;
        span.style.opacity = `${opacity}`;
        span.style.color = distance < 40 ? 'var(--color-brand-primary)' : 'var(--color-brand-secondary)';
      }
    });

    if (closestPath !== activeTab) {
      setActiveTab(closestPath);
    }

    // Auto-navigate after scrolling stops
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (closestPath !== location.pathname) {
        navigate(closestPath);
      }
    }, 400);
  };

  return (
    <div className="md:hidden fixed bottom-6 w-full z-[110] px-4 pointer-events-none overflow-hidden">
      <div className="bg-brand-accent/90 backdrop-blur-3xl rounded-full border border-brand-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center p-2 pointer-events-auto">
        {/* Left Controls (WhatsApp) */}
        <a href="https://wa.me/7356198300" target="_blank" rel="noreferrer" className="w-10 h-10 shrink-0 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center relative z-20 hover:scale-110 transition-transform">
          <MessageCircle size={18} />
        </a>
        
        {/* The Text Dial (Inline) */}
        <div className="flex-1 relative h-12 w-full overflow-hidden mx-1">
           <div className="absolute left-0 w-12 h-full bg-gradient-to-r from-brand-accent/90 to-transparent z-10 pointer-events-none" />
           <div className="absolute right-0 w-12 h-full bg-gradient-to-l from-brand-accent/90 to-transparent z-10 pointer-events-none" />
           
           <div 
            ref={dialRef} 
            onScroll={handleScroll}
            className="w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex items-center scroll-smooth px-[40vw]"
           >
              {routes.map(r => (
                <div 
                  key={r.path} 
                  data-path={r.path}
                  onClick={() => navigate(r.path)}
                  className="snap-center shrink-0 px-6 cursor-pointer flex items-center justify-center h-full"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 whitespace-nowrap block origin-center">
                    {r.name}
                  </span>
                </div>
              ))}
           </div>
        </div>

        {/* Right Controls (User) */}
        <Link to="/user-profile" className="w-10 h-10 shrink-0 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center relative z-20 hover:scale-110 transition-transform">
          <User size={18} />
        </Link>
      </div>
    </div>
  );
}

function AdminRedirect() {
  useEffect(() => {
    window.location.href = 'http://localhost:8000/admin/';
  }, []);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isAtelierPath = location.pathname.startsWith('/staff-portal');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/profile' || location.pathname === '/user-profile';
  const hideNavbar = isAtelierPath;
  const hideFooter = isAtelierPath || isAuthPage;
  const hideMobileNav = isAtelierPath || isAuthPage;

  return (
    <div className="min-h-screen bg-brand-secondary selection:bg-brand-primary/30 text-brand-secondary">
      {!hideNavbar && <Navbar />}
      {!hideNavbar && <MiniCart />}
      
      <main className={!hideNavbar ? "pb-20 md:pb-0 font-sans" : "font-sans min-h-screen"}>
        <SmoothScroll>
          <AnimatePresence mode="wait">
            <Suspense fallback={<div className="p-20 text-center text-brand-primary font-serif italic">Loading Atelier...</div>}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
                <Route path="/testimonials" element={<PageTransition><Testimonials /></PageTransition>} />
                <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                <Route path="/category/:slug" element={<PageTransition><CategoryPage /></PageTransition>} />
                <Route path="/product/:id" element={<PageTransition><ProductPage /></PageTransition>} />
                <Route path="/customize" element={<PageTransition><Customizer /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/user-profile" element={<PageTransition><UserProfile /></PageTransition>} />
                
                {/* Staff Route */}
                <Route path="/staff-portal/*" element={<PageTransition><StaffPortal /></PageTransition>} />
                
                {/* Catch All Redirect */}
                <Route path="/admin/*" element={<AdminRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </SmoothScroll>
      </main>

      {!hideFooter && <Footer />}
      {!hideMobileNav && <MobileNavigation />}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
