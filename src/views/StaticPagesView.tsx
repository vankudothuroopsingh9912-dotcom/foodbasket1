import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Send,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface StaticPagesProps {
  type: 'about' | 'contact' | 'faq' | 'terms' | 'privacy' | 'refund-policy';
}

export const StaticPagesView: React.FC<StaticPagesProps> = ({ type }) => {
  const { showToast, navigateTo } = useApp();

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast('Your message has been received! Our support team will call or email you shortly.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ABOUT US */}
      {type === 'about' && (
        <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Story & Mission</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            About Food Basket – Bringing the Farm to Your Kitchen
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Founded with a passion for nutrition and honest sourcing, <strong>Food Basket</strong> connects local certified farmers directly with urban households. By eliminating conventional multi-tier wholesale yards, we guarantee that the Kashmiri apples, fresh vine tomatoes, and creamy farm milk you order arrive at peak natural taste within hours of harvest.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-2xl font-black text-emerald-800 block">50,000+</span>
              <span className="text-xs text-slate-500 font-medium">Happy Daily Shoppers</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-2xl font-black text-emerald-800 block">100%</span>
              <span className="text-xs text-slate-500 font-medium">Cold-Chain Preserved</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-2xl font-black text-emerald-800 block">25 Mins</span>
              <span className="text-xs text-slate-500 font-medium">Average Doorstep ETA</span>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT US */}
      {type === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                Get in Touch
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-2">Customer Care & Support</h1>
              <p className="text-xs text-slate-500 mt-1">
                Have a question regarding an active delivery or product return? We are here 24 hours a day, 7 days a week.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Toll-Free Helpline</span>
                  <span>1800-419-BASKET (24x7)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Email Us</span>
                  <span>support@foodbasket.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Fulfillment Center Hub</span>
                  <span>#4 100ft Road, Indiranagar, Bengaluru, KA 560038</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-4">Send Us a Direct Message</h3>
            {sent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
                🎉 Thank you for reaching out! A Food Basket customer specialist will review your request shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message / Issue Details</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Support Ticket</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FAQS */}
      {type === 'faq' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              Help Center
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">Frequently Asked Questions</h1>
          </div>

          <div className="space-y-4 text-xs leading-relaxed divide-y divide-slate-100">
            <div className="pt-3">
              <h4 className="font-bold text-slate-900 text-sm mb-1">How fast does Food Basket deliver?</h4>
              <p className="text-slate-600">
                In covered postal codes (like Indiranagar, Koramangala, and central Bengaluru), our average dispatch and delivery time is 20 to 35 minutes using local micro-fulfillment centers.
              </p>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-slate-900 text-sm mb-1">How is the freshness of fruits and vegetables verified?</h4>
              <p className="text-slate-600">
                Produce is received daily between 4:00 AM and 6:00 AM directly from audited partner orchards and farms. Our quality sorters discard any blemished items before bagging.
              </p>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-slate-900 text-sm mb-1">What payment methods can I use?</h4>
              <p className="text-slate-600">
                We accept all major methods via Razorpay (UPI, Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard, NetBanking) and also offer Cash on Delivery (COD).
              </p>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Can I cancel or return an item?</h4>
              <p className="text-slate-600">
                Yes! You can cancel orders anytime prior to dispatch in the "Order Tracking" page. If you are unsatisfied with any item upon delivery, our rider will process a no-questions-asked refund on the spot.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REFUND & CANCELLATION POLICY */}
      {type === 'refund-policy' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs leading-relaxed text-slate-600">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Refund & Cancellation Policy</h1>
          <p>
            At Food Basket, customer satisfaction is our top priority. We maintain a flexible, transparent return and cancellation policy for our grocery community.
          </p>
          <h3 className="font-bold text-slate-900 text-sm pt-2">1. Cancellation Terms</h3>
          <p>
            Customers may cancel any order before the items are marked "Packed" or "Out for Delivery". Once cancelled, 100% of the transaction amount will be credited back immediately or refunded within 2-4 business days.
          </p>
          <h3 className="font-bold text-slate-900 text-sm pt-2">2. Doorstep Return Guarantee</h3>
          <p>
            Because perishables require high quality standards, customers are invited to inspect fresh fruits, vegetables, and milk cartons upon handover. Any item not meeting your freshness standards can be rejected immediately with zero penalty.
          </p>
        </div>
      )}

      {/* TERMS & CONDITIONS */}
      {type === 'terms' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs leading-relaxed text-slate-600">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Terms and Conditions of Service</h1>
          <p>
            Welcome to Food Basket. By using our website, ordering produce, and redeeming coupons, you agree to comply with our fair-use terms, privacy standards, and local commerce laws.
          </p>
          <p>
            All listed prices include statutory GST taxes. Promotions and coupons are subject to minimum cart thresholds as specified on promotional banners.
          </p>
        </div>
      )}

      {/* PRIVACY POLICY */}
      {type === 'privacy' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs leading-relaxed text-slate-600">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Privacy & Data Security Policy</h1>
          <p>
            Food Basket respects and protects customer privacy. We collect only necessary details (such as your delivery street address and contact phone number) to fulfill your grocery delivery orders safely.
          </p>
          <p>
            We never store raw credit card numbers or banking passwords on our servers. All financial transactions are securely processed through PCI-DSS certified gateway Razorpay.
          </p>
        </div>
      )}
    </div>
  );
};
