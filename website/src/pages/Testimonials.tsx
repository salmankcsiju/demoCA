'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Plus, X, 
  CheckCircle2
} from 'lucide-react';

import api from '../utils/api';

const BASE_URL = 'http://localhost:8000';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text_review: string;
  photo: string | null;
  created_at: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    api.get('testimonials/')
      .then(res => setTestimonials(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('rating', rating.toString());
    formData.append('text_review', text);
    if (photo) formData.append('photo', photo);

    try {
      const res = await api.post('testimonials/', formData);
      if (res.status === 201) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setShowSuccess(false);
          setRating(5);
          setText('');
          setPhoto(null);
          setPhotoPreview(null);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-accent pb-12 overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-[40vh] sm:h-[45vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-brand-light">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=2000" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-brand-light/20 via-brand-light to-brand-secondary" />

        <div className="relative z-10 text-center px-4 max-w-4xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-[6rem] font-serif italic">
              Client <span className="text-brand-primary">Diaries</span>
            </h1>

            <p className="text-sm sm:text-base md:text-xl mt-4 text-brand-secondary/70">
              Discover stories from our community.
            </p>
          </motion.div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-accent px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base rounded-full flex items-center gap-2 mx-auto"
          >
            <Plus size={16}/> Share
          </button>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[300px] bg-gray-200 rounded-xl animate-pulse"/>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

            {testimonials.map((t) => (
              <div key={t.id} className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col">

                {t.photo && (
                  <div className="aspect-[3/4] sm:aspect-[4/5] mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={t.photo.startsWith('http') ? t.photo : `${BASE_URL}${t.photo}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-sm sm:text-base italic mb-4 line-clamp-4">
                  "{t.text_review}"
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="font-semibold text-sm">{t.name}</span>
                  <span className="text-xs">{t.rating}⭐</span>
                </div>
              </div>
            ))}

          </div>
        )}
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div 
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowModal(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg p-4 sm:p-6"
            >

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3"
              >
                <X size={20}/>
              </button>

              {showSuccess ? (
                <div className="text-center py-10">
                  <CheckCircle2 size={50} className="mx-auto text-green-500"/>
                  <p className="mt-4">Submitted successfully</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Rating */}
                  <div className="flex gap-2 justify-center">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" onClick={() => setRating(star)}>
                        <Star size={24} fill={rating>=star ? '#facc15':'none'}/>
                      </button>
                    ))}
                  </div>

                  {/* Text */}
                  <textarea
                    required
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                    placeholder="Write your experience..."
                    className="w-full border rounded-lg p-3 text-sm h-28"
                  />

                  {/* Upload */}
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} className="rounded-lg"/>
                      <button onClick={()=>{setPhoto(null);setPhotoPreview(null);}} className="absolute top-2 right-2">
                        <X/>
                      </button>
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={handlePhotoChange}/>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-3 rounded-lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}