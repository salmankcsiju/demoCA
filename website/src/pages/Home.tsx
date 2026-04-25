import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, ArrowRight, Plus, Star, Quote, Image as ImageIcon
} from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useCart } from '../context/CartContext';

import Reveal from '../components/Reveal';

const BASE_URL = 'http://localhost:8000';

const STATIC_CATEGORIES = [
  { id: 's1', name: 'Kurti', slug: 'kurti', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80' },
  { id: 's2', name: 'Gown', slug: 'gown', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' },
  { id: 's3', name: 'Saree', slug: 'saree', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80' },
  { id: 's4', name: 'Lehenga', slug: 'lehenga', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
  { id: 's5', name: 'Abaya', slug: 'abaya', image: 'https://images.unsplash.com/photo-1559163499-413811fb2344?w=800&q=80' },
  { id: 's6', name: 'Anarkali', slug: 'anarkali', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80' },
];

export default function Home() {
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [diaries, setDiaries] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentSpotlight, setCurrentSpotlight] = useState(0);
  const { addToCart } = useCart();

  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/hero-campaigns/`).then(res => res.json()).then(setCampaigns).catch(console.error);
    fetch(`${BASE_URL}/api/products/?trending=true`).then(res => res.json()).then(setTrendingProducts).catch(console.error);
    fetch(`${BASE_URL}/api/categories/`).then(res => res.json()).then(data => {
        const topLevel = data.filter((c: any) => !c.parent);
        if (topLevel.length > 0) setCategories(topLevel);
    }).catch(() => {});
    
       fetch(`${BASE_URL}/api/diaries/`).then(res => res.json()).then(setDiaries).catch(() => {});
       fetch(`${BASE_URL}/api/testimonials/`).then(res => res.json()).then(setTestimonials).catch(() => {});
  }, []);

  useEffect(() => {
    if (campaigns.length <= 1) return;
    const interval = setInterval(() => setCurrentSpotlight(s => (s + 1) % campaigns.length), 6000);
    return () => clearInterval(interval);
  }, [campaigns]);

  return (
    <div className="bg-brand-accent min-h-screen font-sans selection:bg-brand-primary selection:text-brand-secondary">
      {/* 1. Atelier Spotlight (Hero) */}
      <section ref={heroRef} className="relative min-h-[100vh] md:min-h-[90vh] w-full overflow-hidden bg-brand-accent">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSpotlight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-0"
          >
            {campaigns[currentSpotlight]?.video_url ? (
                <video 
                   src={campaigns[currentSpotlight].video_url} 
                   autoPlay muted loop playsInline
                   className="w-full h-full absolute inset-0 object-cover object-center mix-blend-luminosity opacity-70 scale-105"
                />
            ) : (
                <motion.img 
                  src={campaigns[currentSpotlight]?.desktop_image || '/hero_model.png'} 
                  style={{ y: heroY }}
                  className="w-full h-full object-cover object-center mix-blend-luminosity opacity-70 scale-105"
                  alt="Atelier"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-accent via-brand-accent/50 to-transparent" />
            <div className="absolute inset-0 bg-brand-primary/5 mix-blend-overlay" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 h-full flex flex-col justify-end p-8 pt-[140px] md:pt-24 md:p-16 lg:p-24 xl:p-28 max-w-[100vw]">
          <div className="w-full grid grid-cols-12 items-end gap-6 md:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 xl:col-span-8"
            >
              <Reveal delay={0.3}>
                <span className="meta-text text-brand-primary mb-4 md:mb-6 hidden md:block overflow-hidden">
                   {campaigns[currentSpotlight]?.subtitle || "Volume No. 01 — Architectural Heritage"}
                </span>
              </Reveal>
              <h1 className="text-3xl md:text-7xl md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-serif text-brand-secondary mb-4 md:mb-8 flex flex-col leading-[0.8] tracking-tighter">
                {(campaigns[currentSpotlight]?.title || "Bespoke Elegance").split(' ').map((word: string, i: number) => (
                  <motion.span 
                    key={i} 
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + (i * 0.15), duration: 2, ease: [0.16, 1, 0.3, 1] }}
                    className={`block ${i % 2 !== 0 ? 'italic font-light ml-[10vw] text-brand-primary' : ''}`}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 2 }}
              className="col-span-12 xl:col-span-4 xl:mb-12"
            >
               <Reveal delay={2.2} direction="left">
                 <div className="pl-4 md:pl-12 border-l border-brand-primary/30 space-y-8 md:space-y-12">
                    <p className="text-brand-secondary/80 text-xl font-serif italic leading-relaxed">
                      "A study in silent luxury—where heritage threads meet the architectural purity of the modern era. Curated exclusively for the modern aesthete."
                    </p>
                    <Link to={campaigns[currentSpotlight]?.cta_link || "/shop"} className="btn-prestige inline-flex items-center gap-4 group rounded-full px-8 py-3">
                      {campaigns[currentSpotlight]?.cta_text || "Explore the Archive"}
                      <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
                    </Link>
                 </div>
               </Reveal>
            </motion.div>
          </div>
        </div>
      </section>


      {/* 2. Trending Now Marquee */}
      <section className="pt-24 pb-16 md:py-20 bg-brand-accent overflow-hidden border-b border-brand-primary/5">
        <Reveal className="px-4 md:px-12 mb-12 w-full" width="100%">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end text-center md:text-left gap-6 md:gap-0">
             <div className="space-y-4">
                <span className="meta-text text-brand-primary text-[10px]">The Current Dialogue</span>
                <h2 className="text-3xl md:text-6xl md:text-7xl font-serif text-brand-secondary tracking-tighter italic">Trending Catalogue</h2>
             </div>
             <Link to="/shop" className="meta-text text-brand-secondary/40 hover:text-brand-primary transition-colors flex items-center gap-2">Explore All <ChevronRight size={12} /></Link>
          </div>
        </Reveal>

        <div className="relative">
          {trendingProducts.length > 0 && (
            <motion.div 
              className="flex gap-8 md:gap-16 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 30, 
                ease: "linear", 
                repeat: Infinity 
              }}
            >
              {[...trendingProducts, ...trendingProducts, ...trendingProducts, ...trendingProducts].map((prod, i) => (
                <Link 
                  key={`${prod.id}-${i}`} 
                  to={`/product/${prod.id}`}
                  className="inline-block flex-shrink-0 w-[280px] md:w-[350px] group"
                >
                    <div className="aspect-[3/4] overflow-hidden mb-8 relative border border-brand-primary/5 shadow-2xl group-hover:shadow-[0_0_50px_rgba(212,175,55,0.2)] transition-all duration-700 rounded-3xl">
                       <LazyLoadImage 
                          src={prod.image} 
                          effect="blur"
                          wrapperClassName="w-full h-full"
                          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
                          alt={prod.title} 
                       />
                       <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-brand-secondary to-transparent">
                          <button 
                            onClick={(e) => {
                              e.preventDefault(); e.stopPropagation(); addToCart(prod);
                            }}
                            className="w-full bg-brand-primary text-brand-accent py-4 flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-[9px] hover:bg-brand-secondary hover:text-brand-accent transition-all rounded-xl"
                          >
                             <Plus size={14} />
                             Quick Add
                          </button>
                       </div>
                    </div>
                    <div className="space-y-3 px-2">
                       <div className="flex justify-between items-start">
                          <h3 className="text-xl md:text-2xl font-serif text-brand-secondary italic truncate flex-1 group-hover:text-brand-primary transition-colors">{prod.title}</h3>
                          <p className="meta-text text-brand-primary pt-2 ml-4">€{prod.base_price}</p>
                       </div>
                    </div>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 2.5 The Artisanal Vision (New Section) */}
      <section className="pt-24 pb-20 md:py-32 bg-brand-accent text-brand-secondary relative overflow-hidden">
        <div className="absolute top-1/4 -right-[20%] w-[60%] h-[60%] bg-brand-primary/5 rounded-full blur-[80px] md:blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
           <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-left w-full">
             <Reveal>
               <span className="meta-text text-brand-primary mb-2 block">The Heritage</span>
               <h2 className="text-2xl md:text-8xl font-serif tracking-tighter leading-[0.9]">
                 Silent <span className="text-brand-primary italic">Luxury</span>
               </h2>
             </Reveal>
             
             <Reveal delay={0.2}>
               <p className="text-brand-secondary/70 font-serif italic text-xl leading-relaxed">
                 Casa Amora reimagines traditional tailoring as an art form. Each piece is constructed not just with fabric, but with architectural precision. We look to the past for heritage, and to the future for silhouette.
               </p>
             </Reveal>
             
             <Reveal delay={0.4}>
               <div className="grid grid-cols-2 gap-6 md:gap-12 pt-8 border-t border-brand-primary/10">
                 <div>
                    <h4 className="text-4xl font-serif italic mb-2">200+</h4>
                    <span className="meta-text text-brand-secondary/40">Hours per Garment</span>
                 </div>
                 <div>
                    <h4 className="text-4xl font-serif italic mb-2">01</h4>
                    <span className="meta-text text-brand-secondary/40">Singular Vision</span>
                 </div>
               </div>
             </Reveal>
           </div>
           
           <div className="relative">
             <Reveal delay={0.3} direction="up">
               <div className="aspect-[3/4] overflow-hidden rounded-t-full shadow-2xl relative">
                  <img src="https://images.unsplash.com/photo-1550614000-4b95d4ed79d7?w=1000&q=80" alt="Artisan Craft" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-accent/60 to-transparent mix-blend-multiply" />
               </div>
             </Reveal>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute -bottom-12 -left-12 w-48 h-48 border-2 border-brand-primary/40 rounded-full border-dashed hidden md:block" 
             />
           </div>
        </div>
      </section>



      {/* 3. Category Discovery - Boutique Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-20 md:py-32">
        <Reveal className="text-center mb-12 md:mb-20 space-y-6 w-full" width="100%">
           <span className="meta-text text-brand-primary">The Boutique Index</span>
           <h2 className="text-3xl md:text-7xl font-serif text-brand-secondary italic tracking-tighter">Browse Our Collections</h2>
           <p className="text-brand-secondary/40 text-lg font-light italic max-w-xl mx-auto">
             Each selection is a chapter in our narrative, exploring the intersection of traditional artistry and architectural form.
           </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-12">
           {categories.map((cat, idx) => (
             <Reveal key={cat.id} delay={idx * 0.1} direction="up">
               <Link 
                 to={`/category/${cat.slug}`}
                 className="group block space-y-6 text-center"
               >
                  <div className="aspect-square rounded-full overflow-hidden border-2 border-brand-primary/10 group-hover:border-brand-primary p-2 transition-all duration-700 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                     <div className="w-full h-full rounded-full overflow-hidden">
                        <img 
                          src={cat.image || 'https://images.unsplash.com/photo-1559163499-413811fb2344?w=800&q=80'} 
                          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                          alt={cat.name} 
                        />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="meta-text text-brand-primary text-[7px] opacity-0 group-hover:opacity-100 transition-all">Volume {idx + 1}</p>
                     <h3 className="text-xl font-serif text-brand-secondary italic truncate group-hover:text-brand-primary transition-colors">{cat.name}</h3>
                  </div>
               </Link>
             </Reveal>
           ))}
        </div>
      </section>


      {/* 4. The Atelier Ritual (Process) - Simple English */}
      <section className="bg-brand-light text-brand-secondary pt-28 pb-16 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-12 gap-16 md:gap-24 items-center">
           <div className="lg:col-span-5 space-y-8 text-center md:text-left">
              <Reveal direction="right">
                <span className="meta-text text-brand-primary">How It Works</span>
                <h2 className="text-3xl md:text-7xl font-serif tracking-tighter leading-none italic">Atelier Ritual</h2>
                <p className="text-brand-secondary/60 text-lg md:text-xl font-light italic leading-relaxed">
                  We believe in the architectural purity of fit. A simple three-step ritual to bring your masterpiece to life.
                </p>
                <div className="pt-12">
                  <Link to="/customize" className="btn-accent italic px-16 rounded-full">Start Your Creation</Link>
                </div>
              </Reveal>
           </div>

           <div className="lg:col-span-7 space-y-8">
              {[
                { idx: '01', title: 'Pick Your Style', desc: 'Choose from our curated silhouettes or upload a picture of your own inspiration.' },
                { idx: '02', title: 'Share Your Size', desc: 'Provide your measurements following our easy diagnostic guide for a perfect fit.' },
                { idx: '03', title: 'We Stitch, You Shine', desc: 'Our master tailors craft your garment and deliver it directly to your doorstep.' }
              ].map((item, i) => (
                <Reveal key={item.idx} direction="left" delay={i * 0.2}>
                  <div className="group flex gap-6 md:gap-12 p-6 md:p-12 bg-brand-warm/5 border border-white/5 hover:border-brand-primary/30 transition-all duration-700 rounded-3xl hover:shadow-[0_0_50px_rgba(212,175,55,0.1)] hover:bg-white/[0.08]">
                     <span className="text-3xl md:text-5xl font-serif italic text-brand-primary/20 group-hover:text-brand-primary transition-colors">{item.idx}</span>
                     <div className="space-y-4">
                        <h4 className="text-3xl font-serif italic text-white">{item.title}</h4>
                        <p className="text-brand-secondary/40 text-sm font-light italic leading-relaxed">{item.desc}</p>
                     </div>
                  </div>
                </Reveal>
              ))}
           </div>
        </div>
      </section>


      {/* 5. Client Diaries - Restricted */}
        <section className="pt-24 pb-20 md:py-32 bg-brand-accent">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <Reveal className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-20 w-full text-center md:text-left gap-6 md:gap-0" width="100%">
               <div className="space-y-4">
                  <span className="meta-text text-brand-primary">Exclusive Access</span>
                  <h2 className="text-3xl md:text-7xl font-serif text-brand-secondary italic tracking-tighter">Client Diaries</h2>
               </div>
               <Link to="/testimonials" className="meta-text text-brand-secondary/40 hover:text-brand-primary transition-colors flex items-center gap-2">The Archive <ChevronRight size={12} /></Link>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
               {diaries.length > 0 ? diaries.slice(0, 3).map((diary, i) => (
                 <Reveal key={diary.id} delay={i * 0.2}>
                   <motion.div 
                     whileHover={{ y: -10 }}
                     className="bg-brand-warm rounded-[2rem] overflow-hidden shadow-2xl border border-brand-primary/5 flex flex-col"
                   >
                      <div className="grid grid-cols-2 h-64 border-b border-brand-primary/10">
                         <img src={diary.before_image} alt="Before" className="w-full h-full object-cover grayscale" />
                         <img src={diary.after_image} alt="After" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-8 space-y-4 flex-1">
                         <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-serif italic text-brand-secondary">{diary.client_name}</h3>
                            <span className="text-[10px] uppercase font-black tracking-widest text-brand-primary">Verification OK</span>
                         </div>
                         <p className="text-brand-secondary/60 text-sm italic line-clamp-3 leading-relaxed">{diary.description}</p>
                      </div>
                   </motion.div>
                 </Reveal>
               )) : (
                 <Reveal className="col-span-full py-20 text-center border-2 border-dashed border-brand-primary/20 rounded-[1.5rem] md:rounded-[3rem]" width="100%">
                    <ImageIcon size={48} className="mx-auto text-brand-primary/30 mb-6" />
                    <p className="text-brand-secondary/40 font-serif italic text-2xl">The diaries are being compiled...</p>
                 </Reveal>
               )}
            </div>
          </div>
        </section>


      {/* 6. Testimonials - Members Only section */}
      <section className="pt-24 pb-20 md:py-32 bg-brand-light text-brand-secondary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6">
           <Reveal className="text-center mb-12 md:mb-20 space-y-4 w-full" width="100%">
              <span className="meta-text text-brand-primary">The Collective Voice</span>
              <h2 className="text-3xl md:text-7xl font-serif italic tracking-tighter">What Our Members Say</h2>
           </Reveal>


             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                {testimonials.slice(0, 3).map((t, i) => (
                  <Reveal key={t.id} delay={i * 0.2}>
                    <div className="p-6 md:p-12 bg-brand-warm/5 border border-white/5 rounded-[2.5rem] space-y-8 flex flex-col relative" >
                       <Quote className="text-brand-primary/20 absolute top-12 right-12" size={64} />
                       <div className="flex gap-1 text-brand-primary">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < t.rating ? "currentColor" : "none"} />)}
                       </div>
                       <p className="text-xl font-serif italic text-brand-secondary/80 leading-relaxed flex-1">"{t.text_review}"</p>
                       <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                          <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center font-serif text-brand-secondary text-xl">
                             {t.name[0]}
                          </div>
                          <div>
                             <p className="text-brand-secondary font-serif italic">{t.name}</p>
                             <p className="text-[9px] uppercase tracking-widest text-brand-primary">Verified Member</p>
                          </div>
                       </div>
                    </div>
                  </Reveal>
                ))}
             </div>
        </div>
      </section>


    </div>
  );
}


