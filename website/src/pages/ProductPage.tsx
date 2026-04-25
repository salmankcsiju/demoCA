import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ChevronLeft, ChevronRight, Award, Scissors, MessageCircle, ArrowRight, Plus
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:8000';

interface Product {
  id: number;
  title: string;
  description: string;
  base_price: string;
  image: string;
  category: {
    name: string;
    slug: string;
  };
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const { addToCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/products/${id}/`)
      .then(r => r.json())
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`${BASE_URL}/api/config/`)
      .then(res => res.json())
      .then(setConfig)
      .catch(() => {});
    
    fetch(`${BASE_URL}/api/wishlist/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(r => r.json())
    .then(data => setWishlisted(data.some((item: any) => item.product === parseInt(id || '0'))))
    .catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      alert("Please select your silhouette (size) first.");
      return;
    }
    addToCart({ ...product, selectedSize });
  };

  const handleReserveInit = () => {
    if (!product) return;
    if (!selectedSize) {
        alert("Please select your silhouette (size) first.");
        return;
    }
    setShowReserveModal(true);
  };

  const handleQuickInquiry = async () => {
    if (!product) return;
    setInquiryStatus('sending');
    try {
      const saved = localStorage.getItem('user_details');
      const details = saved ? JSON.parse(saved) : { name: 'Interested Client', phone: '' };

      await fetch(`${BASE_URL}/api/inquiries/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          phone: details.phone,
          message: `Quick Interest: ${product.title} (Registry ID: ${product.id})`,
          source: 'Product Page Quick Reserve',
          product: product.id
        })
      });
      setInquiryStatus('success');
      setTimeout(() => setInquiryStatus('idle'), 3000);
    } catch {
      setInquiryStatus('idle');
    }
  };

  if (loading) return <div className="min-h-screen bg-brand-accent flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-primary border-t-transparent animate-spin"></div></div>;
  if (!product) return <div className="min-h-screen bg-brand-accent flex flex-col items-center justify-center gap-6"><h2 className="text-4xl font-serif text-brand-secondary italic text-center uppercase tracking-tighter">Masterpiece Not Found</h2><Link to="/shop" className="btn-prestige italic">Back to Shop</Link></div>;

  const whatsappLink = `https://wa.me/${config?.whatsapp_number || '7356198300'}?text=I'm interested in: ${product.title} (ID: ${product.id})`;

  return (
    <div className="min-h-screen bg-brand-accent pb-16 selection:bg-brand-primary/30">
      {/* 1. Sticky Mini-Header */}
      <AnimatePresence>
        {scrolled && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-brand-primary/95 backdrop-blur-xl py-6 px-12 flex justify-between items-center border-b border-brand-primary/10 shadow-2xl"
          >
            <div className="flex items-center gap-6 md:gap-12">
               <button onClick={() => navigate(-1)} className="meta-text text-brand-secondary/40 hover:text-brand-secondary transition-colors"><ChevronLeft size={16} /></button>
               <div className="flex items-baseline gap-6">
                  <h4 className="text-2xl font-serif text-brand-secondary leading-none italic">{product.title}</h4>
                  <span className="meta-text text-brand-primary">Ref.{product.id}</span>
               </div>
            </div>
            <div className="flex items-center gap-10">
               <span className="meta-text text-brand-secondary/60 italic">₹{parseFloat(product.base_price).toLocaleString()}</span>
               <button onClick={handleReserveInit} className="btn-accent py-3 px-10 rounded-full">
                  Reserve for Consultation
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24">
        {/* 2. Two-Column Split */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 lg:gap-32 items-start">
          
          {/* Left: Gallery (Sticky) */}
          <div className="lg:sticky lg:top-40 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5 }}
              className="relative aspect-[3/4] bg-brand-warm overflow-hidden border border-brand-primary/5 group rounded-[2.5rem] shadow-2xl"
            >
              <img src={product.image} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" alt={product.title} />
              <button 
                onClick={() => setWishlisted(!wishlisted)}
                className="absolute top-10 right-10 w-14 h-14 bg-brand-warm/90 backdrop-blur-md rounded-full flex items-center justify-center text-brand-secondary hover:bg-brand-primary hover:text-white transition-all shadow-xl"
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} className={wishlisted ? 'text-brand-primary hover:text-white' : 'opacity-40'} />
              </button>
            </motion.div>
            
            <div className="p-6 md:p-12 border-l-2 border-brand-primary bg-brand-warm shadow-xl rounded-r-3xl space-y-6">
               <span className="meta-text text-brand-primary">Atelier Philosophy</span>
               <p className="text-brand-secondary/60 text-xl font-serif italic leading-relaxed">
                 "True elegance is measured by the silence of the stitch and the architecture of the drape."
               </p>
            </div>
          </div>


          {/* Right: Details (Scrollable) */}
          <div className="space-y-12 md:space-y-16">
            <div className="space-y-10">
               <div className="flex items-center gap-6">
                  <span className="meta-text text-brand-primary italic">Catalogue Index SS24</span>
                  <span className="h-px flex-1 bg-brand-primary/10"></span>
               </div>
               <h1 className="text-4xl md:text-8xl md:text-[8rem] font-serif text-brand-secondary leading-[0.8] tracking-tighter italic font-light">{product.title}</h1>
               <p className="text-brand-secondary/40 text-2xl leading-relaxed italic font-light max-w-xl">
                 "{product.description}"
               </p>
            </div>

            <div className="flex flex-col gap-4 pt-8 border-t border-brand-primary/10">
               <span className="meta-text text-brand-secondary/20 italic font-black">Registry Price</span>
               <div className="flex items-baseline gap-4">
                  <div className="text-4xl md:text-7xl font-serif text-brand-secondary italic">₹{parseFloat(product.base_price).toLocaleString()}</div>
                  <span className="meta-text text-brand-primary">— Custom Fit Included</span>
               </div>
            </div>


            {/* Silhouette Selection */}
            <div className="space-y-6 pt-8 border-t border-brand-primary/10">
               <span className="meta-text text-brand-secondary/20 italic font-black">Select Your Silhouette</span>
               <div className="flex flex-wrap gap-4">
                  {['S', 'M', 'L', 'XL', 'Customize on Your Style'].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-8 py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${selectedSize === size ? 'bg-brand-primary text-white border-brand-primary shadow-xl' : 'bg-transparent text-brand-primary/40 border-brand-primary/10 hover:border-brand-primary'}`}
                    >
                      {size}
                    </button>
                  ))}
               </div>
            </div>

            {/* Action Grid */}
            <div className="grid gap-6">
               <button 
                onClick={handleReserveInit}
                className="btn-accent py-10 shadow-2xl rounded-2xl flex items-center justify-center gap-4 group"
               >
                 Reserve for Consultation
                 <Award size={16} className="group-hover:scale-110 transition-transform" />
               </button>

               <button 
                onClick={handleAddToCart}
                className="btn-prestige py-8 text-xs italic flex items-center justify-center gap-4 group border-brand-primary/20 hover:border-brand-primary transition-all rounded-2xl"
               >
                 Add to My Registry
                 <Heart size={14} className="group-hover:fill-brand-primary transition-all" />
               </button>
               
               <div className="flex gap-4">
                  <button 
                    onClick={handleQuickInquiry}
                    disabled={inquiryStatus === 'sending'}
                    className="flex-1 bg-brand-warm/60 border border-brand-primary/5 py-6 rounded-2xl meta-text text-brand-primary/40 hover:text-brand-primary transition-all text-center"
                  >
                    {inquiryStatus === 'sending' ? 'Transmitting...' : inquiryStatus === 'success' ? 'Reserve Recorded' : 'Quick Interest'}
                  </button>

                  <Link 
                    to="/customize"
                    className="flex-1 flex items-center justify-center gap-3 bg-brand-light text-brand-primary py-6 rounded-2xl meta-text hover:bg-brand-accent transition-all"
                  >
                    <Scissors size={14} /> Custom Tailoring
                  </Link>
               </div>
            </div>


            {/* Artisanal Registry Section */}
            <div className="p-6 md:p-12 border border-brand-primary/10 bg-brand-warm shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
               <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                     <div className="space-y-2">
                        <span className="meta-text text-brand-primary">Mastery Standard</span>
                        <h4 className="text-4xl font-serif italic text-brand-secondary">Artisanal Registry</h4>
                     </div>
                     <Award size={36} className="text-brand-primary" strokeWidth={1} />
                  </div>
                  <p className="text-brand-secondary/60 text-lg font-light italic leading-relaxed">
                    Centuries of tailoring lore distilled into a single garment. We reject mass production in favor of <span className="text-brand-secondary font-medium italic">architectural individuality</span>.
                  </p>
               </div>
            </div>


            {/* WhatsApp Contact */}
            <a href={whatsappLink} className="flex items-center justify-between p-10 bg-brand-light text-white rounded-[1.5rem] md:rounded-[3rem] shadow-2xl hover:scale-[1.02] transition-all group">
               <div className="flex items-center gap-8">
                  <div className="relative">
                     <div className="absolute inset-0 bg-brand-warm/20 rounded-full animate-ping"></div>
                     <div className="relative w-14 h-14 bg-brand-warm/10 text-brand-primary rounded-full flex items-center justify-center">
                        <MessageCircle size={28} />
                     </div>
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary font-serif italic mb-1">Expert Consultation</h4>
                     <p className="text-brand-secondary/60 text-lg italic">Chat with our Master Tailor</p>
                  </div>
               </div>
               <ChevronRight size={24} className="text-brand-primary group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReserveModal && (
          <QuickReserveModal 
            product={product} 
            selectedSize={selectedSize}
            onClose={() => setShowReserveModal(false)} 
            onSuccess={() => {
              setShowReserveModal(false);
              setInquiryStatus('success');
              setTimeout(() => setInquiryStatus('idle'), 3000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickReserveModal({ product, selectedSize, onClose, onSuccess }: any) {
   const { user } = useAuth();
   const [name, setName] = useState(user?.name || '');
   const [phone, setPhone] = useState(user?.phone || '');
   const [loading, setLoading] = useState(false);

   useEffect(() => {
     if (user) {
        setName(user.name);
        setPhone(user.phone);
     } else {
        const saved = localStorage.getItem('user_details');
        if (saved) {
          const details = JSON.parse(saved);
          setName(details.name || '');
          setPhone(details.phone || '');
        }
     }
   }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/api/inquiries/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          message: `Masterpiece Reservation: ${product.title} (Registry ID: ${product.id}). Requested Size: ${selectedSize}`,
          product: product.id,
          source: 'Quick Reserve Modal'
        })
      });
      
      // Also save details locally for next time
      const saved = localStorage.getItem('user_details');
      const details = saved ? JSON.parse(saved) : {};
      localStorage.setItem('user_details', JSON.stringify({ ...details, name, phone }));
      
      onSuccess();
    } catch {
      alert("Encountered an issue in the registry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
       <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }}
         onClick={onClose} 
         className="absolute inset-0 bg-brand-accent/90 backdrop-blur-3xl" 
       />
       <motion.div 
         initial={{ scale: 0.9, opacity: 0, y: 20 }}
         animate={{ scale: 1, opacity: 1, y: 0 }}
         exit={{ scale: 0.9, opacity: 0, y: 20 }}
         className="relative bg-brand-warm p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] max-w-xl w-full border border-brand-primary/20 shadow-[0_50px_100px_rgba(0,0,0,0.5)] space-y-10"
       >
          <div className="text-center space-y-4">
             <span className="meta-text text-brand-primary italic">— Concierge Access</span>
             <h3 className="text-4xl md:text-5xl font-serif text-brand-secondary italic tracking-tighter">Reserve This Piece</h3>
             <p className="text-brand-secondary/40 text-sm italic font-light">Enter your details to initiate the artisanal creation process for: <br/> <strong className="text-brand-secondary">{product.title}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary italic opacity-40">Your Identity</label>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-brand-accent/50 border border-brand-primary/10 p-6 rounded-2xl text-lg font-serif italic text-brand-secondary outline-none focus:border-brand-primary transition-all" 
                />
             </div>
             
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary italic opacity-40">WhatsApp Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 00000 00000" 
                  required 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-brand-accent/50 border border-brand-primary/10 p-6 rounded-2xl text-lg font-serif italic text-brand-secondary outline-none focus:border-brand-primary transition-all" 
                />
             </div>

             <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-accent py-8 rounded-[1.5rem] md:rounded-[3rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                  {loading ? 'Transmitting Registry...' : 'Confirm Reservation'}
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </button>
                <p className="text-center mt-6 text-[9px] font-black uppercase tracking-widest text-brand-primary/30 italic">No payment required until final fitting.</p>
             </div>
          </form>

          <button onClick={onClose} className="absolute top-10 right-10 text-brand-primary/30 hover:text-brand-primary transition-colors">
             <Plus size={24} className="rotate-45" />
          </button>
       </motion.div>
    </div>
  );
}


