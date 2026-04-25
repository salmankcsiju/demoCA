import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isWhatsAppSame, setIsWhatsAppSame] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setWhatsapp(user.whatsapp || '');
      setIsWhatsAppSame(user.whatsapp === user.phone || !user.whatsapp);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Minimal delay for responsiveness
    setTimeout(() => {
      login({
        name,
        phone,
        whatsapp: isWhatsAppSame ? phone : whatsapp
      });
      setIsSaving(false);
      navigate('/', { replace: true }); // Automatically go home after saving profile
    }, 800);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
     return (
        <div className="min-h-screen bg-brand-accent flex items-center justify-center p-6 text-center">
           <div className="space-y-6">
              <h1 className="text-3xl font-serif text-brand-secondary italic tracking-tighter opacity-80">Registry Required</h1>
              <button 
                onClick={() => navigate('/login')} 
                className="text-[10px] font-black uppercase tracking-widest text-brand-primary border-b border-brand-primary/30 pb-1 hover:border-brand-primary transition-all"
              >
                 Enter Registry
              </button>
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-brand-accent flex items-center justify-center p-6 selection:bg-brand-primary/30 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-brand-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-brand-warm/20 backdrop-blur-3xl rounded-[3.5rem] border border-brand-primary/10 overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.3)]">
           
           {/* Member Header */}
           <div className="p-10 pt-14 text-center border-b border-brand-primary/5 space-y-4">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-primary opacity-40 italic block">— Member Registry No. 01 —</span>
              <h1 className="text-3xl font-serif text-brand-secondary italic leading-tight">Welcome back, {name.split(' ')[0]}</h1>
           </div>

           <form onSubmit={handleSave} className="p-10 md:p-14 space-y-12">
              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-primary opacity-30">Personal Identity</span>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Your Name"
                  className="w-full bg-transparent border-b border-brand-primary/10 py-4 text-xl font-serif italic text-brand-secondary outline-none focus:border-brand-primary transition-all placeholder:text-brand-secondary/10" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-primary opacity-30">Point of Contact</span>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+91..."
                  className="w-full bg-transparent border-b border-brand-primary/10 py-4 text-xl font-serif italic text-brand-secondary outline-none focus:border-brand-primary transition-all placeholder:text-brand-secondary/10" 
                  required 
                />
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-primary opacity-30">WhatsApp Preference</span>
                    <button 
                      type="button"
                      onClick={() => setIsWhatsAppSame(!isWhatsAppSame)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isWhatsAppSame ? 'bg-brand-primary border-brand-primary text-brand-warm' : 'border-brand-primary/20'}`}
                    >
                       {isWhatsAppSame && <Check size={10} strokeWidth={4} />}
                    </button>
                 </div>

                 <AnimatePresence>
                    {!isWhatsAppSame && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                        exit={{ opacity: 0, height: 0, filter: 'blur(5px)' }}
                        className="overflow-hidden"
                      >
                         <input 
                           type="tel" 
                           value={whatsapp} 
                           onChange={e => setWhatsapp(e.target.value)} 
                           placeholder="WhatsApp number"
                           className="w-full bg-transparent border-b border-brand-primary/10 py-4 text-xl font-serif italic text-brand-secondary outline-none focus:border-brand-primary transition-all placeholder:text-brand-secondary/10" 
                           required={!isWhatsAppSame}
                         />
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              <div className="pt-8 space-y-6">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-brand-primary text-brand-warm font-black tracking-[0.4em] text-[9px] py-6 rounded-2xl shadow-xl hover:shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-20"
                >
                  {isSaving ? 'SYNCHRONIZING...' : 'SAVE CHANGES'}
                </button>

                <button 
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full text-brand-primary font-black tracking-[0.4em] text-[10px] py-6 rounded-2xl border border-brand-primary/10 hover:bg-brand-primary/5 transition-all uppercase flex items-center justify-center gap-3"
                >
                   <ArrowLeft size={14} strokeWidth={3} />
                   Go to Home
                </button>
              </div>
           </form>

           {/* Logout Section */}
           <div className="p-8 bg-brand-primary/5 flex justify-center border-t border-brand-primary/5">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-secondary/30 hover:text-red-500 transition-colors"
              >
                <LogOut size={12} strokeWidth={1.5} />
                Exit Registry
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
