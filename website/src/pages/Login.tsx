import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isWhatsAppSame, setIsWhatsAppSame] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We explicitly handle navigation in the handleSubmit to ensure it's definitive.
  // The useEffect is removed to avoid redundant/conflicting redirects.

  const handleNext = () => {
    if (step === 1 && !name) return;
    if (step === 2 && !phone) return;
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (!name || !phone) return;

    setIsSubmitting(true);
    
    // Update Auth State
    login({
      name,
      phone,
      whatsapp: isWhatsAppSame ? phone : whatsapp
    });
    
    // Force immediate hard redirect to bypass any potential router/animation hangs
    // This is the most robust way to ensure the page 'goes'
    window.location.replace('/user-profile');
  };

  const containerVariants = {
    initial: { opacity: 0, y: 10, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -10, filter: 'blur(8px)' }
  };

  return (
    <div className="min-h-screen bg-brand-accent flex items-center justify-center p-6 selection:bg-brand-primary/30 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-primary/5 rounded-full blur-[160px] animate-pulse" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-[140px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="max-w-xl w-full text-center space-y-16 relative z-10"
        >
          {/* Focused Question */}
          <div className="space-y-6">
             <motion.span 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 0.4 }} 
               className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary italic block"
             >
                — Atelier Registry —
             </motion.span>
             <h1 className="text-3xl md:text-5xl font-serif text-brand-secondary italic tracking-tight leading-tight">
                {step === 1 && "Will you identify yourself for the registry?"}
                {step === 2 && "A point of contact for our concierge?"}
                {step === 3 && "And your WhatsApp preferences?"}
             </h1>
          </div>

          <div className="flex flex-col items-center gap-12">
            <div className="w-full relative px-4">
               {step === 1 && (
                 <input 
                   autoFocus
                   type="text" 
                   placeholder="Your Name" 
                   value={name}
                   onChange={e => setName(e.target.value)}
                   className="w-full bg-transparent border-b border-brand-primary/30 pb-6 text-2xl md:text-4xl font-serif italic text-brand-secondary text-center outline-none focus:border-brand-primary transition-all placeholder:text-brand-secondary/10" 
                 />
               )}

               {step === 2 && (
                 <input 
                   autoFocus
                   type="tel" 
                   placeholder="+91..." 
                   value={phone}
                   onChange={e => setPhone(e.target.value)}
                   className="w-full bg-transparent border-b border-brand-primary/30 pb-6 text-2xl md:text-4xl font-serif italic text-brand-secondary text-center outline-none focus:border-brand-primary transition-all placeholder:text-brand-secondary/10" 
                 />
               )}

               {step === 3 && (
                 <div className="space-y-10 w-full flex flex-col items-center">
                    <button 
                      type="button"
                      onClick={() => setIsWhatsAppSame(!isWhatsAppSame)}
                      className="group flex flex-col items-center gap-4 cursor-pointer"
                    >
                       <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-700 ${isWhatsAppSame ? 'bg-brand-primary border-brand-primary text-brand-warm' : 'border-brand-primary/20 text-brand-primary/20 group-hover:border-brand-primary/40'}`}>
                          {isWhatsAppSame ? <Check size={20} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-700 ${isWhatsAppSame ? 'text-brand-primary' : 'text-brand-secondary/30'}`}>
                          My WhatsApp is the same
                       </span>
                    </button>

                    <AnimatePresence>
                       {!isWhatsAppSame && (
                         <motion.input 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10 }}
                           className="w-full bg-transparent border-b border-brand-primary/30 pb-6 text-2xl md:text-4xl font-serif italic text-brand-secondary text-center outline-none focus:border-brand-primary transition-all placeholder:text-brand-secondary/10" 
                           placeholder="WhatsApp Number"
                           value={whatsapp}
                           onChange={e => setWhatsapp(e.target.value)}
                           autoFocus
                         />
                       )}
                    </AnimatePresence>
                 </div>
               )}
            </div>

            {/* Orchestrated Controls */}
            <div className="flex items-center gap-10">
               {step > 1 && (
                 <button 
                   type="button" 
                   onClick={handleBack} 
                   className="p-4 rounded-full border border-brand-primary/10 text-brand-primary/40 hover:text-brand-primary hover:border-brand-primary/30 transition-all active:scale-90"
                 >
                    <ArrowLeft size={20} strokeWidth={1.5} />
                 </button>
               )}
               
               <button 
                 type="button"
                 onClick={() => {
                   if (step < 3) handleNext();
                   else handleSubmit();
                 }}
                 disabled={isSubmitting || (step === 1 && !name) || (step === 2 && !phone)}
                 className="w-20 h-20 rounded-full bg-brand-primary text-brand-warm flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-5 disabled:grayscale"
               >
                  {isSubmitting ? (
                    <Sparkles className="animate-spin text-brand-warm" size={24} />
                   ) : (
                    <div className="flex items-center gap-1">
                       <span className="text-[10px] font-black uppercase tracking-tighter ml-1">
                          {step === 3 ? "Enter" : "Next"}
                       </span>
                       <ArrowRight size={18} />
                    </div>
                   )
                  }
               </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
