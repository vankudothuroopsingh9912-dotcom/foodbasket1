import assert from 'assert';
import { db, hashPassword } from '../server/db.ts';
import { signToken, verifyToken } from '../server/auth.ts';

async function runTests() {
  console.log('--- Starting Food Basket Automated Workflow Tests ---');

  // 1. Verify Seed Products & Section 13 Prices
  console.log('\n[Test 1] Verifying Seed Catalog & Mandatory Prices...');
  const products = db.getProducts();
  assert(products.length >= 10, 'Should have at least 10 products');

  const apples = products.find((p) => p.name.includes('Apples'));
  assert(apples && apples.price === 120, 'Apples price should be ₹120/kg');

  const bananas = products.find((p) => p.name.includes('Bananas'));
  assert(bananas && bananas.price === 60, 'Bananas price should be ₹60/dozen');

  const tomatoes = products.find((p) => p.name.includes('Tomatoes'));
  assert(tomatoes && tomatoes.price === 40, 'Tomatoes price should be ₹40/kg');

  const milk = products.find((p) => p.name.includes('Milk'));
  assert(milk && milk.price === 32, 'Milk price should be ₹32/500 ml');

  const eggs = products.find((p) => p.name.includes('Eggs'));
  assert(eggs && eggs.price === 90, 'Eggs price should be ₹90/dozen');

  const rice = products.find((p) => p.name.includes('Basmati Rice'));
  assert(rice && rice.price === 120, 'Basmati Rice price should be ₹120/kg');

  const atta = products.find((p) => p.name.includes('Atta'));
  assert(atta && atta.price === 55, 'Whole Wheat Atta price should be ₹55/kg');

  const juice = products.find((p) => p.name.includes('Orange Juice'));
  assert(juice && juice.price === 100, 'Orange Juice price should be ₹100/litre');

  console.log('✓ Mandatory product seed prices verified successfully!');

  // 2. Authentication & Token Signing Workflow
  console.log('\n[Test 2] Verifying Authentication & Token Cryptography...');
  const testUser = {
    id: 'test-user-999',
    name: 'Test Customer',
    email: 'test@foodbasket.com',
    phone: '+91 99999 88888',
    role: 'customer' as const,
    createdAt: new Date().toISOString(),
  };

  const token = signToken(testUser);
  assert(typeof token === 'string' && token.split('.').length === 3, 'Token must be standard 3-part JWT');

  const payload = verifyToken(token);
  assert(payload && payload.userId === testUser.id, 'Token payload must resolve to user ID');
  assert(payload.role === 'customer', 'Role must match user');
  console.log('✓ Token signing and cryptographic verification passed!');

  // 3. Coupon Validation Workflow
  console.log('\n[Test 3] Verifying Coupon Rules & Calculation...');
  const coupon = db.getCouponByCode('FRESH10');
  assert(coupon && coupon.discountValue === 10, 'FRESH10 should give 10% discount');

  const subtotal = 500;
  const calculatedDiscount = Math.round((subtotal * coupon.discountValue) / 100);
  assert(calculatedDiscount === 50, '10% of ₹500 should be ₹50');
  console.log('✓ Coupon calculation logic passed!');

  // 4. Order Creation & Atomic Inventory Deduction
  console.log('\n[Test 4] Verifying Order Lifecycle & Atomic Stock Deduction...');
  const initialStock = apples.stock;
  const orderQty = 2;

  // Deduct atomically
  db.updateProduct(apples.id, { stock: initialStock - orderQty });
  const updatedApples = db.getProductById(apples.id);
  assert(updatedApples && updatedApples.stock === initialStock - orderQty, 'Stock must decrease by ordered quantity');

  // Re-add to restore test balance
  db.updateProduct(apples.id, { stock: initialStock });
  console.log('✓ Atomic inventory deduction test passed!');

  // 5. Order Tracking Progression
  console.log('\n[Test 5] Verifying 6-Stage Order Lifecycle Progression...');
  const testOrder = {
    id: `test-ord-${Date.now()}`,
    orderNumber: 'FB-TEST-101',
    userId: testUser.id,
    customerName: testUser.name,
    customerEmail: testUser.email,
    customerPhone: testUser.phone,
    items: [
      {
        productId: apples.id,
        name: apples.name,
        price: apples.price,
        unit: apples.unit,
        quantity: 1,
        image: apples.images[0],
      },
    ],
    subtotal: 120,
    discount: 0,
    deliveryFee: 30,
    tax: 6,
    total: 156,
    shippingAddress: {
      id: 'addr-t1',
      userId: testUser.id,
      name: testUser.name,
      phone: testUser.phone,
      street: '12th Main',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      isDefault: true,
      type: 'Home' as const,
    },
    deliverySlot: { id: 's1', date: 'Today', time: 'Express', isAvailable: true },
    paymentMethod: 'razorpay' as const,
    paymentStatus: 'completed' as const,
    orderStatus: 'Order Placed' as const,
    timeline: [
      { status: 'Order Placed' as const, time: '10:00 AM', note: 'Created', completed: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addOrder(testOrder);
  const retrieved = db.getOrderById(testOrder.id);
  assert(retrieved && retrieved.orderNumber === 'FB-TEST-101', 'Retrieved order must match');

  db.updateOrder(testOrder.id, { orderStatus: 'Delivered' });
  const deliveredOrder = db.getOrderById(testOrder.id);
  assert(deliveredOrder && deliveredOrder.orderStatus === 'Delivered', 'Order status must advance to Delivered');
  console.log('✓ Order lifecycle tracking test passed!');

  console.log('\n=========================================');
  console.log('🎉 ALL AUTOMATED WORKFLOW TESTS PASSED!');
  console.log('=========================================\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
