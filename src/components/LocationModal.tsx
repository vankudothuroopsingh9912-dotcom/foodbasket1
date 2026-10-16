import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { MapPin, X, Check, Search, Compass, Clock } from 'lucide-react';

const POPULAR_ZONES = [
  { area: 'Indiranagar 100ft Rd', city: 'Bengaluru', pincode: '560038', time: '20 mins' },
  { area: 'Koramangala 4th Block', city: 'Bengaluru', pincode: '560034', time: '25 mins' },
  { area: 'HSR Layout Sector 2', city: 'Bengaluru', pincode: '560102', time: '25 mins' },
  { area: 'Whitefield ITPL Main Rd', city: 'Bengaluru', pincode: '560066', time: '30 mins' },
  { area: 'Jayanagar 4th Block', city: 'Bengaluru', pincode: '560011', time: '25 mins' },
  { area: 'MG Road / Central', city: 'Bengaluru', pincode: '560001', time: '20 mins' },
];

export const LocationModal: React.FC = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    deliveryLocation,
    updateLocation,
    showToast,
  } = useApp();

  const [pincodeInput, setPincodeInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLocationModalOpen) return null;

  const handleSubmitPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput || pincodeInput.length < 6) {
      showToast('Please enter a valid 6-digit postal code', 'error');
      return;
    }
    setLoading(true);
    await updateLocation(pincodeInput);
    setLoading(false);
  };

  const handleSelectZone = async (zone: (typeof POPULAR_ZONES)[0]) => {
    setLoading(true);
    await updateLocation(zone.pincode);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={() => setIsLocationModalOpen(false)} />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsLocationModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Select Delivery Area</h3>
            <p className="text-xs text-slate-500">Check instant grocery delivery in your neighbourhood</p>
          </div>
        </div>

        {/* Current Selected */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Currently Delivering To
            </span>
            <p className="text-xs font-black text-slate-800">
              {deliveryLocation.area}, {deliveryLocation.city} - {deliveryLocation.pincode}
            </p>
          </div>
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> 25 mins
          </span>
        </div>

        {/* Enter Pincode Form */}
        <form onSubmit={handleSubmitPincode} className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Enter 6-Digit Postal Code (PIN)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 560038"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 text-sm font-semibold text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={loading || pincodeInput.length !== 6}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shrink-0 shadow-md shadow-emerald-700/20"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </form>

        {/* Popular serviceable areas */}
        <div>
          <span className="text-xs font-bold text-slate-500 block mb-2.5">
            Or Choose from Popular Express Delivery Hubs:
          </span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {POPULAR_ZONES.map((zone) => {
              const isSelected = deliveryLocation.pincode === zone.pincode;
              return (
                <button
                  key={zone.pincode}
                  onClick={() => handleSelectZone(zone)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 font-bold text-emerald-950'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{zone.area} ({zone.pincode})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">{zone.time}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
