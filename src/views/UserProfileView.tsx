import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Address } from '../types/index.ts';
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Check,
  Building,
  Home,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { user, token, updateProfile, showToast } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Address form fields
  const [addrName, setAddrName] = useState(user?.name || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('Bengaluru');
  const [addrState, setAddrState] = useState('Karnataka');
  const [addrPincode, setAddrPincode] = useState('560038');
  const [addrType, setAddrType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addrInstructions, setAddrInstructions] = useState('');

  const fetchAddresses = () => {
    if (!token) return;
    fetch('/api/addresses', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAddresses(data.addresses || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(name, phone);
    setLoading(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addrName,
          phone: addrPhone,
          street: addrStreet,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          type: addrType,
          instructions: addrInstructions,
          isDefault: addresses.length === 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Address saved successfully');
        setShowAddAddress(false);
        fetchAddresses();
        setAddrStreet('');
      } else {
        showToast(data.error || 'Failed to add address', 'error');
      }
    } catch {
      showToast('Network error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Address removed', 'info');
        fetchAddresses();
      }
    } catch {
      showToast('Failed to delete address', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <UserIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Please Sign In</h3>
        <p className="text-xs text-slate-500">Log in to view and edit your profile and addresses.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Addresses</h1>
        <p className="text-xs text-slate-500">Manage your contact details and default delivery locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Profile Card (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{user.name}</h3>
              <span className="text-xs text-slate-500 block">{user.email}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1 capitalize">
                <ShieldCheck className="w-3 h-3" /> {user.role} Account
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email (Cannot change)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-slate-100 text-xs text-slate-500 p-2.5 rounded-xl border border-slate-200 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-colors"
            >
              {loading ? 'Saving Changes...' : 'Update Profile Info'}
            </button>
          </form>
        </div>

        {/* Saved Addresses (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>Saved Delivery Addresses</span>
            </h3>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddAddress ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* New Address Form */}
          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Add New Delivery Location</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  className="bg-white p-2 rounded-xl border border-slate-200"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="bg-white p-2 rounded-xl border border-slate-200"
                />
              </div>
              <input
                type="text"
                required
                placeholder="House / Flat / Street address"
                value={addrStreet}
                onChange={(e) => setAddrStreet(e.target.value)}
                className="w-full bg-white p-2 rounded-xl border border-slate-200"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="bg-white p-2 rounded-xl border border-slate-200"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="bg-white p-2 rounded-xl border border-slate-200"
                />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Pincode"
                  value={addrPincode}
                  onChange={(e) => setAddrPincode(e.target.value)}
                  className="bg-white p-2 rounded-xl border border-slate-200"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs"
              >
                Save Delivery Address
              </button>
            </form>
          )}

          {/* Address List */}
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No saved addresses. Click "Add New" to save your home or work location.
              </p>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{addr.name}</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{addr.street}</p>
                    <p className="text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-slate-400 mt-1">📞 {addr.phone}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors rounded-lg"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
