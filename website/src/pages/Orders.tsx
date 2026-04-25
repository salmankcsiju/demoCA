import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Scissors, CheckCircle2, 
  Truck, CreditCard, MessageCircle, 
  Calendar, Ruler, Info, Sparkles
} from 'lucide-react';

const BASE_URL = 'http://localhost:8000';

const steps = [
  { id: 'new_enquiry', label: 'Enquiry Received', icon: MessageCircle, color: 'text-brand-primary' },
  { id: 'received', label: 'Confirmed', icon: CheckCircle2, color: 'text-brand-secondary' },
  { id: 'cutting', label: 'Master Cutting', icon: Scissors, color: 'text-brand-primary' },
  { id: 'stitching', label: 'At the Tailor', icon: Ruler, color: 'text-brand-secondary' },
  { id: 'payment_pending', label: 'Payment Pending', icon: CreditCard, color: 'text-red-500' },
  { id: 'shipped', label: 'In Transit', icon: Truck, color: 'text-brand-primary' },
  { id: 'finished', label: 'Delivered', icon: CheckCircle2, color: 'text-brand-secondary' }
];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/custom-orders/my_orders/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light">
       <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-light pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Sparkles size={16} className="text-brand-secondary animate-pulse" />
                 <span className="text-brand-secondary font-black tracking-[0.4em] uppercase text-[10px]">Your Boutique Journey</span>
              </div>
              <h1 className="text-3xl md:text-8xl font-serif text-brand-primary leading-[0.85] tracking-tighter">Personal <span className="italic font-normal text-brand-primary/20">Registry</span></h1>
           </div>
           <p className="text-brand-primary/40 text-lg max-w-xs font-light italic leading-relaxed">
             Tracing every stitch of your customize on your style masterpiece from our atelier to your doorstep.
           </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-brand-warm rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 text-center border border-brand-primary/5 shadow-sm">
             <Package size={80} strokeWidth={1} className="mx-auto text-brand-primary/10 mb-8" />
             <h2 className="text-4xl font-serif text-brand-primary mb-4">No Journeys Started Yet</h2>
             <p className="text-brand-primary/30 mb-12 max-w-sm mx-auto italic">Your custom designs and stitching updates will appear here once you begin your story.</p>
             <button onClick={() => window.location.href='/customize'} className="bg-brand-primary text-white px-12 py-5 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-brand-accent transition-all shadow-xl">Start Customizing</button>
          </div>
        ) : (
          <div className="space-y-16">
            {orders.map((order, idx) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand-warm rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-brand-primary/5 shadow-sm hover:shadow-2xl transition-all duration-[1s] group"
              >
                <div className="p-10 md:p-16">
                   {/* Header */}
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                      <div className="flex items-center gap-8">
                         <div className="w-24 h-24 bg-brand-light rounded-[2rem] overflow-hidden shadow-inner border border-brand-primary/5 group-hover:scale-105 transition-transform duration-700">
                            {order.reference_image ? (
                              <img src={order.reference_image.startsWith('http') ? order.reference_image : `${BASE_URL}${order.reference_image}`} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-brand-primary/20"><Package size={40} strokeWidth={1} /></div>
                            )}
                         </div>
                         <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">Order #AMORA-{order.id.toString().padStart(4, '0')}</span>
                            <h3 className="text-3xl font-serif text-brand-primary">{order.fabric_name || 'Customize on Your Style Design'}</h3>
                         </div>
                      </div>
                      <div className="bg-brand-light px-8 py-4 rounded-full flex items-center gap-4 border border-brand-primary/5 shadow-sm">
                         <Calendar size={16} className="text-brand-secondary" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                   </div>

                   {/* Tracker */}
                   <div className="relative mb-20 px-4">
                      {/* Line */}
                      <div className="absolute top-1/2 left-0 w-full h-px bg-brand-primary/5 -translate-y-1/2 hidden md:block"></div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-7 gap-6 md:gap-8 relative z-10">
                         {steps.map((step, sIdx) => {
                            const stepIdx = steps.findIndex(s => s.id === order.status);
                            const isPast = stepIdx >= sIdx;
                            const isCurrent = order.status === step.id;
                            const isCompleted = stepIdx > sIdx;
                            
                            return (
                               <div key={step.id} className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.25rem] flex items-center justify-center transition-all duration-7s ${isPast ? 'bg-brand-primary text-white scale-110 shadow-2xl shadow-brand-primary/20' : 'bg-brand-warm border text-brand-primary/10 border-brand-primary/5'}`}>
                                     <step.icon size={18} strokeWidth={1.5} className={isCurrent ? 'animate-pulse' : ''} />
                                  </div>
                                  <div className="space-y-1">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] max-w-[100px] leading-tight block ${isCurrent ? 'text-brand-secondary' : isPast ? 'text-brand-primary' : 'text-brand-primary/20'}`}>
                                       {step.label}
                                    </span>
                                    {isCompleted && <span className="text-[7px] text-brand-secondary font-black uppercase tracking-widest block opacity-60">Complete</span>}
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </div>

                   {/* Footer Info */}
                   <div className="flex flex-col lg:flex-row justify-between items-center bg-brand-light/30 rounded-[1.5rem] md:rounded-[3rem] p-8 gap-8 border border-brand-primary/5 shadow-inner">
                      <div className="flex gap-6 md:gap-12">
                         <div className="text-center md:text-left space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/20 block">Atelier Value</span>
                            <span className="text-2xl font-serif text-brand-primary italic">₹{order.total_price || 'In Review'}</span>
                         </div>
                         <div className="text-center md:text-left space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/20 block">Technical Specs</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">{order.sleeve_name || 'Standard'} • {order.neck_name || 'Signature'}</span>
                         </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 w-full md:w-auto justify-center">
                         {order.status === 'payment_pending' ? (
                            <button className="flex-1 md:flex-none bg-red-500 text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-3">
                               <CreditCard size={18} strokeWidth={1.5} /> Confirm Payment
                            </button>
                         ) : (
                            <button className="flex-1 md:flex-none border border-brand-primary/10 text-brand-primary/40 px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-3">
                               <Info size={18} strokeWidth={1.5} /> Design Details
                            </button>
                         )}
                         <a 
                           href={`https://wa.me/917356198300?text=I'm inquiring about the stitching status of my Order #AMORA-${order.id}`}
                           target="_blank"
                           className="flex-1 md:flex-none bg-[#25D366] text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-green-500/20 hover:scale-105 transition-all flex items-center justify-center gap-4"
                         >
                            <MessageCircle size={18} strokeWidth={1.5} /> Atelier Chat
                         </a>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
