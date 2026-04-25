import React from 'react';
import { CheckCircle, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManualPaymentInfo: React.FC<{ orderId: string, totalPrice: number }> = ({ orderId, totalPrice }) => {


  return (
    <div className="max-w-2xl mx-auto bg-brand-warm p-8 md:p-12 border border-brand-primary/20 rounded-sm space-y-10 animate-reveal-up">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-primary/10 text-brand-primary mb-2">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-serif text-brand-secondary">Order Received</h2>
        <p className="text-brand-secondary/60 font-light tracking-wide">
          Your customize on your style journey begins here. Please follow the instructions below to complete your payment and move your order to the <span className="italic">In-Stitching</span> phase.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="meta-text text-brand-primary">Next Steps</h3>
          <div className="space-y-4">
            <div className="p-6 bg-brand-accent border border-brand-primary/5 rounded-sm">
              <p className="text-[10px] uppercase tracking-widest text-brand-secondary/40 mb-2 italic">Cash on Delivery</p>
              <p className="text-sm font-serif text-brand-secondary leading-relaxed">
                Your order is being processed for the <span className="text-brand-primary italic">In-Stitching</span> queue. Please have the total amount ready at the time of delivery.
              </p>
            </div>
            
            <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-sm">
              <p className="text-[10px] uppercase tracking-widest text-brand-primary mb-2 italic">Atelier Verification</p>
              <p className="text-[10px] text-brand-secondary/60 leading-relaxed font-light">
                Our concierge will contact you via WhatsApp to confirm the stitching details and delivery schedule. No advance payment is required for COD.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="meta-text text-brand-primary">Summary</h3>
          <div className="space-y-2 border-t border-brand-primary/10 pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-brand-secondary/60">Order ID:</span>
              <span className="text-brand-secondary">#{orderId}</span>
            </div>
            <div className="flex justify-between text-lg font-serif">
              <span className="text-brand-secondary/60">Total Amount:</span>
              <span className="text-brand-primary">€{totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-4 bg-brand-primary/5 border-l-2 border-brand-primary rounded-r-sm">
            <p className="text-[10px] text-brand-secondary/80 italic font-light leading-relaxed">
              * Please share a screenshot of the payment on our WhatsApp along with your Order ID for faster verification.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-brand-primary/10 flex flex-col md:flex-row gap-4">
        <a 
          href={`https://wa.me/917356198300?text=Hi, I just placed order #${orderId} for €${totalPrice.toFixed(2)}. Here is my payment confirmation.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 font-light uppercase tracking-[0.4em] text-[10px] hover:opacity-90 transition-all"
        >
          <Phone size={14} />
          Send Screenshot on WhatsApp
        </a>
        <Link 
          to="/profile" 
          className="flex-1 flex items-center justify-center gap-3 border border-brand-secondary/20 text-brand-secondary py-4 font-light uppercase tracking-[0.4em] text-[10px] hover:bg-brand-accent hover:text-brand-secondary transition-all"
        >
          View Order History
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default ManualPaymentInfo;
