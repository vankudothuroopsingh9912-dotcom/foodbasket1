import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type {
  AdminAnalytics,
  Order,
  Product,
  Category,
  Coupon,
  OrderStatus,
} from '../types/index.ts';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  X,
  Printer,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { user, token, navigateTo, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'coupons'>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'cat-fruits',
    subcategory: '',
    price: 100,
    originalPrice: 120,
    unit: '1 kg',
    stock: 50,
    image: '',
    description: '',
    isFeatured: false,
    isOrganic: false,
    isDailyDeal: false,
  });

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as const,
    discountValue: 15,
    minOrderValue: 299,
    maxDiscount: 100,
    description: '',
  });

  const loadAllAdminData = () => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/admin/customers', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/coupons').then((r) => r.json()),
    ])
      .then(([analyticsData, prodData, ordersData, custData, coupData]) => {
        setAnalytics(analyticsData);
        setProducts(prodData.products || []);
        setOrders(ordersData.orders || []);
        setCustomers(custData.customers || []);
        setCoupons(coupData.coupons || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAllAdminData();
  }, [token]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Admin Access Required</h3>
        <p className="text-xs text-slate-500 mb-6">
          You need an administrator account to view the Food Basket operations dashboard.
        </p>
        <button
          onClick={() => navigateTo('home')}
          className="bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-full"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prodForm),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        setShowProductModal(false);
        setEditingProduct(null);
        loadAllAdminData();
      } else {
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch {
      showToast('Network error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Product deleted', 'info');
        loadAllAdminData();
      }
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Order status updated to ${status}`);
        loadAllAdminData();
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(couponForm),
      });
      if (res.ok) {
        showToast('Coupon created successfully');
        setShowCouponModal(false);
        loadAllAdminData();
      }
    } catch {
      showToast('Failed to create coupon', 'error');
    }
  };

  const handleResetSeedData = async () => {
    if (!window.confirm('Reset database to default seed catalog (Apples, Milk, Atta, etc.)?')) return;
    try {
      const res = await fetch('/api/admin/seed-reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      showToast(data.message, 'success');
      loadAllAdminData();
    } catch {
      showToast('Failed to reset seed data', 'error');
    }
  };

  const filteredOrders =
    orderStatusFilter === 'all'
      ? orders
      : orders.filter((o) => o.orderStatus === orderStatusFilter);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">Food Basket Operations</h1>
              <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Live Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">Inventory, dispatch fulfillment, coupons & revenue</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSeedData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset database to fresh sample products & orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
          >
            Go to Storefront
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 gap-3 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Metrics', icon: TrendingUp },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === t.id
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Total Revenue
              </span>
              <div className="text-2xl font-black text-slate-900">
                ₹{analytics ? analytics.totalSales.toLocaleString() : 0}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                +18.4% from last week
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Total Orders
              </span>
              <div className="text-2xl font-black text-slate-900">
                {analytics ? analytics.totalOrders : 0}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                Across all fulfillment hubs
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Active Shoppers
              </span>
              <div className="text-2xl font-black text-slate-900">
                {analytics ? analytics.totalCustomers : 0}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                Registered customer accounts
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Low Stock Alerts
              </span>
              <div className="text-2xl font-black text-amber-600">
                {analytics ? analytics.lowStockCount : 0}
              </div>
              <span className="text-[11px] text-amber-700 font-bold mt-1 block">
                Stock &lt; 15 units remaining
              </span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="font-black text-slate-900 text-base mb-4">Latest Incoming Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-left font-bold uppercase">
                    <th className="py-2.5">Order</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Items</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.slice(0, 6).map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="py-3">{ord.customerName}</td>
                      <td className="py-3">{ord.items.length} items</td>
                      <td className="py-3 font-black text-slate-900">₹{ord.total}</td>
                      <td className="py-3">
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigateTo('order-tracking', { id: ord.id })}
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          View Live
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search products by title..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-white text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setProdForm({
                  name: '',
                  category: 'cat-fruits',
                  subcategory: 'Fresh',
                  price: 80,
                  originalPrice: 100,
                  unit: '1 kg',
                  stock: 50,
                  image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
                  description: 'Fresh farm harvest',
                  isFeatured: false,
                  isOrganic: false,
                  isDailyDeal: false,
                });
                setShowProductModal(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left font-bold">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Badges</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-50"
                      />
                      <span className="font-bold text-slate-900">{p.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.unit}</td>
                    <td className="py-3 px-4 font-black text-slate-900">₹{p.price}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          p.stock <= 10
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 text-[9px] font-bold">
                        {p.isOrganic && <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Organic</span>}
                        {p.isFeatured && <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Featured</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setProdForm({
                            name: p.name,
                            category: p.category,
                            subcategory: p.subcategory || '',
                            price: p.price,
                            originalPrice: p.originalPrice,
                            unit: p.unit,
                            stock: p.stock,
                            image: p.images[0],
                            description: p.description,
                            isFeatured: !!p.isFeatured,
                            isOrganic: !!p.isOrganic,
                            isDailyDeal: !!p.isDailyDeal,
                          });
                          setShowProductModal(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 rounded hover:bg-slate-100"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Filter by Stage:</span>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Order Confirmed">Order Confirmed</option>
              <option value="Preparing Your Basket">Preparing Your Basket</option>
              <option value="Packed">Packed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left font-bold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4 text-right">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold">{ord.customerName}</span>
                        <p className="text-[10px] text-slate-400">{ord.shippingAddress.city} • {ord.shippingAddress.pincode}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold capitalize">{ord.paymentMethod} ({ord.paymentStatus})</td>
                    <td className="py-3 px-4 font-black text-slate-900">₹{ord.total}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                        className="bg-slate-100 text-slate-800 font-bold text-xs rounded-lg px-2 py-1 border border-slate-200"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Order Confirmed">Order Confirmed</option>
                        <option value="Preparing Your Basket">Preparing Your Basket</option>
                        <option value="Packed">Packed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left font-bold">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4">{c.email} • {c.phone || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-bold">{c.ordersCount} orders</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-800">₹{c.totalSpent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCouponModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coupons.map((coup) => (
              <div key={coup.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {coup.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Min ₹{coup.minOrderValue}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{coup.description}</h4>
                <p className="text-[11px] text-slate-500">
                  Value: {coup.discountValue}{coup.discountType === 'percentage' ? '%' : '₹'} discount
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD/EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                  >
                    <option value="cat-fruits">Fresh Fruits</option>
                    <option value="cat-veggies">Fresh Vegetables</option>
                    <option value="cat-dairy">Dairy & Eggs</option>
                    <option value="cat-staples">Rice, Atta & Pulses</option>
                    <option value="cat-bakery">Bakery</option>
                    <option value="cat-snacks">Snacks</option>
                    <option value="cat-beverages">Beverages</option>
                    <option value="cat-household">Household</option>
                    <option value="cat-organic">Organic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit (e.g. 1 kg, 500 ml)</label>
                  <input
                    type="text"
                    required
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={prodForm.originalPrice}
                    onChange={(e) => setProdForm({ ...prodForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={prodForm.image}
                  onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                  className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={prodForm.isOrganic}
                    onChange={(e) => setProdForm({ ...prodForm, isOrganic: e.target.checked })}
                  />
                  <span>Organic</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-4">Create Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  value={couponForm.minOrderValue}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                  className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. 25% off weekend special"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
