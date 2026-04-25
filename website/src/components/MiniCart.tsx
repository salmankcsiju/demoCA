import React from 'react';
import { useCart } from '../context/CartContext';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MiniCart: React.FC = () => {
  const { cart, removeFromCart, isCartOpen, setIsCartOpen, totalPrice } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="relative w-full max-w-md bg-brand-light border-l border-brand-primary/20 shadow-2xl flex flex-col animate-reveal-left">
        <div className="p-6 border-b border-brand-primary/10 flex justify-between items-center bg-brand-warm">
          <h2 className="text-xl font-serif text-brand-primary flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Selection
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-brand-secondary/60 hover:text-brand-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-secondary/40 space-y-4">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="font-light tracking-widest uppercase text-xs">The atelier is empty</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="btn-prestige py-3 px-8 text-[9px]"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-24 h-32 bg-brand-warm overflow-hidden border border-brand-primary/10 rounded-sm">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-sm font-serif text-brand-secondary group-hover:text-brand-primary transition-colors">{item.title}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-brand-primary/60 mt-1">Ready-to-Wear</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-light text-brand-secondary">€{item.base_price} x {item.quantity}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-brand-secondary/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-brand-warm border-t border-brand-primary/10 space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-secondary/60 font-light">Subtotal</span>
              <span className="text-2xl font-serif text-brand-primary">€{totalPrice.toFixed(2)}</span>
            </div>
            
            <Link 
              to="/checkout" 
              onClick={() => setIsCartOpen(false)}
              className="flex items-center justify-center gap-3 w-full bg-brand-primary text-brand-secondary py-5 font-light uppercase tracking-[0.4em] text-[10px] hover:bg-brand-accent transition-all duration-500 group"
            >
              Checkout & Stitching
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="text-[9px] text-center text-brand-secondary/40 font-light italic">
              Manual payment verification via UPI/GPay follows order confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCart;
