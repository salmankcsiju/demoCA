import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Filter, Sparkles 
} from 'lucide-react';

const BASE_URL = 'http://localhost:8000';

interface Product {
  id: number;
  title: string;
  base_price: string;
  image: string;
  category: {
    name: string;
    slug: string;
  };
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/products/?category=${slug}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        if (data.length > 0) {
          setCategoryName(data[0].category.name);
        } else {
          setCategoryName(slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ') : 'Collection');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const token = localStorage.getItem('access_token');
    if (token) {
        fetch(`${BASE_URL}/api/wishlist/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setWishlist(data.map((item: any) => item.product)))
        .catch(() => {});
    }
  }, [slug]);

  const toggleWishlist = async (productId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
        await fetch(`${BASE_URL}/api/wishlist/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ product: productId })
        });
        setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-brand-accent pb-20 md:pb-32 font-sans selection:bg-brand-primary">
      {/* 1. Category Header */}
      <section className="relative h-[40vh] md:h-[60vh] flex items-center justify-center overflow-hidden bg-brand-primary">
         <div className="absolute inset-0 opacity-40">
            <img 
               src="https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=2000" 
               className="w-full h-full object-cover" 
               alt="Heritage"
            />
            <div className="absolute inset-0 bg-brand-primary/60" />
         </div>
         <div className="relative z-10 text-center px-6 max-w-4xl space-y-6">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.5 }}
            >
               <span className="text-brand-secondary font-black tracking-[0.5em] uppercase text-[8px] md:text-[10px] block mb-4">Maison Amora</span>
               <h1 className="text-3xl md:text-7xl lg:text-9xl font-serif text-white tracking-tighter leading-[0.8] mb-6 md:mb-8 uppercase text-center">{categoryName}</h1>
               <div className="w-12 md:w-16 h-1 bg-brand-accent mx-auto mb-6 md:mb-8"></div>
               <p className="text-white/60 text-sm md:text-xl font-light italic leading-relaxed max-w-sm md:max-w-lg mx-auto overflow-hidden text-ellipsis line-clamp-2">
                 "Every garment in the {categoryName} collection is a technical masterpiece of heritage and silhouette."
               </p>
            </motion.div>
         </div>
      </section>

      {/* 2. Grid Discovery */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 md:-mt-20 relative z-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-brand-warm rounded-[1.5rem] md:rounded-[3rem] h-[500px] animate-pulse shadow-sm" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 md:py-40 text-center space-y-12 bg-brand-warm rounded-[2rem] md:rounded-[4rem] shadow-xl flex flex-col items-center px-6">
             <div className="w-24 h-24 bg-brand-light rounded-[2rem] flex items-center justify-center text-brand-primary/20">
                 <Filter size={48} strokeWidth={1} />
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-serif text-brand-primary">Curating Perfection...</h2>
                <p className="text-brand-primary/40 italic">New pieces for this collection are currently being handcrafted.</p>
             </div>
             <Link to="/shop" className="btn-prestige">Back to Gallery</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
            {products.map((prod, idx) => (
              <motion.div 
                key={prod.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group space-y-8"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] md:rounded-[3.5rem] bg-brand-warm shadow-sm hover:shadow-2xl transition-all duration-1000 border border-brand-primary/5">
                   <Link to={`/product/${prod.id}`} className="block h-full">
                      <img 
                         src={prod.image} 
                         alt={prod.title} 
                         className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2.5s] group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-brand-primary/20 transition-all duration-700" />
                   </Link>
                   
                   <button 
                     onClick={() => toggleWishlist(prod.id)}
                     className="absolute top-8 right-8 w-14 h-14 bg-brand-warm/90 backdrop-blur-md rounded-full flex items-center justify-center text-brand-primary shadow-xl hover:scale-110 active:scale-95 transition-all z-20 group/heart"
                   >
                     <Heart size={20} fill={wishlist.includes(prod.id) ? '#D4AF37' : 'none'} className={wishlist.includes(prod.id) ? 'text-brand-secondary' : 'text-brand-primary/20 group-hover/heart:text-brand-secondary transition-colors'} />
                   </button>

                   <Link to={`/product/${prod.id}`} className="absolute bottom-10 left-10 right-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 bg-brand-primary text-white py-6 rounded-full text-center text-[11px] font-black uppercase tracking-widest">
                     Examine Craftsmanship
                   </Link>
                </div>
                <div className="text-center space-y-4">
                   <h3 className="text-3xl font-serif text-brand-primary uppercase group-hover:text-brand-secondary transition-colors leading-tight">
                     {prod.title}
                     <span className="block w-0 h-[1.5px] bg-brand-accent mx-auto mt-2 group-hover:w-16 transition-all duration-700"></span>
                   </h3>
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.4rem] text-brand-primary/20">Starting From</span>
                      <p className="text-2xl font-serif text-brand-primary italic">₹{parseFloat(prod.base_price).toLocaleString()}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Philosophy Section */}
      <section className="mt-20 md:mt-40 text-center space-y-12">
          <div className="w-full px-6 md:px-32 mx-auto">
             <div className="w-px h-32 bg-gradient-to-b from-brand-primary/20 to-transparent mx-auto"></div>
          </div>
          <div className="max-w-2xl mx-auto px-6">
             <Sparkles size={32} className="text-brand-secondary mx-auto mb-8 animate-pulse" />
             <h2 className="text-4xl font-serif text-brand-primary mb-6">The Boutique Philosophy</h2>
             <p className="text-brand-primary/40 text-lg font-light leading-relaxed italic">
               "We do not sell clothes; we document heritage through the silhouette of the modern woman."
             </p>
          </div>
      </section>
    </div>
  );
}
