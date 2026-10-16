import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Product,
  Category,
  Order,
  Review,
  Address,
  Coupon,
  DeliverySlot,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'foodbasket.json');

export interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  addresses: Address[];
  coupons: Coupon[];
  deliverySlots: DeliverySlot[];
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-fruits',
    name: 'Fresh Fruits',
    slug: 'fruits',
    description: 'Crisp, sweet, orchard-picked fruits rich in vitamins and nutrients.',
    icon: 'Apple',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
    itemCount: 8,
  },
  {
    id: 'cat-veggies',
    name: 'Fresh Vegetables',
    slug: 'vegetables',
    description: 'Farm-fresh green veggies, root crops, and herbs harvested daily.',
    icon: 'Carrot',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    itemCount: 9,
  },
  {
    id: 'cat-dairy',
    name: 'Dairy and Eggs',
    slug: 'dairy-eggs',
    description: 'Pure farm milk, rich butter, paneer, and farm-fresh cage-free eggs.',
    icon: 'Milk',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    itemCount: 6,
  },
  {
    id: 'cat-staples',
    name: 'Rice, Atta and Pulses',
    slug: 'rice-atta-pulses',
    description: 'Premium basmati rice, stone-ground whole wheat chakki atta, and wholesome dals.',
    icon: 'Wheat',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    itemCount: 5,
  },
  {
    id: 'cat-bakery',
    name: 'Bakery Products',
    slug: 'bakery',
    description: 'Freshly baked artisanal breads, golden croissants, and savory buns.',
    icon: 'Croissant',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    itemCount: 4,
  },
  {
    id: 'cat-snacks',
    name: 'Snacks and Chocolates',
    slug: 'snacks',
    description: 'Crunchy munchies, roasted dry fruits, and gourmet dark chocolates.',
    icon: 'Cookie',
    image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80',
    itemCount: 5,
  },
  {
    id: 'cat-beverages',
    name: 'Beverages',
    slug: 'beverages',
    description: 'Fresh cold-pressed juices, sparkling beverages, and wellness teas.',
    icon: 'Coffee',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    itemCount: 4,
  },
  {
    id: 'cat-household',
    name: 'Household Essentials',
    slug: 'household',
    description: 'Eco-friendly cleaning agents, paper towels, and home hygiene goods.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    itemCount: 4,
  },
  {
    id: 'cat-organic',
    name: 'Organic Products',
    slug: 'organic',
    description: 'Certified 100% organic produce, honey, and cold-pressed edible oils.',
    icon: 'Leaf',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
    itemCount: 6,
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  // 1. Prompt Specific: Apples ₹120/kg
  {
    id: 'prod-apple-kashmir',
    name: 'Shimla & Kashmiri Royal Apples',
    slug: 'shimla-kashmiri-royal-apples',
    category: 'cat-fruits',
    subcategory: 'Apples & Pears',
    price: 120,
    originalPrice: 150,
    discountPercentage: 20,
    unit: '1 kg',
    stock: 45,
    rating: 4.8,
    reviewCount: 38,
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Hand-picked crisp, juicy apples from orchards of Kashmir and Himachal Pradesh. Sweet, aromatic, and rich in natural dietary fiber.',
    isFeatured: true,
    isDailyDeal: true,
    nutritionalInfo: { calories: '52 kcal per 100g', protein: '0.3g', carbs: '14g', fat: '0.2g' },
    storageInstructions: 'Store in a cool dry place or refrigerate for crispness.',
    shelfLife: '7 days',
    origin: 'Kashmir, India',
  },
  // 2. Prompt Specific: Bananas ₹60/dozen
  {
    id: 'prod-banana-robusta',
    name: 'Fresh Robusta Golden Bananas',
    slug: 'fresh-robusta-golden-bananas',
    category: 'cat-fruits',
    subcategory: 'Tropical Fruits',
    price: 60,
    originalPrice: 75,
    discountPercentage: 20,
    unit: '1 dozen',
    stock: 60,
    rating: 4.7,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Naturally ripened, naturally sweet bananas high in potassium and energy. Perfect for morning breakfast smoothies or immediate snacks.',
    isFeatured: true,
    nutritionalInfo: { calories: '89 kcal per 100g', protein: '1.1g', carbs: '23g', fat: '0.3g' },
    storageInstructions: 'Store at room temperature away from direct sunlight.',
    shelfLife: '4 days',
    origin: 'Tamil Nadu, India',
  },
  // 3. Prompt Specific: Tomatoes ₹40/kg
  {
    id: 'prod-tomato-hybrid',
    name: 'Vine-Ripened Hybrid Red Tomatoes',
    slug: 'vine-ripened-hybrid-red-tomatoes',
    category: 'cat-veggies',
    subcategory: 'Salad Vegetables',
    price: 40,
    originalPrice: 50,
    discountPercentage: 20,
    unit: '1 kg',
    stock: 55,
    rating: 4.6,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Firm, juicy, and vibrant red hybrid tomatoes perfect for curries, fresh salads, and tangy soups. Sourced directly from local farmers.',
    isFeatured: true,
    nutritionalInfo: { calories: '18 kcal per 100g', protein: '0.9g', carbs: '3.9g', fat: '0.2g' },
    storageInstructions: 'Store in a cool, ventilated area.',
    shelfLife: '5 days',
    origin: 'Karnataka, India',
  },
  // 4. Prompt Specific: Potatoes ₹35/kg
  {
    id: 'prod-potato-agra',
    name: 'Agra Fresh Golden Potatoes (Aloo)',
    slug: 'agra-fresh-golden-potatoes',
    category: 'cat-veggies',
    subcategory: 'Root Vegetables',
    price: 35,
    originalPrice: 42,
    discountPercentage: 16,
    unit: '1 kg',
    stock: 80,
    rating: 4.8,
    reviewCount: 51,
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Clean, thin-skinned Agra potatoes with creamy texture, ideal for frying, baking, boiling, and daily Indian curries.',
    isFeatured: false,
    nutritionalInfo: { calories: '77 kcal per 100g', protein: '2g', carbs: '17g', fat: '0.1g' },
    storageInstructions: 'Keep in dark, dry place away from onions.',
    shelfLife: '14 days',
    origin: 'Uttar Pradesh, India',
  },
  // 5. Prompt Specific: Onions ₹45/kg
  {
    id: 'prod-onion-nashik',
    name: 'Nashik Red Quality Onions (Pyaz)',
    slug: 'nashik-red-quality-onions',
    category: 'cat-veggies',
    subcategory: 'Root Vegetables',
    price: 45,
    originalPrice: 55,
    discountPercentage: 18,
    unit: '1 kg',
    stock: 90,
    rating: 4.7,
    reviewCount: 64,
    images: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Pungent, dry, medium-sized Nashik red onions. An indispensable flavor foundation for every authentic culinary dish.',
    isFeatured: true,
    nutritionalInfo: { calories: '40 kcal per 100g', protein: '1.1g', carbs: '9.3g', fat: '0.1g' },
    storageInstructions: 'Store in an open mesh basket in a well-ventilated spot.',
    shelfLife: '15 days',
    origin: 'Maharashtra, India',
  },
  // 6. Prompt Specific: Milk ₹32/500 ml
  {
    id: 'prod-milk-pasteurized',
    name: 'Farm Fresh Toned Milk',
    slug: 'farm-fresh-toned-milk',
    category: 'cat-dairy',
    subcategory: 'Milk & Cream',
    price: 32,
    originalPrice: 35,
    discountPercentage: 9,
    unit: '500 ml',
    stock: 50,
    rating: 4.9,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Pasteurized and homogenized fresh dairy milk fortified with Vitamin A and Vitamin D. Safe, nutrient-dense, and creamy.',
    isFeatured: true,
    nutritionalInfo: { calories: '58 kcal per 100ml', protein: '3.1g', carbs: '4.7g', fat: '3.0g' },
    storageInstructions: 'Keep refrigerated at 4°C or below.',
    shelfLife: '2 days',
    origin: 'Local Dairy Cooperative',
  },
  // 7. Prompt Specific: Eggs ₹90/dozen
  {
    id: 'prod-eggs-farm-dozen',
    name: 'Farm Fresh Brown Free-Range Eggs',
    slug: 'farm-fresh-brown-free-range-eggs',
    category: 'cat-dairy',
    subcategory: 'Eggs',
    price: 90,
    originalPrice: 110,
    discountPercentage: 18,
    unit: '1 dozen',
    stock: 35,
    rating: 4.8,
    reviewCount: 47,
    images: [
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'High-protein, antibiotic-free brown eggs from healthy hens fed a nutrient-balanced vegetarian grain diet.',
    isFeatured: true,
    nutritionalInfo: { calories: '72 kcal per egg', protein: '6.3g', carbs: '0.4g', fat: '4.8g' },
    storageInstructions: 'Refrigerate after purchase.',
    shelfLife: '14 days',
    origin: 'Punjab Farm Network',
  },
  // 8. Prompt Specific: Basmati Rice ₹120/kg
  {
    id: 'prod-rice-basmati-classic',
    name: 'Aged Royal Long Grain Basmati Rice',
    slug: 'aged-royal-long-grain-basmati-rice',
    category: 'cat-staples',
    subcategory: 'Rice & Grains',
    price: 120,
    originalPrice: 160,
    discountPercentage: 25,
    unit: '1 kg',
    stock: 40,
    rating: 4.9,
    reviewCount: 76,
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Aged for 2 years in Himalayan foothills, offering an unforgettable delicate floral aroma and slender fluffy grains that double upon cooking.',
    isFeatured: true,
    nutritionalInfo: { calories: '350 kcal per 100g', protein: '7.9g', carbs: '77g', fat: '0.6g' },
    storageInstructions: 'Store in an airtight container away from moisture.',
    shelfLife: '18 months',
    origin: 'Dehradun, India',
  },
  // 9. Prompt Specific: Whole Wheat Atta ₹55/kg
  {
    id: 'prod-atta-whole-wheat',
    name: 'Chakki Fresh 100% Whole Wheat Atta',
    slug: 'chakki-fresh-100-percent-whole-wheat-atta',
    category: 'cat-staples',
    subcategory: 'Flours & Grains',
    price: 55,
    originalPrice: 70,
    discountPercentage: 21,
    unit: '1 kg',
    stock: 75,
    rating: 4.8,
    reviewCount: 52,
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Traditional slow stone-ground flour from plump golden grains of MP Sharbati wheat. Yields soft, puffed rotis packed with natural bran and fiber.',
    isFeatured: false,
    nutritionalInfo: { calories: '340 kcal per 100g', protein: '12g', carbs: '71g', fat: '1.7g' },
    storageInstructions: 'Store in a cool dry steel or air-tight container.',
    shelfLife: '90 days',
    origin: 'Madhya Pradesh, India',
  },
  // 10. Prompt Specific: Orange Juice ₹100/litre
  {
    id: 'prod-orange-juice-fresh',
    name: 'Pure Cold-Pressed Valencia Orange Juice',
    slug: 'pure-cold-pressed-valencia-orange-juice',
    category: 'cat-beverages',
    subcategory: 'Fruit Juices',
    price: 100,
    originalPrice: 130,
    discountPercentage: 23,
    unit: '1 litre',
    stock: 25,
    rating: 4.7,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
    ],
    description: '100% freshly pressed juice with natural juicy citrus pulp. No added sugar, preservatives, or artificial colors.',
    isFeatured: true,
    isDailyDeal: true,
    nutritionalInfo: { calories: '45 kcal per 100ml', protein: '0.7g', carbs: '10.4g', fat: '0.2g' },
    storageInstructions: 'Keep chilled. Shake well before drinking.',
    shelfLife: '3 days',
    origin: 'Nagpur Orchards',
  },
  // Additional Premium Grocery Products
  {
    id: 'prod-paneer-fresh',
    name: 'Artisan Malai Fresh Paneer (Cottage Cheese)',
    slug: 'artisan-malai-fresh-paneer',
    category: 'cat-dairy',
    subcategory: 'Cheese & Paneer',
    price: 110,
    originalPrice: 130,
    discountPercentage: 15,
    unit: '200 g',
    stock: 30,
    rating: 4.9,
    reviewCount: 44,
    images: [
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Soft, succulent, melt-in-the-mouth paneer made from full cream cow milk. Unmatched freshness for shahi paneer and tikka skewers.',
    isFeatured: false,
    nutritionalInfo: { calories: '290 kcal per 100g', protein: '18g', carbs: '4g', fat: '22g' },
    storageInstructions: 'Submerge in cool water in refrigerator.',
    shelfLife: '5 days',
    origin: 'Vrindavan Dairy',
  },
  {
    id: 'prod-bread-sourdough',
    name: 'Handcrafted Artisanal Sourdough Boule',
    slug: 'handcrafted-artisanal-sourdough-boule',
    category: 'cat-bakery',
    subcategory: 'Artisan Breads',
    price: 140,
    originalPrice: 175,
    discountPercentage: 20,
    unit: '450 g',
    stock: 18,
    rating: 4.9,
    reviewCount: 39,
    images: [
      'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Slow-fermented for 36 hours with wild yeast culture. Features a deep blistered crust and an airy, subtly sour crumb.',
    isFeatured: true,
    nutritionalInfo: { calories: '240 kcal per 100g', protein: '8g', carbs: '48g', fat: '1g' },
    storageInstructions: 'Keep in paper bag or slice and freeze.',
    shelfLife: '3 days',
    origin: 'The Food Basket Bakehouse',
  },
  {
    id: 'prod-spinach-palak',
    name: 'Hydroponic Tender Baby Spinach (Palak)',
    slug: 'hydroponic-tender-baby-spinach',
    category: 'cat-veggies',
    subcategory: 'Leafy Greens',
    price: 35,
    originalPrice: 45,
    discountPercentage: 22,
    unit: '250 g',
    stock: 28,
    rating: 4.7,
    reviewCount: 23,
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Pesticide-free tender spinach leaves, triple-washed and packed ready to toss into green salads or steam for saag.',
    isFeatured: false,
    isOrganic: true,
    nutritionalInfo: { calories: '23 kcal per 100g', protein: '2.9g', carbs: '3.6g', fat: '0.4g' },
    storageInstructions: 'Store refrigerated in breathable container.',
    shelfLife: '4 days',
    origin: 'AgroTech Hydro Farms',
  },
  {
    id: 'prod-strawberries',
    name: 'Mahabaleshwar Sweet Strawberries Box',
    slug: 'mahabaleshwar-sweet-strawberries-box',
    category: 'cat-fruits',
    subcategory: 'Berries',
    price: 150,
    originalPrice: 190,
    discountPercentage: 21,
    unit: '250 g',
    stock: 22,
    rating: 4.8,
    reviewCount: 56,
    images: [
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Bright red, fragrant strawberries plucked from the cool misty hills of Mahabaleshwar. Irresistible snack or dessert topping.',
    isFeatured: true,
    isDailyDeal: true,
    nutritionalInfo: { calories: '32 kcal per 100g', protein: '0.7g', carbs: '7.7g', fat: '0.3g' },
    storageInstructions: 'Refrigerate immediately and wash just before consumption.',
    shelfLife: '3 days',
    origin: 'Mahabaleshwar, India',
  },
  {
    id: 'prod-organic-honey',
    name: 'Raw Himalayan Multi-Flora Wild Honey',
    slug: 'raw-himalayan-multi-flora-wild-honey',
    category: 'cat-organic',
    subcategory: 'Sweeteners',
    price: 280,
    originalPrice: 350,
    discountPercentage: 20,
    unit: '500 g',
    stock: 30,
    rating: 4.9,
    reviewCount: 61,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Unfiltered, unpasteurized natural honey harvested sustainably from high altitude Himalayan flora. Rich in pollens and active enzymes.',
    isFeatured: true,
    isOrganic: true,
    nutritionalInfo: { calories: '304 kcal per 100g', protein: '0.3g', carbs: '82g', fat: '0g' },
    storageInstructions: 'Keep at room temperature. Natural crystallization is proof of purity.',
    shelfLife: '24 months',
    origin: 'Uttarakhand, India',
  },
  {
    id: 'prod-toor-dal',
    name: 'Unpolished Organic Toor Dal (Arhar Dal)',
    slug: 'unpolished-organic-toor-dal',
    category: 'cat-staples',
    subcategory: 'Pulses & Lentils',
    price: 145,
    originalPrice: 175,
    discountPercentage: 17,
    unit: '1 kg',
    stock: 65,
    rating: 4.8,
    reviewCount: 35,
    images: [
      'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Chemical-free, unpolished toor dal retaining its high dietary fiber, protein, and authentic wholesome nutty taste.',
    isFeatured: false,
    isOrganic: true,
    nutritionalInfo: { calories: '343 kcal per 100g', protein: '22g', carbs: '63g', fat: '1.5g' },
    storageInstructions: 'Store in dry pantry jars.',
    shelfLife: '12 months',
    origin: 'Latur, Maharashtra',
  },
  {
    id: 'prod-makhana-roasted',
    name: 'Himalayan Pink Salt Roasted Makhana (Foxnuts)',
    slug: 'himalayan-pink-salt-roasted-makhana',
    category: 'cat-snacks',
    subcategory: 'Healthy Snacks',
    price: 160,
    originalPrice: 200,
    discountPercentage: 20,
    unit: '150 g',
    stock: 40,
    rating: 4.7,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Slow-roasted in pure cow ghee and lightly seasoned with mineral-rich pink Himalayan rock salt. Guilt-free crunchy teatime snack.',
    isFeatured: true,
    nutritionalInfo: { calories: '350 kcal per 100g', protein: '9.7g', carbs: '77g', fat: '0.5g' },
    storageInstructions: 'Reseal bag tightly to maintain crunch.',
    shelfLife: '6 months',
    origin: 'Bihar, India',
  },
  {
    id: 'prod-greek-yogurt',
    name: 'Artisan Greek Yogurt (Blueberry Swirl)',
    slug: 'artisan-greek-yogurt-blueberry-swirl',
    category: 'cat-dairy',
    subcategory: 'Yogurt',
    price: 75,
    originalPrice: 90,
    discountPercentage: 16,
    unit: '150 g',
    stock: 35,
    rating: 4.8,
    reviewCount: 33,
    images: [
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Thick strained Greek yogurt packed with 12g live gut-friendly cultures and real berry fruit compote.',
    isFeatured: false,
    nutritionalInfo: { calories: '120 kcal per 100g', protein: '8g', carbs: '14g', fat: '3g' },
    storageInstructions: 'Refrigerate at 2-5°C.',
    shelfLife: '10 days',
    origin: 'Bangalore Dairy',
  },
  {
    id: 'prod-avocados',
    name: 'Hass Butter Avocados (Ready to Eat)',
    slug: 'hass-butter-avocados-ready-to-eat',
    category: 'cat-fruits',
    subcategory: 'Exotics',
    price: 199,
    originalPrice: 250,
    discountPercentage: 20,
    unit: '2 pcs (approx 400g)',
    stock: 15,
    rating: 4.9,
    reviewCount: 41,
    images: [
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Rich, buttery Hass avocados packed with healthy heart monounsaturated fatty acids. Perfect for morning avocado toast and guacamole.',
    isFeatured: true,
    nutritionalInfo: { calories: '160 kcal per 100g', protein: '2g', carbs: '8.5g', fat: '14.7g' },
    storageInstructions: 'Keep at room temp until ripe, then chill.',
    shelfLife: '4 days',
    origin: 'Kodaikanal, India',
  },
  {
    id: 'prod-dishwash-eco',
    name: 'Eco-Friendly Plant-Based Dishwashing Liquid',
    slug: 'eco-friendly-plant-based-dishwashing-liquid',
    category: 'cat-household',
    subcategory: 'Cleaning & Wash',
    price: 140,
    originalPrice: 175,
    discountPercentage: 20,
    unit: '500 ml',
    stock: 45,
    rating: 4.6,
    reviewCount: 22,
    images: [
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Tough on stubborn oil grease, gentle on your hands. Infused with natural citrus extracts, zero sulfates or artificial foaming toxins.',
    isFeatured: false,
    storageInstructions: 'Store in cool place out of reach of children.',
    shelfLife: '24 months',
    origin: 'Pune, India',
  },
  {
    id: 'prod-cold-pressed-coconut-oil',
    name: 'Extra Virgin Cold Pressed Coconut Oil',
    slug: 'extra-virgin-cold-pressed-coconut-oil',
    category: 'cat-organic',
    subcategory: 'Edible Oils',
    price: 240,
    originalPrice: 299,
    discountPercentage: 20,
    unit: '500 ml',
    stock: 32,
    rating: 4.9,
    reviewCount: 58,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Extracted from fresh coastal Kerala coconuts using traditional wooden expellers without heat. Pure, aromatic, and culinary grade.',
    isFeatured: true,
    isOrganic: true,
    nutritionalInfo: { calories: '862 kcal per 100ml', protein: '0g', carbs: '0g', fat: '100g' },
    storageInstructions: 'Store in ambient temperature.',
    shelfLife: '12 months',
    origin: 'Kerala, India',
  },
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'FRESH10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 200,
    maxDiscount: 100,
    description: '10% OFF on all fresh fruits, veggies, and groceries',
    expiryDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'coup-2',
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 299,
    description: 'Flat ₹50 OFF on your first grocery delivery basket',
    expiryDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'coup-3',
    code: 'SUPER20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 599,
    maxDiscount: 200,
    description: '20% Mega Savings on pantry stocking above ₹599',
    expiryDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'coup-4',
    code: 'FREEDEL',
    discountType: 'fixed',
    discountValue: 40,
    minOrderValue: 199,
    description: 'Free Express delivery on orders over ₹199',
    expiryDate: '2026-12-31',
    isActive: true,
  },
];

const DEFAULT_SLOTS: DeliverySlot[] = [
  { id: 'slot-1', date: 'Today', time: 'Express: 25 - 40 Mins', isAvailable: true },
  { id: 'slot-2', date: 'Today', time: '02:00 PM - 04:00 PM', isAvailable: true },
  { id: 'slot-3', date: 'Today', time: '06:00 PM - 08:30 PM', isAvailable: true },
  { id: 'slot-4', date: 'Tomorrow', time: '07:00 AM - 09:30 AM (Fresh Morning)', isAvailable: true },
  { id: 'slot-5', date: 'Tomorrow', time: '11:00 AM - 01:00 PM', isAvailable: true },
  { id: 'slot-6', date: 'Tomorrow', time: '05:00 PM - 07:30 PM', isAvailable: true },
];

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing db.json, generating fresh seed data...', err);
    }

    // Default Seed Data
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const customerSalt = crypto.randomBytes(16).toString('hex');

    const seed: DatabaseSchema = {
      users: [
        {
          id: 'user-admin-1',
          name: 'Food Basket Admin',
          email: 'admin@foodbasket.com',
          phone: '+91 98765 43210',
          role: 'admin',
          createdAt: new Date().toISOString(),
          salt: adminSalt,
          passwordHash: hashPassword('admin123', adminSalt),
        },
        {
          id: 'user-customer-1',
          name: 'Aarav Sharma',
          email: 'customer@foodbasket.com',
          phone: '+91 91234 56789',
          role: 'customer',
          createdAt: new Date().toISOString(),
          salt: customerSalt,
          passwordHash: hashPassword('password123', customerSalt),
        },
      ],
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      orders: [
        {
          id: 'ord-1001',
          orderNumber: 'FB-98241',
          userId: 'user-customer-1',
          customerName: 'Aarav Sharma',
          customerEmail: 'customer@foodbasket.com',
          customerPhone: '+91 91234 56789',
          items: [
            {
              productId: 'prod-apple-kashmir',
              name: 'Shimla & Kashmiri Royal Apples',
              price: 120,
              unit: '1 kg',
              quantity: 2,
              image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
            },
            {
              productId: 'prod-milk-pasteurized',
              name: 'Farm Fresh Toned Milk',
              price: 32,
              unit: '500 ml',
              quantity: 2,
              image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
            },
            {
              productId: 'prod-eggs-farm-dozen',
              name: 'Farm Fresh Brown Free-Range Eggs',
              price: 90,
              unit: '1 dozen',
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
            },
          ],
          subtotal: 394,
          discount: 50,
          couponCode: 'WELCOME50',
          deliveryFee: 0,
          tax: 17,
          total: 361,
          shippingAddress: {
            id: 'addr-1',
            userId: 'user-customer-1',
            name: 'Aarav Sharma',
            phone: '+91 91234 56789',
            street: 'Flat 402, Green Glen View, 12th Main Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
            isDefault: true,
            type: 'Home',
            instructions: 'Ring doorbell twice and leave with security if unreachable.',
          },
          deliverySlot: {
            id: 'slot-1',
            date: 'Today',
            time: 'Express: 25 - 40 Mins',
            isAvailable: true,
          },
          paymentMethod: 'razorpay',
          paymentStatus: 'completed',
          orderStatus: 'Out for Delivery',
          courierName: 'Ramesh Kumar',
          courierPhone: '+91 98451 22334',
          courierLocation: { lat: 12.9716, lng: 77.5946 },
          estimatedDeliveryTime: 'In 14 minutes',
          timeline: [
            { status: 'Order Placed', time: '10:15 AM', note: 'Order placed and payment verified via Razorpay.', completed: true },
            { status: 'Order Confirmed', time: '10:17 AM', note: 'Store confirmed order and assigned picker.', completed: true },
            { status: 'Preparing Your Basket', time: '10:20 AM', note: 'Fresh fruits and dairy picked from cold storage.', completed: true },
            { status: 'Packed', time: '10:28 AM', note: 'Quality-checked, sealed in eco-friendly paper bag.', completed: true },
            { status: 'Out for Delivery', time: '10:35 AM', note: 'Delivery partner Ramesh Kumar is on the way (Electric Scooter).', completed: true },
            { status: 'Delivered', time: 'Pending', note: 'Handed over at doorstep with verified OTP/signature.', completed: false },
          ],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      reviews: [
        {
          id: 'rev-1',
          productId: 'prod-apple-kashmir',
          userId: 'user-customer-1',
          userName: 'Aarav Sharma',
          rating: 5,
          comment: 'Incredibly crisp and fresh apples! Tasted like they were just plucked from the orchard today. Outstanding packing.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          verifiedPurchase: true,
        },
        {
          id: 'rev-2',
          productId: 'prod-milk-pasteurized',
          userId: 'user-customer-1',
          userName: 'Pooja Reddy',
          rating: 5,
          comment: 'Very fresh and good quality milk. Delivered cold within 30 minutes! Truly loving Food Basket.',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          verifiedPurchase: true,
        },
      ],
      addresses: [
        {
          id: 'addr-1',
          userId: 'user-customer-1',
          name: 'Aarav Sharma',
          phone: '+91 91234 56789',
          street: 'Flat 402, Green Glen View, 12th Main Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          isDefault: true,
          type: 'Home',
          instructions: 'Ring doorbell twice and leave with security if unreachable.',
        },
        {
          id: 'addr-2',
          userId: 'user-customer-1',
          name: 'Aarav Sharma (Office)',
          phone: '+91 91234 56789',
          street: 'Tech Park Tower 3, 5th Floor, Outer Ring Road, Marathahalli',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          isDefault: false,
          type: 'Work',
          instructions: 'Call on arrival for front lobby pickup.',
        },
      ],
      coupons: DEFAULT_COUPONS,
      deliverySlots: DEFAULT_SLOTS,
    };

    this.saveData(seed);
    return seed;
  }

  public saveData(data?: DatabaseSchema) {
    try {
      if (data) this.data = data;
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  public resetToDefault() {
    this.data = this.loadData();
    this.saveData();
    return this.data;
  }

  // Users
  public getUsers() {
    return this.data.users;
  }
  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }
  public getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  public addUser(user: DatabaseSchema['users'][0]) {
    this.data.users.push(user);
    this.saveData();
    return user;
  }
  public updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.saveData();
      return this.data.users[idx];
    }
    return null;
  }

  // Products
  public getProducts() {
    return this.data.products;
  }
  public getProductById(id: string) {
    return this.data.products.find((p) => p.id === id || p.slug === id);
  }
  public addProduct(product: Product) {
    this.data.products.unshift(product);
    this.saveData();
    return product;
  }
  public updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...updates };
      this.saveData();
      return this.data.products[idx];
    }
    return null;
  }
  public deleteProduct(id: string) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      const removed = this.data.products.splice(idx, 1)[0];
      this.saveData();
      return removed;
    }
    return null;
  }

  // Categories
  public getCategories() {
    return this.data.categories;
  }

  // Orders
  public getOrders() {
    return this.data.orders;
  }
  public getOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }
  public getOrdersByUserId(userId: string) {
    return this.data.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  public addOrder(order: Order) {
    this.data.orders.unshift(order);
    this.saveData();
    return order;
  }
  public updateOrder(id: string, updates: Partial<Order>) {
    const idx = this.data.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx !== -1) {
      this.data.orders[idx] = {
        ...this.data.orders[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveData();
      return this.data.orders[idx];
    }
    return null;
  }

  // Reviews
  public getReviewsByProduct(productId: string) {
    return this.data.reviews.filter((r) => r.productId === productId);
  }
  public addReview(review: Review) {
    this.data.reviews.unshift(review);
    // update product rating
    const prodReviews = this.data.reviews.filter((r) => r.productId === review.productId);
    const avg =
      prodReviews.reduce((sum, r) => sum + r.rating, 0) / (prodReviews.length || 1);
    this.updateProduct(review.productId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: prodReviews.length,
    });
    this.saveData();
    return review;
  }

  // Addresses
  public getAddressesByUser(userId: string) {
    return this.data.addresses.filter((a) => a.userId === userId);
  }
  public addAddress(address: Address) {
    if (address.isDefault) {
      this.data.addresses.forEach((a) => {
        if (a.userId === address.userId) a.isDefault = false;
      });
    }
    this.data.addresses.push(address);
    this.saveData();
    return address;
  }
  public deleteAddress(id: string, userId: string) {
    const idx = this.data.addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (idx !== -1) {
      const removed = this.data.addresses.splice(idx, 1)[0];
      this.saveData();
      return removed;
    }
    return null;
  }

  // Coupons
  public getCoupons() {
    return this.data.coupons;
  }
  public getCouponByCode(code: string) {
    return this.data.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
  }
  public addCoupon(coupon: Coupon) {
    this.data.coupons.push(coupon);
    this.saveData();
    return coupon;
  }
  public updateCoupon(id: string, updates: Partial<Coupon>) {
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
      this.saveData();
      return this.data.coupons[idx];
    }
    return null;
  }

  // Delivery Slots
  public getDeliverySlots() {
    return this.data.deliverySlots;
  }
}

export const db = new Database();
