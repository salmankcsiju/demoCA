import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SlidersHorizontal, Heart, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE_URL = 'http://localhost:8000';

interface Product {
  id: number;
  title: string;
  base_price: string;
  description: string;
  image: string;
  caption: string;
  category: {
    name: string;
    slug: string;
  };
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Newest');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/products/`)
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch wishlist to show active states
    const token = localStorage.getItem('access_token');
    if (token) {
        fetch(`${BASE_URL}/api/wishlist/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => setWishlist(data.map((item: any) => item.product)))
        .catch(() => {});
    }
  }, []);

  const toggleWishlist = async (productId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        await fetch(`${BASE_URL}/api/wishlist/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product: productId })
        });
        
        if (wishlist.includes(productId)) {
            setWishlist(wishlist.filter(id => id !== productId));
        } else {
            setWishlist([...wishlist, productId]);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return parseFloat(a.base_price) - parseFloat(b.base_price);
    if (sortBy === 'Price: High to Low') return parseFloat(b.base_price) - parseFloat(a.base_price);
    return 0;
  });

  return (
    <div className="min-h-screen bg-brand-accent">
      {/* Shop Hero */}
      <div className="bg-brand-warm text-brand-secondary py-20 px-6 relative overflow-hidden border-b border-brand-secondary/5">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 80, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 space-y-12"
          >
            <div className="flex items-center gap-4 overflow-hidden">
                <motion.span 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="meta-text text-brand-primary"
                >
                  Issue No. 01 — Catalogue
                </motion.span>
            </div>
            <h1 className="text-4xl md:text-8xl md:text-[12rem] font-serif leading-[0.8] tracking-tighter">
               {["The", "Atelier", "Archive"].map((word, i) => (
                 <motion.span 
                   key={i}
                   initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                   animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                   transition={{ delay: 0.8 + (i * 0.1), duration: 1, ease: [0.22, 1, 0.36, 1] }}
                   className={`block ${i === 2 ? 'italic font-light ml-20 text-brand-primary/60' : ''}`}
                 >
                   {word}
                 </motion.span>
               ))}
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="text-brand-secondary/40 text-xl font-light italic leading-relaxed max-w-sm"
            >
              An exhaustive study in architectural tailoring. Every silhouette is a curated masterpiece of heritage and form.
            </motion.p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none select-none flex items-center justify-center">
           <span className="text-[25vw] font-serif font-black text-brand-secondary vertical-text tracking-tighter opacity-10">AMORA</span>
        </div>
      </div>




      {/* Toolbar */}
      <div className="sticky top-[80px] z-40 bg-brand-light/95 backdrop-blur-xl border-b border-brand-secondary/5 px-6 py-6 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 md:gap-12">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-4 meta-text text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={12} className="opacity-40" />
              Structural Filters
            </button>
            <div className="h-4 w-px bg-brand-primary/10"></div>
            <p className="meta-text text-brand-secondary/30 italic">{products.length} Masterpieces Listed</p>
          </div>

          <div className="flex items-center gap-8">
             <span className="meta-text text-brand-secondary/20">Ref Index:</span>
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-transparent border-none focus:ring-0 cursor-pointer meta-text text-brand-secondary outline-none italic"
             >
                <option>Newest Arrivals</option>
                <option>Price Ascending</option>
                <option>Price Descending</option>
             </select>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-12 lg:gap-24">
          {loading ? (
             [...Array(6)].map((_, i) => (
                <div key={i} className="col-span-6 space-y-10">
                   <div className="aspect-[3/4] bg-brand-warm/20 animate-pulse rounded-3xl" />
                   <div className="h-4 bg-brand-warm/20 animate-pulse w-1/2 rounded-full" />
                </div>
             ))
          ) : (
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="col-span-full grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-12 lg:gap-24"
            >
              {sortedProducts.map((prod, idx) => (
                <motion.div 
                  key={prod.id} 
                  variants={{
                    hidden: { opacity: 0, y: 60, filter: 'blur(15px)' },
                    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }
                  }}
                  className={`col-span-6 lg:col-span-4 relative group flex flex-col ${idx % 2 === 1 ? 'lg:mt-12' : ''}`}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden border border-brand-secondary/10 bg-brand-warm/30 rounded-[2rem] hover:shadow-[0_0_50px_rgba(212,175,55,0.1)] transition-all duration-700">
                    <Link to={`/product/${prod.id}`} className="block h-full relative overflow-hidden">
                      <img 
                        src={prod.image} 
                        alt={prod.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2.5s] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 transition-all duration-[1s]"></div>
                    </Link>

                    <div className="absolute top-6 right-6 z-10">
                       <button 
                          onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(prod.id);
                          }}
                          className="w-12 h-12 bg-brand-light/80 backdrop-blur-md border border-brand-secondary/10 flex items-center justify-center text-brand-secondary hover:bg-brand-accent hover:text-brand-secondary transition-all rounded-full shadow-xl"
                       >
                          <Heart size={16} fill={wishlist.includes(prod.id) ? 'currentColor' : 'none'} className={wishlist.includes(prod.id) ? 'text-brand-primary' : 'opacity-40 group-hover:opacity-100'} />
                       </button>
                    </div>
                  </div>

                  <div className="mt-10 space-y-4">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <span className="meta-text text-brand-primary block">{prod.category.name} — Vol. SS24</span>
                           <h3 className="font-serif text-3xl group-hover:italic transition-all text-brand-secondary italic">{prod.title}</h3>
                        </div>
                        <p className="meta-text text-brand-secondary/40 pt-2 ml-4 italic">Ref. {prod.id.toString().padStart(3, '0')}</p>
                     </div>
                     
                     <div className="flex items-center gap-6 pt-6 border-t border-brand-secondary/5">
                        <span className="meta-text text-brand-secondary/60">Starting At ₹{parseFloat(prod.base_price).toLocaleString()}</span>
                        <Link to={`/product/${prod.id}`} className="meta-text text-brand-primary flex items-center gap-2 group/btn">
                           Explore Piece <ChevronRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                     </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>


      {/* Atelier Performance Section */}
      <section className="bg-brand-warm text-brand-secondary py-20 md:py-32 px-6 border-t border-brand-secondary/5 mt-16 md:mt-24 relative overflow-hidden">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
            <div className="space-y-12">
               <span className="meta-text text-brand-primary">The Atelier Performance Pledge</span>
               <h2 className="text-4xl md:text-6xl md:text-9xl font-serif leading-[0.8] italic tracking-tighter">Customize on Your Style <span className="opacity-40">Standards</span></h2>
               <p className="text-brand-secondary/40 text-xl font-light italic leading-relaxed max-w-sm">Every garment is a structural study in perfection, guaranteed by the modern atelier's legacy of precision.</p>
            </div>
            
            <div className="grid gap-6 md:gap-12">
                {[
                  { title: 'Anatomical Precision', desc: 'Master cutting that respects the unique architectural flow of your proportions.' },
                  { title: 'Heritage Threads', desc: 'Sourcing the finest global fabrics, chosen for longevity and tactile excellence.' },
                  { title: 'Master Narrative', desc: 'A transparent traceability system connecting your vault directly to our master tailors.' }
                ].map((item, i) => (
                  <div key={i} className="space-y-4 flex gap-8 items-start group">
                      <span className="text-3xl font-serif text-brand-primary/20 group-hover:text-brand-primary transition-colors">0{i + 1}</span>
                      <div className="space-y-2">
                        <h4 className="text-xl font-serif italic text-brand-secondary">{item.title}</h4>
                        <p className="text-brand-secondary/40 text-sm font-light italic leading-relaxed">{item.desc}</p>
                      </div>
                  </div>
                ))}
            </div>
         </div>
      </section>


    </div>
  );
}
