import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Address, DeliverySlot, PaymentMethod } from '../types/index.ts';
import {
  MapPin,
  Clock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Plus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  Truck,
  Building,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    couponDiscount,
    clearCart,
    navigateTo,
    user,
    token,
    showToast,
    deliveryLocation,
    setActiveOrderId,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Form fields
  const [newName, setNewName] = useState(user ? user.name : '');
  const [newPhone, setNewPhone] = useState(user ? user.phone : '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState(deliveryLocation.city || 'Bengaluru');
  const [newState, setNewState] = useState('Karnataka');
  const [newPincode, setNewPincode] = useState(deliveryLocation.pincode || '560038');
  const [newType, setNewType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newInstructions, setNewInstructions] = useState('');

  // Delivery Slots
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-1');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');

  // Processing & Razorpay Modal State
  const [loading, setLoading] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [pendingRazorpayData, setPendingRazorpayData] = useState<any>(null);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  // Fetch saved addresses and delivery slots
  useEffect(() => {
    if (token) {
      fetch('/api/addresses', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const def = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(def.id);
          } else {
            setShowNewAddressForm(true);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setShowNewAddressForm(true);
    }

    fetch('/api/delivery-slots')
      .then((res) => res.json())
      .then((data) => {
        if (data.slots && data.slots.length > 0) {
          setSlots(data.slots);
          setSelectedSlotId(data.slots[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, [token]);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your basket is currently empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Add fresh items to your basket before proceeding to checkout.
        </p>
        <button
          onClick={() => navigateTo('products')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-full transition-colors"
        >
          Explore Fresh Produce
        </button>
      </div>
    );
  }

  // Cost calculation
  const freeDeliveryThreshold = 299;
  const deliveryFee = cartSubtotal >= freeDeliveryThreshold ? 0 : 30;
  const tax = Math.round((cartSubtotal - couponDiscount) * 0.05);
  const finalTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryFee + tax);

  const getEffectiveAddress = (): Address => {
    if (!showNewAddressForm && selectedAddressId) {
      const found = savedAddresses.find((a) => a.id === selectedAddressId);
      if (found) return found;
    }
    return {
      id: `addr-temp-${Date.now()}`,
      userId: user ? user.id : 'guest',
      name: newName || 'Guest Shopper',
      phone: newPhone || '+91 91234 56789',
      street: newStreet || '12th Main Road, Indiranagar',
      city: newCity,
      state: newState,
      pincode: newPincode,
      isDefault: true,
      type: newType,
      instructions: newInstructions,
    };
  };

  const getEffectiveSlot = (): DeliverySlot => {
    return (
      slots.find((s) => s.id === selectedSlotId) || {
        id: 'slot-default',
        date: 'Today',
        time: 'Express: 25 - 40 Mins',
        isAvailable: true,
      }
    );
  };

  const handleCreateOrder = async () => {
    const shippingAddress = getEffectiveAddress();
    const deliverySlot = getEffectiveSlot();

    if (!shippingAddress.street || !shippingAddress.pincode) {
      showToast('Please provide a complete delivery address', 'error');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: cart,
          couponCode: appliedCoupon?.code,
          shippingAddress,
          deliverySlot,
          paymentMethod,
          customerName: shippingAddress.name,
          customerEmail: user ? user.email : 'shopper@foodbasket.com',
          customerPhone: shippingAddress.phone,
          deliveryInstructions: shippingAddress.instructions,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        showToast(data.error || 'Failed to create order', 'error');
        return;
      }

      if (paymentMethod === 'razorpay' && data.razorpayData) {
        // Open Simulated Razorpay Payment Gateway
        setPendingRazorpayData(data.razorpayData);
        setPendingOrder(data.order);
        setIsRazorpayModalOpen(true);
      } else {
        // Cash on Delivery
        clearCart();
        setActiveOrderId(data.order.id);
        showToast('Order confirmed via Cash on Delivery!');
        navigateTo('order-confirmation', { orderId: data.order.id });
      }
    } catch {
      setLoading(false);
      showToast('Network error while creating order', 'error');
    }
  };

  const handleRazorpayPaymentSuccess = async () => {
    if (!pendingOrder) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pendingOrder.id,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpayOrderId: pendingRazorpayData?.orderId || `rzp_ord_${Date.now()}`,
          razorpaySignature: 'simulated_valid_signature_2026',
        }),
      });
      const data = await res.json();
      setLoading(false);
      setIsRazorpayModalOpen(false);

      if (res.ok) {
        clearCart();
        setActiveOrderId(pendingOrder.id);
        showToast('Payment verified successfully via Razorpay!');
        navigateTo('order-confirmation', { orderId: pendingOrder.id });
      } else {
        showToast(data.error || 'Payment verification failed', 'error');
      }
    } catch {
      setLoading(false);
      showToast('Payment verification error', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Checkout Steps Progress */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />

          {[
            { num: 1, label: 'Delivery Address' },
            { num: 2, label: 'Delivery Slot' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Review & Place' },
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => setStep(s.num as any)}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                  step >= s.num
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'bg-white text-slate-400 border border-slate-300'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5 text-emerald-200" /> : s.num}
              </button>
              <span className={`text-[11px] font-bold mt-1.5 hidden sm:block ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Step Content (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: DELIVERY ADDRESS */}
          {step === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Step 1: Delivery Address</h3>
                  <p className="text-xs text-slate-500">Where should we deliver your fresh grocery basket?</p>
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showNewAddressForm ? 'Use Saved Address' : 'Add New Address'}</span>
                  </button>
                )}
              </div>

              {/* Saved addresses list */}
              {!showNewAddressForm && savedAddresses.length > 0 && (
                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-bold text-xs text-slate-900">{addr.name}</span>
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                            {addr.type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{addr.phone}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 pl-5">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      {addr.instructions && (
                        <p className="text-[11px] text-slate-400 mt-1 pl-5 italic">
                          Note: "{addr.instructions}"
                        </p>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Recipient's Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street Address / Flat / Building No.
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 302, Green Glen View, 12th Main Indiranagar"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ring bell twice, leave with security"
                      value={newInstructions}
                      onChange={(e) => setNewInstructions(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Proceed to Delivery Slot</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: DELIVERY SLOT */}
          {step === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Step 2: Choose Delivery Time Slot</h3>
                <p className="text-xs text-slate-500">Pick an express instant slot or scheduled preferred delivery</p>
              </div>

              <div className="space-y-3">
                {slots.map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedSlotId === s.id
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="slot"
                        checked={selectedSlotId === s.id}
                        onChange={() => setSelectedSlotId(s.id)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          {s.date}
                        </span>
                        <span className="text-xs font-black text-slate-900">{s.time}</span>
                      </div>
                    </div>
                    {s.time.includes('Express') && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Fastest
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>Proceed to Payment Method</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Step 3: Select Payment Method</h3>
                <p className="text-xs text-slate-500">Safe, verified transactions through Razorpay or Cash on Delivery</p>
              </div>

              <div className="space-y-3">
                {/* Razorpay Online */}
                <label
                  className={`flex items-start justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          Razorpay Secure Checkout (UPI, Cards, NetBanking)
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Test Mode Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Instant payment via Google Pay, PhonePe, Paytm UPI, RuPay/Visa/Mastercard, or NetBanking.
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-emerald-700 shrink-0" />
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-start justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Pay cash or scan QR code with delivery partner upon receiving your basket.
                      </p>
                    </div>
                  </div>
                  <Building className="w-5 h-5 text-slate-500 shrink-0" />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>Review Final Order</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PLACE ORDER */}
          {step === 4 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Step 4: Final Review & Confirmation</h3>
                <p className="text-xs text-slate-500">Please verify your delivery address, slot, and payment choice</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Delivering To:</span>
                    <p className="font-bold text-slate-900">{getEffectiveAddress().name}</p>
                    <p className="text-slate-600">{getEffectiveAddress().street}, {getEffectiveAddress().pincode}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-emerald-700 font-bold hover:underline">
                    Edit
                  </button>
                </div>

                <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Delivery Slot:</span>
                    <p className="font-bold text-slate-900">{getEffectiveSlot().date} • {getEffectiveSlot().time}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-emerald-700 font-bold hover:underline">
                    Edit
                  </button>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Payment Method:</span>
                    <p className="font-bold text-slate-900">
                      {paymentMethod === 'razorpay' ? 'Razorpay Secure Payment' : 'Cash on Delivery'}
                    </p>
                  </div>
                  <button onClick={() => setStep(3)} className="text-emerald-700 font-bold hover:underline">
                    Edit
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Processing Order...' : `Confirm & Pay ₹${finalTotal}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Order Summary Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5 sticky top-24">
          <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
            Order Summary ({cart.length} items)
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-50 shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 line-clamp-1">{item.product.name}</h5>
                    <span className="text-[11px] text-slate-500">
                      {item.quantity} × ₹{item.product.price} ({item.product.unit})
                    </span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              {deliveryFee === 0 ? (
                <span className="text-emerald-700 font-bold">FREE</span>
              ) : (
                <span className="font-semibold text-slate-800">₹{deliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span>Taxes (GST 5%)</span>
              <span className="font-semibold text-slate-800">₹{tax}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-slate-900">
              <span>Total Payable</span>
              <span className="text-lg text-emerald-800">₹{finalTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY TEST GATEWAY MODAL */}
      {isRazorpayModalOpen && pendingRazorpayData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl z-10 border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Razorpay Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  R
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Razorpay Checkout</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Test Sandbox Mode</span>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-800">
                ₹{pendingRazorpayData.amount / 100}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-sky-900 space-y-1">
                <p className="font-bold">Test Payment Gateway Simulation</p>
                <p className="text-[11px] text-sky-700">
                  Transaction Order: <code>{pendingRazorpayData.orderId}</code>
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Test Payment Method
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-semibold">
                  <span>Google Pay / PhonePe UPI</span>
                  <span className="text-emerald-600 font-bold">Auto-Approved</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-semibold">
                  <span>Visa / Mastercard / RuPay Test Card</span>
                  <span className="text-slate-500 font-medium">4111 •••• •••• 1111</span>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRazorpayPaymentSuccess}
                  disabled={loading}
                  className="flex-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : `Simulate Successful Payment`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
