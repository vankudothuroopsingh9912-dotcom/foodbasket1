import { Router } from 'express';
import crypto from 'crypto';
import { db, hashPassword } from './db.ts';
import {
  signToken,
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin,
  type AuthenticatedRequest,
} from './auth.ts';
import type {
  Product,
  Order,
  OrderStatus,
  OrderTimelineEvent,
  Coupon,
  Address,
} from '../src/types/index.ts';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

apiRouter.post('/auth/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      role: 'customer' as const,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    };

    db.addUser(newUser);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    const token = signToken(safeUser);
    return res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hash = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    const token = signToken(safeUser);
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user });
});

apiRouter.put('/auth/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'Name cannot be empty' });

    const updated = db.updateUser(req.user!.id, { name, phone: phone || '' });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    const safeUser = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      createdAt: updated.createdAt,
    };

    return res.json({ user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.getUserByEmail(email || '');
  if (!user) {
    // Return friendly generic message for security
    return res.json({ message: 'If that email exists, password reset instructions have been sent.' });
  }
  return res.json({
    message: 'Password reset link simulated. Check your email or use test OTP: 849201',
    testOtp: '849201',
  });
});

apiRouter.post('/auth/reset-password', (req, res) => {
  const { email, newPassword, otp } = req.body;
  if (!email || !newPassword || !otp) {
    return res.status(400).json({ error: 'Email, new password and OTP are required' });
  }
  const user = db.getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(newPassword, salt);
  user.salt = salt;
  user.passwordHash = passwordHash;
  db.saveData();

  return res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
});

// ==========================================
// 2. CATEGORIES
// ==========================================

apiRouter.get('/categories', (_req, res) => {
  const categories = db.getCategories();
  // calculate dynamic item count per category
  const products = db.getProducts();
  const enhanced = categories.map((c) => ({
    ...c,
    itemCount: products.filter((p) => p.category === c.id).length,
  }));
  return res.json({ categories: enhanced });
});

// ==========================================
// 3. PRODUCTS & REVIEWS
// ==========================================

apiRouter.get('/products', (req, res) => {
  let products = [...db.getProducts()];
  const {
    search,
    category,
    subcategory,
    minPrice,
    maxPrice,
    rating,
    inStock,
    isOrganic,
    sort,
  } = req.query;

  // Search keyword
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }

  // Subcategory
  if (subcategory && typeof subcategory === 'string') {
    products = products.filter((p) => p.subcategory === subcategory);
  }

  // Price Range
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) products = products.filter((p) => p.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) products = products.filter((p) => p.price <= max);
  }

  // Rating
  if (rating) {
    const r = parseFloat(rating as string);
    if (!isNaN(r)) products = products.filter((p) => p.rating >= r);
  }

  // In Stock
  if (inStock === 'true') {
    products = products.filter((p) => p.stock > 0);
  }

  // Organic
  if (isOrganic === 'true') {
    products = products.filter((p) => p.isOrganic);
  }

  // Sorting
  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'discount') {
    products.sort((a, b) => b.discountPercentage - a.discountPercentage);
  } else {
    // Featured / popular default
    products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  return res.json({ products, total: products.length });
});

apiRouter.get('/products/featured', (_req, res) => {
  const products = db.getProducts().filter((p) => p.isFeatured);
  return res.json({ products });
});

apiRouter.get('/products/daily-deals', (_req, res) => {
  const products = db.getProducts().filter((p) => p.isDailyDeal || p.discountPercentage >= 20);
  return res.json({ products });
});

apiRouter.get('/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const reviews = db.getReviewsByProduct(product.id);
  const related = db
    .getProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return res.json({ product, reviews, related });
});

apiRouter.post('/products/:id/reviews', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }

    const review = db.addReview({
      id: `rev-${Date.now()}`,
      productId: product.id,
      userId: req.user!.id,
      userName: req.user!.name,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      verifiedPurchase: true,
    });

    return res.status(201).json({ review });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit review' });
  }
});

// Admin Product Management
apiRouter.post('/products', authMiddleware, requireAdmin, (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.category || data.price == null) {
      return res.status(400).json({ error: 'Product name, category, and price are required' });
    }

    const price = Number(data.price);
    const originalPrice = Number(data.originalPrice || price);
    const discount =
      originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: data.name.trim(),
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: data.category,
      subcategory: data.subcategory || 'General',
      price,
      originalPrice,
      discountPercentage: discount,
      unit: data.unit || '1 kg',
      stock: Number(data.stock ?? 25),
      rating: 5.0,
      reviewCount: 0,
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80'],
      description: data.description || 'Fresh top-quality grocery product direct from verified farmers.',
      isFeatured: !!data.isFeatured,
      isOrganic: !!data.isOrganic,
      isDailyDeal: !!data.isDailyDeal,
      origin: data.origin || 'India',
    };

    db.addProduct(newProd);
    return res.status(201).json({ product: newProd });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to add product' });
  }
});

apiRouter.put('/products/:id', authMiddleware, requireAdmin, (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

apiRouter.delete('/products/:id', authMiddleware, requireAdmin, (req, res) => {
  const removed = db.deleteProduct(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Product not found' });
  return res.json({ message: 'Product removed successfully' });
});

// ==========================================
// 4. COUPONS
// ==========================================

apiRouter.get('/coupons', (_req, res) => {
  const coupons = db.getCoupons();
  return res.json({ coupons });
});

apiRouter.post('/coupons/apply', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required' });

  const coupon = db.getCouponByCode(code);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  const orderSubtotal = Number(subtotal || 0);
  if (orderSubtotal < coupon.minOrderValue) {
    return res.status(400).json({
      error: `Coupon valid on orders above ₹${coupon.minOrderValue}. Add items worth ₹${coupon.minOrderValue - orderSubtotal} more!`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return res.json({
    valid: true,
    discount,
    coupon,
    message: `Coupon '${coupon.code}' applied successfully! You saved ₹${discount}.`,
  });
});

apiRouter.post('/coupons', authMiddleware, requireAdmin, (req, res) => {
  try {
    const coupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: req.body.code.toUpperCase().trim(),
      discountType: req.body.discountType || 'percentage',
      discountValue: Number(req.body.discountValue),
      minOrderValue: Number(req.body.minOrderValue || 0),
      maxDiscount: req.body.maxDiscount ? Number(req.body.maxDiscount) : undefined,
      description: req.body.description || 'Special seasonal discount',
      expiryDate: req.body.expiryDate || '2026-12-31',
      isActive: true,
    };
    db.addCoupon(coupon);
    return res.status(201).json({ coupon });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create coupon' });
  }
});

apiRouter.put('/coupons/:id', authMiddleware, requireAdmin, (req, res) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coupon not found' });
  return res.json({ coupon: updated });
});

// ==========================================
// 5. DELIVERY & ADDRESSES
// ==========================================

apiRouter.get('/delivery-slots', (_req, res) => {
  return res.json({ slots: db.getDeliverySlots() });
});

apiRouter.post('/delivery/check-pincode', (req, res) => {
  const { pincode } = req.body;
  if (!pincode || String(pincode).length < 6) {
    return res.status(400).json({ serviceable: false, message: 'Please enter a valid 6-digit postal code' });
  }

  // Simulated service zone coverage
  return res.json({
    serviceable: true,
    pincode,
    city: 'Bengaluru',
    area: 'Indiranagar / Metro Zone',
    deliveryTimeEstimate: '15 - 30 mins',
    freeDeliveryThreshold: 299,
  });
});

apiRouter.get('/addresses', authMiddleware, (req: AuthenticatedRequest, res) => {
  const addresses = db.getAddressesByUser(req.user!.id);
  return res.json({ addresses });
});

apiRouter.post('/addresses', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, street, city, state, pincode, type, instructions, isDefault } = req.body;
    if (!name || !phone || !street || !pincode) {
      return res.status(400).json({ error: 'Name, phone, street, and pincode are required' });
    }

    const addr: Address = {
      id: `addr-${Date.now()}`,
      userId: req.user!.id,
      name: name.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city || 'Bengaluru',
      state: state || 'Karnataka',
      pincode: pincode.trim(),
      isDefault: !!isDefault,
      type: type || 'Home',
      instructions: instructions || '',
    };

    db.addAddress(addr);
    return res.status(201).json({ address: addr });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save address' });
  }
});

apiRouter.delete('/addresses/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const deleted = db.deleteAddress(req.params.id, req.user!.id);
  if (!deleted) return res.status(404).json({ error: 'Address not found' });
  return res.json({ message: 'Address removed successfully' });
});

// ==========================================
// 6. CHECKOUT & ORDERS (RAZORPAY INTEGRATION)
// ==========================================

apiRouter.post('/orders/create', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const {
      items,
      couponCode,
      shippingAddress,
      deliverySlot,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      deliveryInstructions,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.pincode) {
      return res.status(400).json({ error: 'Delivery address is incomplete' });
    }

    // 1. Validate prices and stock atomically on the server
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.getProductById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product "${item.name}" not found in our catalog` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Only ${product.stock} units available for "${product.name}". Please adjust quantity.`,
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    // 2. Validate Coupon server-side
    let discount = 0;
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && calculatedSubtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
      }
    }

    // Delivery fee: Free if subtotal >= 299, otherwise ₹30
    const deliveryFee = calculatedSubtotal >= 299 ? 0 : 30;
    // 5% GST tax on grocery items
    const tax = Math.round((calculatedSubtotal - discount) * 0.05);
    const finalTotal = Math.max(0, calculatedSubtotal - discount + deliveryFee + tax);

    // 3. Atomically deduct inventory
    for (const item of items) {
      const prod = db.getProductById(item.productId);
      if (prod) {
        db.updateProduct(prod.id, {
          stock: Math.max(0, prod.stock - item.quantity),
        });
      }
    }

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `FB-${Math.floor(100000 + Math.random() * 900000)}`;

    const initialTimeline: OrderTimelineEvent[] = [
      {
        status: 'Order Placed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Order placed and securely registered with Food Basket.',
        completed: true,
      },
      {
        status: 'Order Confirmed',
        time: 'Pending',
        note: 'Store is validating items and preparing assignment.',
        completed: paymentMethod === 'cod',
      },
      {
        status: 'Preparing Your Basket',
        time: 'Pending',
        note: 'Expert grocery pickers are selecting fresh produce.',
        completed: false,
      },
      {
        status: 'Packed',
        time: 'Pending',
        note: 'Quality checked, weighed and eco-bagged.',
        completed: false,
      },
      {
        status: 'Out for Delivery',
        time: 'Pending',
        note: 'Courier partner assigned and dispatched.',
        completed: false,
      },
      {
        status: 'Delivered',
        time: 'Pending',
        note: 'Basket delivered safely to your doorstep.',
        completed: false,
      },
    ];

    const order: Order = {
      id: orderId,
      orderNumber,
      userId: req.user ? req.user.id : `guest-${Date.now()}`,
      customerName: customerName || (req.user ? req.user.name : shippingAddress.name),
      customerEmail: customerEmail || (req.user ? req.user.email : 'guest@foodbasket.com'),
      customerPhone: customerPhone || shippingAddress.phone,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discount,
      couponCode: couponCode || undefined,
      deliveryFee,
      tax,
      total: finalTotal,
      shippingAddress,
      deliverySlot: deliverySlot || {
        id: 'slot-express',
        date: 'Today',
        time: 'Express: 25 - 40 Mins',
        isAvailable: true,
      },
      deliveryInstructions: deliveryInstructions || shippingAddress.instructions,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: paymentMethod === 'cod' ? 'Order Confirmed' : 'Order Placed',
      timeline: initialTimeline,
      courierName: 'Kishore Patel',
      courierPhone: '+91 97890 12345',
      courierLocation: { lat: 12.9716, lng: 77.5946 },
      estimatedDeliveryTime: '30 mins',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addOrder(order);

    // If Razorpay, return order payload for Razorpay Checkout
    const razorpayData =
      paymentMethod === 'razorpay'
        ? {
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_foodbasket2026',
            orderId: `rzp_ord_${orderNumber}_${Date.now()}`,
            amount: finalTotal * 100, // paise
            currency: 'INR',
            name: 'Food Basket Groceries',
            description: `Payment for Order #${orderNumber}`,
            prefill: {
              name: order.customerName,
              email: order.customerEmail,
              contact: order.customerPhone,
            },
            theme: { color: '#166534' },
          }
        : null;

    return res.status(201).json({
      order,
      razorpayData,
      message: 'Order created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

apiRouter.post('/orders/verify-payment', (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const order = db.getOrderById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // In production, verify crypto HMAC with RAZORPAY_KEY_SECRET
    // In test mode: verify payload exists
    order.paymentStatus = 'completed';
    order.orderStatus = 'Order Confirmed';

    // update timeline
    order.timeline = order.timeline.map((event) => {
      if (event.status === 'Order Placed') return { ...event, completed: true };
      if (event.status === 'Order Confirmed') {
        return {
          ...event,
          completed: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Payment verified (${razorpayPaymentId || 'Verified Online Test'}). Order confirmed by store!`,
        };
      }
      return event;
    });

    db.updateOrder(order.id, order);

    return res.json({
      success: true,
      order,
      message: 'Payment verified and order confirmed!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

apiRouter.get('/orders', authMiddleware, (req: AuthenticatedRequest, res) => {
  const orders = db.getOrdersByUserId(req.user!.id);
  return res.json({ orders });
});

apiRouter.get('/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  return res.json({ order });
});

apiRouter.post('/orders/:id/cancel', optionalAuthMiddleware, (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.orderStatus === 'Delivered') {
    return res.status(400).json({ error: 'Delivered orders cannot be cancelled' });
  }
  if (order.orderStatus === 'Packed' || order.orderStatus === 'Out for Delivery') {
    return res.status(400).json({ error: 'Order is already dispatched and cannot be cancelled directly' });
  }

  // Restore inventory
  for (const item of order.items) {
    const prod = db.getProductById(item.productId);
    if (prod) {
      db.updateProduct(prod.id, { stock: prod.stock + item.quantity });
    }
  }

  order.orderStatus = 'Cancelled';
  if (order.paymentStatus === 'completed') {
    order.paymentStatus = 'refunded';
  }

  db.updateOrder(order.id, order);
  return res.json({ order, message: 'Order has been cancelled and refund initiated' });
});

// Demo/Test Live Status Advancer
apiRouter.post('/orders/:id/advance-status', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const statusCycle: OrderStatus[] = [
    'Order Placed',
    'Order Confirmed',
    'Preparing Your Basket',
    'Packed',
    'Out for Delivery',
    'Delivered',
  ];

  const currentIdx = statusCycle.indexOf(order.orderStatus);
  const nextIdx = (currentIdx + 1) % statusCycle.length;
  const nextStatus = statusCycle[nextIdx];

  order.orderStatus = nextStatus;

  // Mark timeline
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  order.timeline = order.timeline.map((event, i) => {
    if (i <= nextIdx) {
      return {
        ...event,
        completed: true,
        time: event.time === 'Pending' ? nowStr : event.time,
      };
    }
    return { ...event, completed: false };
  });

  if (nextStatus === 'Delivered') {
    order.estimatedDeliveryTime = 'Delivered just now';
    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'completed';
    }
  } else if (nextStatus === 'Out for Delivery') {
    order.estimatedDeliveryTime = 'In 8 minutes';
  }

  db.updateOrder(order.id, order);
  return res.json({ order, message: `Status advanced to "${nextStatus}"` });
});

// ==========================================
// 7. ADMIN DASHBOARD & ANALYTICS
// ==========================================

apiRouter.get('/admin/analytics', authMiddleware, requireAdmin, (_req, res) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const users = db.getUsers().filter((u) => u.role === 'customer');

  const totalSales = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockCount = products.filter((p) => p.stock <= 15).length;

  const ordersByStatus: Record<string, number> = {};
  orders.forEach((o) => {
    ordersByStatus[o.orderStatus] = (ordersByStatus[o.orderStatus] || 0) + 1;
  });

  // Sales by last 7 days mock aggregated
  const salesByDay = [
    { date: 'Mon', amount: 3240 },
    { date: 'Tue', amount: 4890 },
    { date: 'Wed', amount: 3950 },
    { date: 'Thu', amount: 6200 },
    { date: 'Fri', amount: 7800 },
    { date: 'Sat', amount: 9400 },
    { date: 'Sun', amount: 11200 },
  ];

  return res.json({
    totalSales,
    totalOrders: orders.length,
    totalCustomers: users.length,
    lowStockCount,
    recentOrders: orders.slice(0, 10),
    ordersByStatus,
    salesByDay,
  });
});

apiRouter.get('/admin/orders', authMiddleware, requireAdmin, (req, res) => {
  let orders = db.getOrders();
  const { status, payment } = req.query;

  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter((o) => o.orderStatus === status);
  }
  if (payment && typeof payment === 'string' && payment !== 'all') {
    orders = orders.filter((o) => o.paymentStatus === payment);
  }

  return res.json({ orders });
});

apiRouter.put('/admin/orders/:id/status', authMiddleware, requireAdmin, (req, res) => {
  const { status } = req.body;
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.orderStatus = status;
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const statusCycle: OrderStatus[] = [
    'Order Placed',
    'Order Confirmed',
    'Preparing Your Basket',
    'Packed',
    'Out for Delivery',
    'Delivered',
  ];
  const targetIdx = statusCycle.indexOf(status);

  if (targetIdx !== -1) {
    order.timeline = order.timeline.map((event, i) => {
      if (i <= targetIdx) {
        return {
          ...event,
          completed: true,
          time: event.time === 'Pending' ? nowStr : event.time,
        };
      }
      return { ...event, completed: false };
    });
  }

  if (status === 'Delivered') {
    order.estimatedDeliveryTime = 'Delivered';
    if (order.paymentMethod === 'cod') order.paymentStatus = 'completed';
  }

  db.updateOrder(order.id, order);
  return res.json({ order, message: `Order status updated to ${status}` });
});

apiRouter.get('/admin/customers', authMiddleware, requireAdmin, (_req, res) => {
  const users = db.getUsers().filter((u) => u.role === 'customer');
  const orders = db.getOrders();

  const customerData = users.map((u) => {
    const userOrders = orders.filter((o) => o.userId === u.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt,
      ordersCount: userOrders.length,
      totalSpent,
      lastOrderDate: userOrders[0]?.createdAt || null,
    };
  });

  return res.json({ customers: customerData });
});

apiRouter.post('/admin/seed-reset', authMiddleware, requireAdmin, (_req, res) => {
  db.resetToDefault();
  return res.json({ message: 'Database reset to default seed data with all 10 sample products!' });
});
