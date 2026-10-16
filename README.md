# Food Basket – Online Grocery Shopping Platform

A modern, full-stack, responsive online grocery shopping application designed for ordering fresh fruits, vegetables, dairy, pulses, flours, bakery items, and household essentials with real-time order tracking and secure payments.

---

## 🌟 Key Features

1. **Homepage & Aisles**
   - Hero banner with promotional guarantees and quick coupon applicator.
   - 10 Grocery Categories: Fresh Fruits, Fresh Vegetables, Dairy & Eggs, Rice, Atta & Pulses, Bakery Products, Snacks & Chocolates, Beverages, Household Essentials, and 100% Certified Organic.
   - Daily deals with real-time countdown timer.
   - Verified customer ratings and customer care helpline.

2. **Smart Product Browsing & Filtering**
   - Instant search with auto-query matching.
   - Category and subcategory filters.
   - Price range slider (₹30 to ₹500).
   - Rating filter (4★ & above, etc.).
   - In-Stock only and 100% Organic only filters.
   - Sorting by: Featured, Price (Low to High, High to Low), Rating, and Discount.
   - Grid and List view switcher.
   - Quick Preview modal without navigating away.

3. **Detailed Product Pages**
   - Multi-angle image zoom gallery.
   - Comprehensive nutritional facts (Calories, Protein, Carbs, Fat) and origin.
   - Storage instructions and guaranteed fresh shelf life.
   - Verified customer reviews with star rating breakdown and review submission.
   - Stock limit validation.

4. **Cart & Wishlist**
   - Slide-over flyout basket and dedicated full cart page.
   - Free delivery threshold meter ("Add ₹X more for FREE Delivery!").
   - Dynamic quantity steppers with real-time inventory ceiling.
   - Coupon management system with 1-click apply for codes like `FRESH10`, `WELCOME50`, `SUPER20`, and `FREEDEL`.

5. **Multi-Step Checkout & Razorpay Integration**
   - **Step 1: Address**: Select saved addresses or add new with city/state/PIN and delivery instructions.
   - **Step 2: Delivery Scheduling**: Choose Express 25-40 min instant delivery or morning/evening slots.
   - **Step 3: Payment**: Razorpay test mode (supporting UPI, Cards, NetBanking) and Cash on Delivery.
   - **Step 4: Review & Confirm**: Server-side price calculation and atomic stock deduction.

6. **Real-Time Order Tracking & Live Map**
   - 6-Stage Lifecycle:
     1. Order Placed
     2. Order Confirmed
     3. Preparing Your Basket
     4. Packed
     5. Out for Delivery
     6. Delivered
   - Simulated interactive courier GPS map with electric scooter in transit.
   - Delivery partner profile (Courier Name, Rating, Direct Call button).
   - One-click "Advance Status (Demo Step)" button to simulate all 6 stages.
   - Printable tax invoice with breakdown of GST and items.

7. **Admin Dashboard**
   - Total Sales, Orders, Customers, and Low-Stock (<15 units) alerts.
   - Product Management: Add, edit, delete grocery products with custom images, units, prices, and stock.
   - Order Management: Change status of any order across stages or issue cancellations.
   - Customer Management: Order frequency and customer lifetime spend statistics.
   - Coupon Management: Create custom percentage or fixed discounts.
   - Demo Data Reset: One-click restore to standard catalog with section 13 seed prices.

---

## 🥦 Section 13 Seed Prices

- **Apples**: ₹120/kg
- **Bananas**: ₹60/dozen
- **Tomatoes**: ₹40/kg
- **Potatoes**: ₹35/kg
- **Onions**: ₹45/kg
- **Milk**: ₹32/500 ml
- **Eggs**: ₹90/dozen
- **Basmati Rice**: ₹120/kg
- **Whole Wheat Atta**: ₹55/kg
- **Orange Juice**: ₹100/litre

---

## 🔑 Demo Credentials

- **Customer Demo Account:**
  - Email: `customer@foodbasket.com`
  - Password: `password123`
  - Name: Aarav Sharma

- **Administrator Demo Account:**
  - Email: `admin@foodbasket.com`
  - Password: `admin123`
  - Name: Food Basket Admin (Full Operations Panel)

*(Instant 1-click login buttons are also provided directly inside the Sign-In modal!)*

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Canvas Confetti
- **Backend:** Node.js, Express.js (mounted via Vite middleware in dev, standalone in prod)
- **Database:** Persistent structured JSON document store with atomic updates (`.data/foodbasket.json`)
- **Authentication:** Standard JWT HMAC-SHA256 with salted PBKDF2 password hashing
- **Payments:** Razorpay Test Mode integration with server signature verification

---

## 🚀 Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm run test

# 3. Start development server (Port 3000)
npm run dev

# 4. Build for production
npm run build
```

---

## 🧪 Testing

The automated test suite tests authentication, JWT crypto, seed product prices, coupon calculations, atomic inventory deductions, and order status transitions:

```bash
npm run test
```
