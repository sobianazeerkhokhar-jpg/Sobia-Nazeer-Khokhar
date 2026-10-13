import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initialCategories,
  initialProducts,
  initialReviews,
  initialCoupons,
  initialOrders,
  initialStoreSettings,
  initialUsers,
} from './src/server/seedData.ts';
import { Product, Category, Review, Coupon, Order, StoreSettings, User, ShippingAddress } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface for database structure
interface Database {
  categories: Category[];
  products: Product[];
  reviews: Review[];
  coupons: Coupon[];
  orders: Order[];
  settings: StoreSettings;
  users: (User & { passwordHash?: string })[];
  subscribers: { email: string; date: string }[];
}

// In-memory + persistent JSON DB
function loadDatabase(): Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to parse db.json, recreating with defaults:', err);
    }
  }

  const defaultDb: Database = {
    categories: initialCategories,
    products: initialProducts,
    reviews: initialReviews,
    coupons: initialCoupons,
    orders: initialOrders,
    settings: initialStoreSettings,
    users: [
      {
        ...initialUsers[0],
        passwordHash: 'admin123', // Demo admin password
      },
      {
        ...initialUsers[1],
        passwordHash: 'customer123', // Demo customer password
      },
    ],
    subscribers: [
      { email: 'vip@zariyaluxe.com', date: new Date().toISOString() }
    ],
  };

  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(db: Database) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

let db = loadDatabase();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Log requests in dev
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // Auth Middleware Mock / Token Verification
  const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.includes('admin-token')) {
      return next();
    }
    // Also allow x-admin-role header for easy dev inspection
    if (req.headers['x-user-role'] === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Unauthorized: Admin privileges required' });
  };

  // ==========================================
  // PUBLIC & CUSTOMER API ROUTES
  // ==========================================

  // Store Settings & Homepage Config
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.settings);
  });

  // Categories
  app.get('/api/categories', (req: Request, res: Response) => {
    const activeCategories = db.categories.filter((c) => c.isActive);
    // Attach count of active products
    const categoriesWithCount = activeCategories.map((cat) => ({
      ...cat,
      itemCount: db.products.filter((p) => p.category === cat.slug && p.status === 'active').length,
    }));
    res.json(categoriesWithCount);
  });

  // Products Listing with full filters
  app.get('/api/products', (req: Request, res: Response) => {
    const {
      category,
      collection,
      isAntiTarnish,
      material,
      minPrice,
      maxPrice,
      rating,
      search,
      sort,
      status,
      limit,
      page,
    } = req.query;

    let results = db.products.filter((p) => {
      // By default only return active products for customers
      if (status) {
        if (p.status !== status) return false;
      } else {
        if (p.status !== 'active') return false;
      }

      if (category && category !== 'all') {
        if (p.category.toLowerCase() !== String(category).toLowerCase()) return false;
      }

      if (collection && collection !== 'all') {
        if (p.collection && p.collection.toLowerCase() !== String(collection).toLowerCase()) return false;
      }

      if (isAntiTarnish === 'true') {
        if (!p.isAntiTarnish) return false;
      }

      if (material && material !== 'all') {
        if (!p.material.toLowerCase().includes(String(material).toLowerCase())) return false;
      }

      if (minPrice) {
        const min = Number(minPrice);
        const currentPrice = p.salePrice || p.price;
        if (currentPrice < min) return false;
      }

      if (maxPrice) {
        const max = Number(maxPrice);
        const currentPrice = p.salePrice || p.price;
        if (currentPrice > max) return false;
      }

      if (rating) {
        const minRating = Number(rating);
        if (p.rating < minRating) return false;
      }

      if (search) {
        const q = String(search).toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesMaterial = p.material.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesMaterial && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sort === 'price_asc') {
      results.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sort === 'price_desc') {
      results.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sort === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'bestseller') {
      results.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      // Default: newest
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = results.length;
    const pageNum = Number(page) || 1;
    const pageSize = Number(limit) || 24;
    const startIndex = (pageNum - 1) * pageSize;
    const paginated = results.slice(startIndex, startIndex + pageSize);

    res.json({
      products: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
    });
  });

  // Single Product by slug or id
  app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
    const { slugOrId } = req.params;
    const product = db.products.find(
      (p) => p.slug === slugOrId || p.id === slugOrId
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // Product Reviews
  app.get('/api/reviews', (req: Request, res: Response) => {
    const { productId } = req.query;
    let reviews = db.reviews.filter((r) => r.status === 'approved');
    if (productId) {
      reviews = reviews.filter((r) => r.productId === String(productId));
    }
    res.json(reviews);
  });

  // Post a review
  app.post('/api/reviews', (req: Request, res: Response) => {
    const { productId, customerName, customerEmail, rating, comment } = req.body;
    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const targetProduct = db.products.find((p) => p.id === productId);
    if (!targetProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if customer made a verified purchase
    const hasPurchased = db.orders.some(
      (o) =>
        o.email.toLowerCase() === customerEmail?.toLowerCase() &&
        o.items.some((item) => item.productId === productId)
    );

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      productName: targetProduct.name,
      customerName,
      customerEmail: customerEmail || 'anonymous@zariyaluxe.com',
      rating: Number(rating),
      comment,
      isVerifiedPurchase: hasPurchased,
      status: 'approved', // Auto-approved for frictionless experience
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);

    // Update product rating and count
    const prodReviews = db.reviews.filter((r) => r.productId === productId && r.status === 'approved');
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    targetProduct.rating = Number(avgRating.toFixed(1));
    targetProduct.reviewCount = prodReviews.length;

    saveDatabase(db);
    res.status(201).json(newReview);
  });

  // Validate coupon
  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = db.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or inactive coupon code' });
    }

    if (subtotal && coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount of Rs. ${coupon.minOrderAmount.toLocaleString()} required for this coupon`,
      });
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = Math.round(((subtotal || 0) * coupon.discountValue) / 100);
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    } else {
      calculatedDiscount = coupon.discountValue;
    }

    res.json({
      valid: true,
      coupon,
      discount: calculatedDiscount,
      message: `Coupon applied: Rs. ${calculatedDiscount.toLocaleString()} savings!`,
    });
  });

  // Create Order (Cash on Delivery & Online)
  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      customerId,
      customerName,
      email,
      phone,
      shippingAddress,
      items,
      couponCode,
      paymentMethod,
    } = req.body;

    if (!customerName || !phone || !shippingAddress || !items || !items.length) {
      return res.status(400).json({ error: 'Please provide all required shipping and contact details' });
    }

    // Verify stock and calculate totals
    let subtotal = 0;
    for (const item of items) {
      const prod = db.products.find((p) => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product "${item.name}" no longer exists` });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${prod.name}". Only ${prod.stock} pieces remaining.`,
        });
      }
      const itemPrice = prod.salePrice || prod.price;
      subtotal += itemPrice * item.quantity;
    }

    // Calculate discount
    let discount = 0;
    if (couponCode) {
      const coupon = db.coupons.find(
        (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
      );
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        coupon.usedCount += 1;
      }
    }

    // Calculate shipping
    const shippingFee =
      subtotal >= db.settings.freeShippingThreshold ? 0 : db.settings.flatShippingFee;
    const total = Math.max(0, subtotal - discount + shippingFee);

    // Deduct inventory
    for (const item of items) {
      const prod = db.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock -= item.quantity;
        if (prod.stock <= 0) {
          prod.status = 'out_of_stock';
        }
      }
    }

    const orderNumber = `ZL-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: customerId || undefined,
      customerName,
      email: email || `${phone}@zariyaluxe.com`,
      phone,
      shippingAddress,
      items,
      subtotal,
      discount,
      shippingFee,
      total,
      couponCode: couponCode || undefined,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'confirmed',
      trackingNumber: `ZL-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // Update customer stats if registered
    if (customerId) {
      const user = db.users.find((u) => u.id === customerId);
      if (user) {
        user.orderCount = (user.orderCount || 0) + 1;
        user.totalSpent = (user.totalSpent || 0) + total;
      }
    }

    saveDatabase(db);
    res.status(201).json(newOrder);
  });

  // Track / View Order by OrderNumber or ID
  app.get('/api/orders/:idOrNumber', (req: Request, res: Response) => {
    const { idOrNumber } = req.params;
    const query = idOrNumber.trim().toUpperCase();
    const order = db.orders.find(
      (o) => o.id === idOrNumber || o.orderNumber.toUpperCase() === query
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please verify your order number.' });
    }
    res.json(order);
  });

  // Customer order history
  app.get('/api/orders', (req: Request, res: Response) => {
    const { email, customerId } = req.query;
    if (!email && !customerId) {
      return res.status(400).json({ error: 'Customer identifier required' });
    }

    const filtered = db.orders.filter(
      (o) =>
        (email && o.email.toLowerCase() === String(email).toLowerCase()) ||
        (customerId && o.customerId === customerId)
    );
    res.json(filtered);
  });

  // Newsletter subscribe
  app.post('/api/newsletter', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    const exists = db.subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      db.subscribers.push({ email, date: new Date().toISOString() });
      saveDatabase(db);
    }
    res.json({ success: true, message: 'Welcome to the ZARIYA LUXE inner circle! Check your inbox for a special welcome gift.' });
  });

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // Customer Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const newUser: User & { passwordHash?: string } = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      phone: phone || '',
      role: 'customer',
      passwordHash: password, // In production hashed with bcrypt
      createdAt: new Date().toISOString(),
      orderCount: 0,
      totalSpent: 0,
      addresses: [],
    };

    db.users.push(newUser);
    saveDatabase(db);

    const { passwordHash, ...userClean } = newUser;
    res.status(201).json({
      user: userClean,
      token: `cust-token-${newUser.id}`,
    });
  });

  // Customer Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email?.trim().toLowerCase() && u.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { passwordHash, ...userClean } = user;
    res.json({
      user: userClean,
      token: user.role === 'admin' ? `admin-token-${user.id}` : `cust-token-${user.id}`,
    });
  });

  // Admin Login
  app.post('/api/auth/admin-login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = db.users.find(
      (u) =>
        u.email.toLowerCase() === email?.trim().toLowerCase() &&
        u.role === 'admin' &&
        u.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid administrative credentials' });
    }

    const { passwordHash, ...userClean } = user;
    res.json({
      user: userClean,
      token: `admin-token-${user.id}`,
    });
  });

  // Update Profile
  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const { id, name, phone, addresses, newPassword } = req.body;
    const user = db.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;
    if (newPassword) user.passwordHash = newPassword;

    saveDatabase(db);
    const { passwordHash, ...userClean } = user;
    res.json(userClean);
  });

  // ==========================================
  // ADMIN DASHBOARD ROUTES
  // ==========================================

  // Overview stats & metrics
  app.get('/api/admin/overview', authenticateAdmin, (req: Request, res: Response) => {
    const totalSales = db.orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const todayDate = new Date().toISOString().split('T')[0];
    const todaySales = db.orders
      .filter((o) => o.createdAt.startsWith(todayDate) && o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = db.orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'confirmed').length;
    const deliveredOrders = db.orders.filter((o) => o.orderStatus === 'delivered').length;
    const cancelledOrders = db.orders.filter((o) => o.orderStatus === 'cancelled').length;
    const lowStockProducts = db.products.filter((p) => p.stock <= 5);

    // Sales by category
    const salesByCategory: { [key: string]: number } = {};
    for (const order of db.orders) {
      if (order.orderStatus === 'cancelled') continue;
      for (const item of order.items) {
        const prod = db.products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'other';
        salesByCategory[cat] = (salesByCategory[cat] || 0) + item.price * item.quantity;
      }
    }

    res.json({
      totalSales,
      todaySales,
      totalOrders: db.orders.length,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers: db.users.filter((u) => u.role === 'customer').length,
      totalProducts: db.products.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders: db.orders.slice(0, 8),
      salesByCategory,
    });
  });

  // Admin Products Management
  app.get('/api/admin/products', authenticateAdmin, (req: Request, res: Response) => {
    res.json(db.products);
  });

  app.post('/api/admin/products', authenticateAdmin, (req: Request, res: Response) => {
    const prodData = req.body;
    const slug = (prodData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      rating: prodData.rating || 5.0,
      reviewCount: prodData.reviewCount || 0,
      createdAt: new Date().toISOString(),
      status: prodData.status || 'active',
    };

    db.products.unshift(newProduct);
    saveDatabase(db);
    res.status(201).json(newProduct);
  });

  app.put('/api/admin/products/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.products[index] = {
      ...db.products[index],
      ...req.body,
    };

    saveDatabase(db);
    res.json(db.products[index]);
  });

  app.delete('/api/admin/products/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: 'Product deleted successfully' });
  });

  app.post('/api/admin/products/:id/duplicate', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const original = db.products.find((p) => p.id === id);
    if (!original) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const duplicated: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
      sku: `${original.sku}-CPY`,
      stock: 10,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(duplicated);
    saveDatabase(db);
    res.status(201).json(duplicated);
  });

  // Admin Inventory update
  app.put('/api/admin/inventory/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { stock } = req.body;
    const prod = db.products.find((p) => p.id === id);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    prod.stock = Number(stock);
    if (prod.stock <= 0) {
      prod.status = 'out_of_stock';
    } else if (prod.status === 'out_of_stock') {
      prod.status = 'active';
    }

    saveDatabase(db);
    res.json(prod);
  });

  // Admin Orders Management
  app.get('/api/admin/orders', authenticateAdmin, (req: Request, res: Response) => {
    const { status, search } = req.query;
    let list = db.orders;

    if (status && status !== 'all') {
      list = list.filter((o) => o.orderStatus === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.email.toLowerCase().includes(q)
      );
    }

    res.json(list);
  });

  app.put('/api/admin/orders/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { orderStatus, paymentStatus, trackingNumber, internalNotes } = req.body;
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (internalNotes !== undefined) order.internalNotes = internalNotes;
    order.updatedAt = new Date().toISOString();

    saveDatabase(db);
    res.json(order);
  });

  // Admin Customers
  app.get('/api/admin/customers', authenticateAdmin, (req: Request, res: Response) => {
    const customers = db.users
      .filter((u) => u.role === 'customer')
      .map(({ passwordHash, ...clean }) => clean);
    res.json(customers);
  });

  // Admin Coupons
  app.get('/api/admin/coupons', authenticateAdmin, (req: Request, res: Response) => {
    res.json(db.coupons);
  });

  app.post('/api/admin/coupons', authenticateAdmin, (req: Request, res: Response) => {
    const newCoupon: Coupon = {
      ...req.body,
      id: `coup-${Date.now()}`,
      code: req.body.code.trim().toUpperCase(),
      usedCount: 0,
      isActive: true,
    };
    db.coupons.unshift(newCoupon);
    saveDatabase(db);
    res.status(201).json(newCoupon);
  });

  app.put('/api/admin/coupons/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.coupons.findIndex((c) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Coupon not found' });
    db.coupons[index] = { ...db.coupons[index], ...req.body };
    saveDatabase(db);
    res.json(db.coupons[index]);
  });

  app.delete('/api/admin/coupons/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.coupons = db.coupons.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Reviews
  app.get('/api/admin/reviews', authenticateAdmin, (req: Request, res: Response) => {
    res.json(db.reviews);
  });

  app.put('/api/admin/reviews/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const rev = db.reviews.find((r) => r.id === id);
    if (!rev) return res.status(404).json({ error: 'Review not found' });
    rev.status = req.body.status;
    saveDatabase(db);
    res.json(rev);
  });

  app.delete('/api/admin/reviews/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.reviews = db.reviews.filter((r) => r.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Categories
  app.post('/api/admin/categories', authenticateAdmin, (req: Request, res: Response) => {
    const newCategory: Category = {
      ...req.body,
      id: `cat-${Date.now()}`,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isActive: true,
    };
    db.categories.push(newCategory);
    saveDatabase(db);
    res.status(201).json(newCategory);
  });

  app.put('/api/admin/categories/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const cat = db.categories.find((c) => c.id === id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    Object.assign(cat, req.body);
    saveDatabase(db);
    res.json(cat);
  });

  // Admin Settings update
  app.put('/api/admin/settings', authenticateAdmin, (req: Request, res: Response) => {
    db.settings = {
      ...db.settings,
      ...req.body,
    };
    saveDatabase(db);
    res.json(db.settings);
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC PROD SERVING
  // ==========================================
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZARIYA LUXE Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
});
