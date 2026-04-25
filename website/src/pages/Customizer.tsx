import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, ChevronRight, 
  RefreshCcw, ShieldCheck, CheckCircle2, Eye
} from 'lucide-react';
import api from '../utils/api';

const BASE_URL = 'http://localhost:8000';

// Interfaces
interface Part { id: number; name: string; instruction_image: string; order: number; }
interface StandardSize { id: number; name: string; values: { part: number, value: number }[]; }
interface Fabric { id: number; name: string; image: string; hex_code: string; }
interface Option { id: number; name: string; image: string; }

export default function Customizer() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data State
  const [parts, setParts] = useState<Part[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [sizes, setSizes] = useState<StandardSize[]>([]);
  const [sleeves, setSleeves] = useState<Option[]>([]);
  const [necks, setNecks] = useState<Option[]>([]);

  // Selection State
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<number | null>(null);
  const [customFabric, setCustomFabric] = useState("");
  const [measurements, setMeasurements] = useState<Record<number, string>>({});
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedSleeve, setSelectedSleeve] = useState<number | null>(null);
  const [selectedNeck, setSelectedNeck] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partsRes, fabricsRes, sizesRes, sleevesRes, necksRes] = await Promise.all([
          api.get('measurement-parts/'),
          api.get('fabrics/'),
          api.get('standard-sizes/'),
          api.get('sleeve-types/'),
          api.get('neck-designs/')
        ]);
        setParts(partsRes.data);
        setFabrics(fabricsRes.data);
        setSizes(sizesRes.data);
        setSleeves(sleevesRes.data.map((s: any) => ({ ...s, name: s.type_name || s.name })));
        setNecks(necksRes.data.map((n: any) => ({ ...n, name: n.design_name || n.name })));
      } catch (err) {
        console.error("Failed to load customizer data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSizeSelect = (sizeId: number) => {
    setSelectedSize(sizeId);
    const sizeObj = sizes.find(s => s.id === sizeId);
    if (sizeObj) {
      const newMs: Record<number, string> = {};
      sizeObj.values.forEach(v => { newMs[v.part] = v.value.toString(); });
      setMeasurements(newMs);
    }
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleFinalize = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (referenceImage) formData.append('original_photo', referenceImage);
      if (selectedFabric) formData.append('fabric', selectedFabric.toString());
      if (selectedSleeve) formData.append('sleeve_type', selectedSleeve.toString());
      if (selectedNeck) formData.append('neck_design', selectedNeck.toString());
      
      const measurementData = Object.entries(measurements).map(([partId, value]) => ({
        part: parseInt(partId),
        value: parseFloat(value as string)
      }));
      formData.append('measurements', JSON.stringify(measurementData));

      const orderRes = await api.post('custom-orders/', formData);
      setOrderId(orderRes.data.id);
      setShowSuccess(true);
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-brand-accent flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-brand-primary" size={24} />
          <p className="text-[8px] font-black uppercase tracking-widest text-brand-primary/40">Loading Atelier</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-accent pt-12 pb-16 sm:pt-20 sm:pb-24 selection:bg-brand-primary/30">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-brand-primary/80 backdrop-blur-2xl" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-brand-warm p-6 rounded-[2rem] max-w-sm w-full text-center shadow-2xl border border-brand-primary/10">
                <CheckCircle2 size={40} className="text-brand-primary mx-auto mb-4" />
                <h2 className="text-xl font-serif text-brand-secondary mb-2 italic">Order Sent!</h2>
                <p className="text-brand-secondary/40 text-xs mb-6 italic">Registry ID: #CA-{orderId || 'NEW'}</p>
                <button onClick={() => navigate('/profile')} className="w-full btn-accent py-4 rounded-full text-[10px] uppercase font-black tracking-widest">
                   My Orders
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header & Mobile-Optimized Progress */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
           <div className="space-y-2">
              <span className="text-brand-primary font-black tracking-[0.4em] uppercase text-[8px] block italic">Official Registry</span>
              <h1 className="text-2xl sm:text-6xl lg:text-8xl font-serif text-brand-secondary tracking-tighter leading-none italic">
                Custom <span className="text-brand-primary">Creations</span>
              </h1>
           </div>
           
           <div className="flex justify-between items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex flex-col items-center gap-2 min-w-[70px]">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-serif italic text-xs ${step >= s ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'border-brand-primary/10 text-brand-primary/20'}`}>
                    {s}
                  </div>
                   <span className={`text-[7px] font-black uppercase tracking-widest ${step === s ? 'text-brand-primary' : 'text-brand-primary/20'}`}>
                     {['Style', 'Size', 'Review'][s-1]}
                   </span>
                </div>
              ))}
           </div>
        </div>

        {/* Main Customizer Layout */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
           <div className="lg:col-span-8">
              <div className="bg-brand-warm rounded-[1.5rem] sm:rounded-[4rem] p-5 sm:p-12 shadow-2xl border border-brand-primary/5 relative overflow-hidden min-h-[450px] flex flex-col">
                 
                 <div className="absolute top-0 right-0 p-4 text-[50px] font-serif italic text-brand-primary/5 select-none pointer-events-none">
                    0{step}.
                 </div>

                 <div className="flex-1 relative z-10">
                    <AnimatePresence mode="wait">
                       <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                          {step === 1 && (
                            <StepStyle 
                              preview={referencePreview} 
                              setFile={(f: File) => { setReferenceImage(f); setReferencePreview(URL.createObjectURL(f)); }}
                              fabrics={fabrics} selectedFabric={selectedFabric} setSelectedFabric={setSelectedFabric}
                              customFabric={customFabric} setCustomFabric={setCustomFabric}
                              sleeves={sleeves} necks={necks}
                              selectedSleeve={selectedSleeve} setSelectedSleeve={setSelectedSleeve}
                              selectedNeck={selectedNeck} setSelectedNeck={setSelectedNeck}
                            />
                          )}
                          {step === 2 && (
                            <StepSize 
                              parts={parts} sizes={sizes} measurements={measurements} 
                              setMeasurements={setMeasurements} selectedSize={selectedSize} onSizeSelect={handleSizeSelect} 
                            />
                          )}
                          {step === 3 && (
                            <StepReview 
                              summary={{
                                fabric: selectedFabric ? fabrics.find(f => f.id === selectedFabric)?.name : (customFabric || 'None'),
                                sleeve: selectedSleeve ? sleeves.find(s => s.id === selectedSleeve)?.name : 'Standard',
                                neck: selectedNeck ? necks.find(n => n.id === selectedNeck)?.name : 'Standard',
                                size: selectedSize ? sizes.find(s => s.id === selectedSize)?.name : 'Custom'
                              }}
                              referencePreview={referencePreview}
                            />
                          )}
                       </motion.div>
                    </AnimatePresence>
                 </div>

                 {/* Action Bar */}
                 <div className="flex justify-between items-center mt-8 pt-6 border-t border-brand-primary/10 relative z-10">
                    <button 
                      onClick={handleBack}
                      className={`text-[8px] font-black uppercase tracking-widest text-brand-primary/40 ${step === 1 ? 'invisible' : ''}`}
                    >
                       Back
                    </button>
                    
                    <button 
                      onClick={step < 3 ? handleNext : handleFinalize}
                      disabled={isSubmitting}
                      className="btn-accent px-6 py-3 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                       {step < 3 ? 'Next Step' : (isSubmitting ? 'Sending...' : 'Confirm')} 
                       <ChevronRight size={12} />
                    </button>
                 </div>
              </div>
           </div>

           {/* Mobile Sidebar (Summary) */}
           <div className="lg:col-span-4 space-y-4">
              <div className="bg-brand-light rounded-[1.5rem] p-5 text-white shadow-xl space-y-4">
                 <h3 className="text-lg font-serif italic tracking-tighter">Boutique Summary</h3>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary"><Eye size={14}/></div>
                        <div>
                          <span className="text-[7px] uppercase tracking-[0.2em] text-white/40 block">Visual Aid</span>
                          <span className="text-[10px] font-serif italic text-white/80">{referenceImage ? 'Uploaded' : 'No Photo'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary"><ShieldCheck size={14}/></div>
                        <p className="text-[7px] uppercase tracking-[0.2em] text-white/40">Encrypted Atelier Channel</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components optimized for 300px
function StepStyle({ preview, setFile, fabrics, selectedFabric, setSelectedFabric, customFabric, setCustomFabric, sleeves, necks, selectedSleeve, setSelectedSleeve, selectedNeck, setSelectedNeck }: any) {
  return (
    <div className="space-y-6">
       <div className="space-y-1">
          <h2 className="text-lg font-serif text-brand-secondary italic uppercase">1. Style</h2>
          <p className="text-brand-secondary/40 italic text-[10px] leading-relaxed">Choose your vision.</p>
       </div>

       <div className="grid grid-cols-1 gap-6">
          <label className="relative block cursor-pointer">
             <div className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 ${preview ? 'border-transparent' : 'border-brand-primary/20 bg-brand-primary/5'}`}>
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover rounded-xl shadow-lg" />
                ) : (
                  <div className="text-center">
                    <Upload className="text-brand-primary mx-auto mb-2" size={24}/>
                    <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary/40">Upload Reference</span>
                  </div>
                )}
             </div>
             <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
          </label>

          <div className="space-y-3">
             <span className="text-[7px] font-black uppercase tracking-widest text-brand-primary italic">Fabrics</span>
             <div className="grid grid-cols-4 gap-2">
                {fabrics.slice(0, 4).map((f: Fabric) => (
                   <button key={f.id} onClick={() => setSelectedFabric(f.id)} className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedFabric === f.id ? 'border-brand-primary scale-110' : 'border-transparent opacity-50'}`}>
                      <img src={f.image.startsWith('http') ? f.image : `${BASE_URL}${f.image}`} className="w-full h-full object-cover" />
                   </button>
                ))}
             </div>
             <input type="text" value={customFabric} onChange={e => setCustomFabric(e.target.value)} placeholder="Custom Fabric Name..." className="w-full bg-brand-primary/10 border-none rounded-xl p-3 text-xs font-serif italic outline-none mt-2" />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4 border-t border-brand-primary/5 pt-6">
          <div className="space-y-2">
             <span className="text-[7px] font-black uppercase text-brand-primary">Sleeves</span>
             <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {sleeves.map((s: any) => (
                  <button key={s.id} onClick={() => setSelectedSleeve(s.id)} className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 ${selectedSleeve === s.id ? 'border-brand-primary' : 'border-transparent opacity-40'}`}>
                    <img src={s.image ? (s.image.startsWith('http') ? s.image : `${BASE_URL}${s.image}`) : ''} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </div>
          <div className="space-y-2">
             <span className="text-[7px] font-black uppercase text-brand-primary">Neck</span>
             <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {necks.map((n: any) => (
                  <button key={n.id} onClick={() => setSelectedNeck(n.id)} className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 ${selectedNeck === n.id ? 'border-brand-primary' : 'border-transparent opacity-40'}`}>
                    <img src={n.image ? (n.image.startsWith('http') ? n.image : `${BASE_URL}${n.image}`) : ''} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}

function StepSize({ parts, sizes, measurements, setMeasurements, selectedSize, onSizeSelect }: any) {
  const [activeIdx, setActiveIdx] = useState(0);
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-serif text-brand-secondary italic uppercase">2. Size</h2>
      <div className="flex gap-2 flex-wrap">
        {sizes.map((s: any) => (
          <button key={s.id} onClick={() => onSizeSelect(s.id)} className={`px-3 py-2 rounded-full text-[7px] font-black uppercase border transition-all ${selectedSize === s.id ? 'bg-brand-primary text-white' : 'border-brand-primary/10'}`}>
            {s.name}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="aspect-[4/5] bg-brand-primary/5 rounded-2xl overflow-hidden relative">
           <img src={parts[activeIdx]?.instruction_image ? (parts[activeIdx].instruction_image.startsWith('http') ? parts[activeIdx].instruction_image : `${BASE_URL}${parts[activeIdx].instruction_image}`) : ''} className="w-full h-full object-cover grayscale opacity-40" />
           <div className="absolute top-3 left-3 bg-brand-warm p-3 rounded-xl border border-brand-primary/10">
              <h4 className="text-xs font-serif italic text-brand-secondary">{parts[activeIdx]?.name}</h4>
           </div>
        </div>

        <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar pr-1">
          {parts.map((p: any, idx: number) => (
            <div key={p.id} onMouseEnter={() => setActiveIdx(idx)} className={`p-3 rounded-xl border flex justify-between items-center transition-all ${activeIdx === idx ? 'border-brand-primary bg-brand-primary/5' : 'border-transparent'}`}>
              <span className="text-[8px] uppercase font-black">{p.name}</span>
              <input type="number" value={measurements[p.id] || ""} onChange={e => setMeasurements({...measurements, [p.id]: e.target.value})} className="bg-transparent border-b border-brand-primary/20 w-10 text-right text-sm outline-none font-serif italic" placeholder="0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepReview({ summary, referencePreview }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-serif text-brand-secondary italic uppercase">3. Review</h2>
      <div className="grid grid-cols-1 gap-6">
        {referencePreview && (
          <div className="aspect-square rounded-2xl overflow-hidden grayscale">
            <img src={referencePreview} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-3">
          {Object.entries(summary).map(([key, val]: any) => (
            <div key={key} className="border-b border-brand-primary/5 pb-2">
              <span className="text-[7px] font-black uppercase text-brand-primary italic opacity-60 capitalize">{key}</span>
              <p className="text-sm font-serif italic text-brand-secondary">{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}