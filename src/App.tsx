/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { QuickViewModal } from './components/QuickViewModal.tsx';
import { LocationModal } from './components/LocationModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';

// Page Views
import { HomeView } from './views/HomeView.tsx';
import { ProductListingView } from './views/ProductListingView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { CartView } from './views/CartView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { OrderConfirmationView } from './views/OrderConfirmationView.tsx';
import { OrderTrackingView } from './views/OrderTrackingView.tsx';
import { OrderHistoryView } from './views/OrderHistoryView.tsx';
import { UserProfileView } from './views/UserProfileView.tsx';
import { WishlistView } from './views/WishlistView.tsx';
import { AdminDashboardView } from './views/AdminDashboardView.tsx';
import { StaticPagesView } from './views/StaticPagesView.tsx';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'products':
        return <ProductListingView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-confirmation':
        return <OrderConfirmationView />;
      case 'order-tracking':
        return <OrderTrackingView />;
      case 'order-history':
        return <OrderHistoryView />;
      case 'profile':
        return <UserProfileView />;
      case 'wishlist':
        return <WishlistView />;
      case 'admin':
        return <AdminDashboardView />;
      case 'about':
      case 'contact':
      case 'faq':
      case 'terms':
      case 'privacy':
      case 'refund-policy':
        return <StaticPagesView type={currentView} />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <Header />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer />

      {/* Global Overlays & Modals */}
      <CartDrawer />
      <QuickViewModal />
      <LocationModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
