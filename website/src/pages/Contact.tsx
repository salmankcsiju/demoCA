'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Twitter, Send, MessageCircle } from 'lucide-react';

const BASE_URL = 'http://localhost:8000';

export default function Contact() {
  const [config, setConfig] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetch(`${BASE_URL}/api/config/`)
      .then(res => res.json())
      .then(setConfig)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch(`${BASE_URL}/api/inquiries/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'Website Contact Page' })
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111] px-4 sm:px-6 md:px-10 py-20 overflow-x-hidden">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto text-center mb-16 sm:mb-20">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-4"
        >
          Contact
        </motion.p>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic tracking-tight"
        >
          Let’s Start a Conversation
        </motion.h1>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* LEFT SIDE */}
        <div className="space-y-10">

          {[ 
            { icon: Phone, label: "Phone", value: config?.display_phone || '+91 73561 98300' },
            { icon: Mail, label: "Email", value: config?.business_email || 'contact@casaamora.com' },
            { icon: MapPin, label: "Address", value: config?.address || 'Kozhikode, Kerala, India' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 group"
            >
              <div className="p-3 rounded-full border border-gray-200 group-hover:border-black transition">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm sm:text-base">{item.value}</p>
              </div>
            </motion.div>
          ))}

          {/* SOCIAL */}
          <div className="flex gap-4 pt-4">
            {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-full hover:border-black cursor-pointer transition">
                <Icon size={16}/>
              </div>
            ))}
          </div>

          {/* WHATSAPP */}
          <div
            onClick={() => window.open(`https://wa.me/${config?.whatsapp_number || '7356198300'}`, '_blank')}
            className="flex justify-between items-center border border-gray-200 p-5 rounded-xl hover:border-black cursor-pointer transition"
          >
            <span className="text-sm sm:text-base">Chat on WhatsApp</span>
            <MessageCircle size={20}/>
          </div>

        </div>

        {/* FORM */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 md:p-10">

          <h2 className="text-xl sm:text-2xl font-serif italic mb-6">
            Send a Message
          </h2>

          {status === 'success' ? (
            <div className="text-center py-10 space-y-4">
              <Send size={40} className="mx-auto"/>
              <p className="text-sm">Message sent successfully</p>
              <button onClick={() => setStatus('idle')} className="text-sm underline">
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Name"
                  className="border-b border-gray-300 bg-transparent py-3 outline-none text-sm focus:border-black transition"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="border-b border-gray-300 bg-transparent py-3 outline-none text-sm focus:border-black transition"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <input
                required
                placeholder="Phone"
                className="border-b border-gray-300 bg-transparent py-3 outline-none text-sm focus:border-black transition w-full"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />

              <textarea
                required
                placeholder="Your message..."
                className="border-b border-gray-300 bg-transparent py-3 outline-none text-sm focus:border-black transition w-full h-24 resize-none"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              />

              {status === 'error' && (
                <p className="text-red-500 text-xs text-center">
                  Something went wrong. Try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full mt-6 py-3 border border-black text-black hover:bg-black hover:text-white transition text-sm tracking-wide"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}