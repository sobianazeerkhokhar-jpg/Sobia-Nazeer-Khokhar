import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Tag,
  MessageSquare,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Save,
  ShieldCheck,
  TrendingUp,
  Truck,
  Eye,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Product, Order, Category, Coupon, Review, User, StoreSettings, OrderStatus, PaymentStatus } from '../types.ts';
import { InvoiceModal } from '../components/InvoiceModal.tsx';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { adminUser, loginAdmin, logoutAdmin, showToast, settings: publicSettings, refreshSettings, refreshProducts, refreshCategories } = useStore();

  // Admin Login state
  const [adminEmail, setAdminEmail] = useState('admin@zariyaluxe.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [currentTab, setCurrentTab] = useState<
    'overview' | 'products' | 'inventory' | 'orders' | 'customers' | 'coupons' | 'reviews' | 'categories' | 'settings'
  >('overview');

  // Data states
  const [overviewData, setOverviewData] = useState<any>(null);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>([]);
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [adminCustomers, setAdminCustomers] = useState<User[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreSettings | null>(publicSettings);

  // Selected Order for viewing / editing
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Product Add / Edit Modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Coupon Modal
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Inventory inline edits
  const [inventoryStockDrafts, setInventoryStockDrafts] = useState<{ [id: string]: number }>({});

  const adminToken = localStorage.getItem('zl_admin_token') || 'admin-token-admin-1';

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
    'x-user-role': 'admin',
  };

  // Check login & load initial admin data
  useEffect(() => {
    if (adminUser) {
      loadOverview();
      loadProducts();
      loadOrders();
      loadCategories();
      loadCoupons();
      loadReviews();
      loadCustomers();
      loadSettings();
    }
  }, [adminUser]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        loginAdmin(data.user, data.token);
      } else {
        setLoginError(data.error || 'Invalid admin credentials');
      }
    } catch {
      setLoginError('Server error during admin authentication');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview', { headers: authHeaders });
      if (res.ok) setOverviewData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products', { headers: authHeaders });
      if (res.ok) {
        const prods = await res.json();
        setAdminProducts(prods);
        const drafts: { [id: string]: number } = {};
        prods.forEach((p: Product) => (drafts[p.id] = p.stock));
        setInventoryStockDrafts(drafts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', { headers: authHeaders });
      if (res.ok) setAdminOrders(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setAdminCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons', { headers: authHeaders });
      if (res.ok) setAdminCoupons(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews', { headers: authHeaders });
      if (res.ok) setAdminReviews(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers', { headers: authHeaders });
      if (res.ok) setAdminCustomers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) setStoreConfig(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // If not logged in as Admin, show Admin Login view
  if (!adminUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8C6D46]">
              Store Administration
            </span>
            <h1 className="font-serif text-2xl text-stone-900 font-medium">Admin Portal Login</h1>
            <p className="text-xs text-stone-500">Secure management panel for orders, products, and inventory.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Enter Admin Panel'}
            </button>
          </form>

          <div className="p-3 bg-[#FAF8F5] rounded border border-stone-200 text-center text-xs text-stone-600">
            <p className="font-semibold text-stone-800">Preloaded Demo Credentials:</p>
            <p className="font-mono text-[11px] mt-0.5">admin@zariyaluxe.com / admin123</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle Product Save (Add / Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    try {
      const isEdit = Boolean(editingProduct.id);
      const url = isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...editingProduct,
        images: editingProduct.images?.length
          ? editingProduct.images
          : ['/src/assets/images/hero_jewelry_campaign_1791811748777.jpg'],
        tags: editingProduct.tags || ['jewelry'],
      };

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(isEdit ? 'Product updated successfully' : 'Product created successfully');
        setIsProductModalOpen(false);
        setEditingProduct(null);
        loadProducts();
        loadOverview();
        refreshProducts();
      }
    } catch {
      showToast('Error saving product');
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (res.ok) {
        showToast('Product cloned as draft');
        loadProducts();
        refreshProducts();
      }
    } catch {
      showToast('Error duplicating product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        showToast('Product removed from catalog');
        loadProducts();
        loadOverview();
        refreshProducts();
      }
    } catch {
      showToast('Error deleting product');
    }
  };

  // Update Inventory Stock
  const handleSaveInventoryStock = async (id: string) => {
    const newStock = inventoryStockDrafts[id];
    if (newStock === undefined) return;
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        showToast('Inventory updated');
        loadProducts();
        loadOverview();
        refreshProducts();
      }
    } catch {
      showToast('Error updating inventory');
    }
  };

  // Update Order
  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`Order status updated to ${updated.orderStatus}`);
        loadOrders();
        loadOverview();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
      }
    } catch {
      showToast('Error updating order');
    }
  };

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeConfig) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(storeConfig),
      });
      if (res.ok) {
        showToast('Store settings saved successfully');
        refreshSettings();
      }
    } catch {
      showToast('Error saving settings');
    }
  };

  // Reviews moderation
  const handleReviewStatus = async (id: string, status: 'approved' | 'hidden') => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Review ${status}`);
        loadReviews();
      }
    } catch {
      showToast('Error updating review');
    }
  };

  // Filtered orders
  const filteredOrders = adminOrders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.phone.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      {/* Top Admin Header */}
      <header className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl tracking-wider text-white uppercase font-bold">
            {storeConfig?.storeName || 'ZARIYA LUXE'}
          </span>
          <span className="bg-stone-800 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-stone-700">
            Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-stone-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View Public Store</span>
          </button>
          <span className="text-stone-700">|</span>
          <button
            onClick={logoutAdmin}
            className="text-xs text-stone-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 overflow-x-auto gap-2 pb-2 mb-8">
          {[
            { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
            { id: 'products', label: `Products (${adminProducts.length})`, icon: Package },
            { id: 'inventory', label: 'Inventory & Alerts', icon: AlertTriangle },
            { id: 'orders', label: `Orders (${adminOrders.length})`, icon: ShoppingCart },
            { id: 'customers', label: `Customers (${adminCustomers.length})`, icon: Users },
            { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
            { id: 'reviews', label: 'Reviews Moderation', icon: MessageSquare },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'settings', label: 'Store & Homepage Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  currentTab === tab.id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {currentTab === 'overview' && overviewData && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-1 shadow-sm">
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Total Revenue</span>
                <p className="text-2xl font-serif font-bold text-stone-950 tabular-nums">
                  Rs. {overviewData.totalSales.toLocaleString()}
                </p>
                <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  All confirmed orders
                </span>
              </div>

              <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-1 shadow-sm">
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Today's Sales</span>
                <p className="text-2xl font-serif font-bold text-stone-950 tabular-nums">
                  Rs. {overviewData.todaySales.toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-500">Live 24h volume</span>
              </div>

              <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-1 shadow-sm">
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Total Orders</span>
                <p className="text-2xl font-serif font-bold text-stone-950 tabular-nums">
                  {overviewData.totalOrders}
                </p>
                <span className="text-[11px] text-amber-700 font-medium">
                  {overviewData.pendingOrders} pending fulfillment
                </span>
              </div>

              <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-1 shadow-sm">
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Low Stock Items</span>
                <p className="text-2xl font-serif font-bold text-amber-700 tabular-nums">
                  {overviewData.lowStockCount}
                </p>
                <span className="text-[11px] text-stone-500">Threshold ≤ 5 pcs</span>
              </div>
            </div>

            {/* Recent Orders table */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-stone-900 font-medium">Recent Customer Orders</h3>
                <button
                  onClick={() => setCurrentTab('orders')}
                  className="text-xs text-[#8C6D46] hover:underline font-semibold"
                >
                  Manage All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] text-stone-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {overviewData.recentOrders?.map((ord: Order) => (
                      <tr key={ord.id} className="hover:bg-stone-50/50">
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-stone-900">{ord.customerName}</p>
                          <p className="text-[11px] text-stone-400">{ord.phone}</p>
                        </td>
                        <td className="py-3 px-3 text-stone-600">{ord.shippingAddress.city}</td>
                        <td className="py-3 px-3 font-semibold tabular-nums text-stone-900">
                          Rs. {ord.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 uppercase text-[11px]">
                          <span className="font-semibold">{ord.paymentMethod}</span> ({ord.paymentStatus})
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold capitalize bg-stone-100 text-stone-800">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setCurrentTab('orders');
                            }}
                            className="text-xs text-[#8C6D46] hover:underline font-medium"
                          >
                            Details
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
        {currentTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-stone-900 font-medium">Catalog Management</h2>
                <p className="text-xs text-stone-500">Create, edit, duplicate, and manage jewelry designs.</p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    category: 'earrings',
                    price: 2000,
                    salePrice: 1600,
                    stock: 20,
                    material: '316L Stainless Steel / 18K Gold PVD',
                    color: 'Warm Gold',
                    size: 'Standard',
                    isAntiTarnish: true,
                    description: '',
                    careInstructions: 'Waterproof and non-tarnishing. Wipe with dry cloth.',
                    specifications: { Plating: '18K Gold Vacuum PVD' },
                    images: ['/src/assets/images/hero_jewelry_campaign_1791811748777.jpg'],
                    status: 'active',
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add New Design</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] text-stone-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Image</th>
                      <th className="py-3 px-4">Design Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (PKR)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Anti-Tarnish</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {adminProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="py-3 px-4">
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-12 h-12 object-cover rounded border border-stone-200"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-900">{p.name}</p>
                          <p className="text-[11px] text-stone-400 font-mono">SKU: {p.sku}</p>
                        </td>
                        <td className="py-3 px-4 uppercase text-[11px] text-stone-600 font-medium">
                          {p.category}
                        </td>
                        <td className="py-3 px-4 tabular-nums">
                          <span className="font-bold text-stone-900">
                            Rs. {(p.salePrice || p.price).toLocaleString()}
                          </span>
                          {p.salePrice && (
                            <span className="block text-[10px] text-stone-400 line-through">
                              Rs. {p.price.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 tabular-nums font-semibold">
                          <span className={p.stock <= 5 ? 'text-amber-700' : 'text-stone-900'}>
                            {p.stock} pcs
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.isAntiTarnish ? (
                            <span className="text-emerald-800 font-semibold text-[11px] flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Yes
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[11px]">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] uppercase font-semibold bg-stone-100 text-stone-700">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-stone-600 hover:text-stone-950 rounded hover:bg-stone-100"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(p.id)}
                              className="p-1.5 text-stone-600 hover:text-stone-950 rounded hover:bg-stone-100"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-stone-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY MANAGEMENT */}
        {currentTab === 'inventory' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 font-medium">Inventory & Stock Control</h2>
              <p className="text-xs text-stone-500">
                Update stock levels in real time. Products with stock 0 are automatically marked out of stock.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] text-stone-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Status Alert</th>
                      <th className="py-3 px-4">Update Quantity</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {adminProducts.map((p) => {
                      const draft = inventoryStockDrafts[p.id] ?? p.stock;
                      return (
                        <tr key={p.id} className="hover:bg-stone-50/50">
                          <td className="py-3 px-4 font-semibold text-stone-900">{p.name}</td>
                          <td className="py-3 px-4 font-mono text-stone-400">{p.sku}</td>
                          <td className="py-3 px-4 font-bold tabular-nums text-stone-900">
                            {p.stock} units
                          </td>
                          <td className="py-3 px-4">
                            {p.stock === 0 ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                                Out of Stock
                              </span>
                            ) : p.stock <= 5 ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                                Low Stock Alert
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800">
                                Healthy Stock
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              value={draft}
                              onChange={(e) =>
                                setInventoryStockDrafts({
                                  ...inventoryStockDrafts,
                                  [p.id]: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-24 bg-stone-50 border border-stone-300 rounded px-2.5 py-1 text-xs tabular-nums text-stone-900 focus:outline-none focus:border-stone-900"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleSaveInventoryStock(p.id)}
                              className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-semibold"
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDER MANAGEMENT */}
        {currentTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-stone-900 font-medium">Customer Orders</h2>
                <p className="text-xs text-stone-500">Manage fulfillment, courier tracking, and payment verification.</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search by name, #, or phone..."
                  className="bg-white border border-stone-200 rounded px-3 py-1.5 text-xs focus:outline-none"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-white border border-stone-200 rounded px-3 py-1.5 text-xs font-medium cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] text-stone-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Tracking ID</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                        <td className="py-3 px-4 text-stone-500 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-900">{ord.customerName}</p>
                          <p className="text-[11px] text-stone-400">{ord.phone}</p>
                        </td>
                        <td className="py-3 px-4 tabular-nums font-bold text-stone-950">
                          Rs. {ord.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 uppercase text-[11px]">
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) =>
                              handleUpdateOrder(ord.id, { paymentStatus: e.target.value as PaymentStatus })
                            }
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-0.5 text-[11px] font-semibold"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            defaultValue={ord.trackingNumber || ''}
                            onBlur={(e) => handleUpdateOrder(ord.id, { trackingNumber: e.target.value })}
                            placeholder="Add Tracking ID"
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-0.5 text-[11px] font-mono w-28 focus:outline-none focus:border-stone-900"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) =>
                              handleUpdateOrder(ord.id, { orderStatus: e.target.value as OrderStatus })
                            }
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs font-semibold capitalize cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100"
                              title="Print Invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-[11px]"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Order Detail Drawer */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
                <div className="w-full max-w-lg bg-white h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center pb-4 border-b border-stone-200">
                    <div>
                      <span className="text-xs uppercase text-stone-400 font-semibold">Order Detail</span>
                      <h3 className="font-mono text-xl font-bold text-stone-900">
                        {selectedOrder.orderNumber}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1 text-stone-400 hover:text-stone-700 text-xl font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-semibold text-stone-900 uppercase tracking-wider mb-1">
                        Customer & Address
                      </h4>
                      <p className="font-bold text-sm text-stone-900">{selectedOrder.customerName}</p>
                      <p className="text-stone-600">Phone: {selectedOrder.phone}</p>
                      <p className="text-stone-600">Email: {selectedOrder.email}</p>
                      <p className="text-stone-600 mt-1">
                        {selectedOrder.shippingAddress.houseFlat}, {selectedOrder.shippingAddress.streetArea}
                      </p>
                      <p className="text-stone-600">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}{' '}
                        {selectedOrder.shippingAddress.postalCode}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100">
                      <h4 className="font-semibold text-stone-900 uppercase tracking-wider mb-2">
                        Purchased Items ({selectedOrder.items.length})
                      </h4>
                      <div className="divide-y divide-stone-100">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt=""
                                className="w-10 h-12 object-cover rounded border border-stone-200"
                              />
                              <div>
                                <p className="font-semibold text-stone-900">{item.name}</p>
                                <p className="text-[11px] text-stone-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold tabular-nums">
                              Rs. {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 space-y-1.5">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="tabular-nums">Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span className="tabular-nums">-Rs. {selectedOrder.discount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>
                          {selectedOrder.shippingFee === 0
                            ? 'FREE'
                            : `Rs. ${selectedOrder.shippingFee.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-stone-950 pt-2 border-t border-stone-100">
                        <span>Grand Total:</span>
                        <span>Rs. {selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100">
                      <button
                        onClick={() => setSelectedInvoiceOrder(selectedOrder)}
                        className="w-full py-2.5 bg-stone-900 text-white rounded text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4 text-[#D4AF37]" />
                        <span>Print Customer Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CUSTOMER MANAGEMENT */}
        {currentTab === 'customers' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 font-medium">Customer Directory</h2>
              <p className="text-xs text-stone-500">Registered customers and lifetime purchasing history.</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] text-stone-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {adminCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-semibold text-stone-900">{cust.name}</td>
                      <td className="py-3 px-4 text-stone-600">{cust.email}</td>
                      <td className="py-3 px-4 text-stone-600">{cust.phone || '—'}</td>
                      <td className="py-3 px-4 tabular-nums font-semibold">{cust.orderCount || 1}</td>
                      <td className="py-3 px-4 tabular-nums font-bold text-stone-950">
                        Rs. {(cust.totalSpent || 3240).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-stone-400 text-[11px]">
                        {new Date(cust.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: COUPONS */}
        {currentTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl text-stone-900 font-medium">Discount Coupons</h2>
                <p className="text-xs text-stone-500">Manage promotional codes and checkout savings.</p>
              </div>

              <button
                onClick={() => {
                  setEditingCoupon({
                    code: 'PROMO20',
                    discountType: 'percentage',
                    discountValue: 20,
                    minOrderAmount: 2500,
                    usageLimit: 200,
                    expiresAt: '2026-12-31',
                  });
                  setIsCouponModalOpen(true);
                }}
                className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] text-stone-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Min Order</th>
                    <th className="py-3 px-4">Used Count</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {adminCoupons.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">{c.code}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `Rs. ${c.discountValue} OFF`}
                      </td>
                      <td className="py-3 px-4 tabular-nums">Rs. {c.minOrderAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 tabular-nums">{c.usedCount} times</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: REVIEWS MODERATION */}
        {currentTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 font-medium">Customer Reviews Moderation</h2>
              <p className="text-xs text-stone-500">Approve or hide customer product reviews.</p>
            </div>

            <div className="space-y-3">
              {adminReviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white rounded-xl border border-stone-200 flex justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-xs">{rev.customerName}</span>
                      <span className="text-amber-500 font-semibold text-xs">{rev.rating}★</span>
                      <span className="text-stone-400 text-[11px]">for {rev.productName}</span>
                    </div>
                    <p className="text-xs text-stone-600 italic">"{rev.comment}"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {rev.status === 'approved' ? (
                      <button
                        onClick={() => handleReviewStatus(rev.id, 'hidden')}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-semibold"
                      >
                        Hide
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReviewStatus(rev.id, 'approved')}
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: CATEGORIES */}
        {currentTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 font-medium">Categories Management</h2>
              <p className="text-xs text-stone-500">Curate store catalog taxonomies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {adminCategories.map((cat) => (
                <div key={cat.id} className="p-4 bg-white rounded-xl border border-stone-200 flex items-center gap-4">
                  <img src={cat.image} alt="" className="w-14 h-14 object-cover rounded-lg border border-stone-200" />
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">{cat.name}</h4>
                    <p className="text-xs text-stone-400 line-clamp-1">{cat.description}</p>
                    <span className="text-[11px] text-[#8C6D46] font-semibold mt-1 block">
                      {cat.itemCount || 0} active designs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS & HOMEPAGE CONFIG */}
        {currentTab === 'settings' && storeConfig && (
          <form onSubmit={handleSaveSettings} className="space-y-8 max-w-3xl">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 font-medium">Store & Homepage Settings</h2>
              <p className="text-xs text-stone-500">
                Update store branding, shipping limits, WhatsApp concierge number, and homepage text without touching code.
              </p>
            </div>

            {/* General Info */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-base text-stone-900 font-medium pb-2 border-b border-stone-100">
                Store Identity & Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={storeConfig.storeName}
                    onChange={(e) => setStoreConfig({ ...storeConfig, storeName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">WhatsApp Support Number</label>
                  <input
                    type="text"
                    value={storeConfig.whatsappNumber}
                    onChange={(e) => setStoreConfig({ ...storeConfig, whatsappNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={storeConfig.phone}
                    onChange={(e) => setStoreConfig({ ...storeConfig, phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={storeConfig.contactEmail}
                    onChange={(e) => setStoreConfig({ ...storeConfig, contactEmail: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Shipping & Delivery Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-base text-stone-900 font-medium pb-2 border-b border-stone-100">
                Shipping & Thresholds
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Free Delivery Threshold (Rs.)
                  </label>
                  <input
                    type="number"
                    value={storeConfig.freeShippingThreshold}
                    onChange={(e) =>
                      setStoreConfig({ ...storeConfig, freeShippingThreshold: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Flat Delivery Fee (Rs.)
                  </label>
                  <input
                    type="number"
                    value={storeConfig.flatShippingFee}
                    onChange={(e) =>
                      setStoreConfig({ ...storeConfig, flatShippingFee: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900 tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Homepage Content Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-base text-stone-900 font-medium pb-2 border-b border-stone-100">
                Homepage Hero & Announcement
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Announcement Bar Text</label>
                  <input
                    type="text"
                    value={storeConfig.announcementText}
                    onChange={(e) => setStoreConfig({ ...storeConfig, announcementText: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Hero Headline</label>
                  <input
                    type="text"
                    value={storeConfig.heroHeadline}
                    onChange={(e) => setStoreConfig({ ...storeConfig, heroHeadline: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Hero Subheading</label>
                  <textarea
                    rows={2}
                    value={storeConfig.heroSubheading}
                    onChange={(e) => setStoreConfig({ ...storeConfig, heroSubheading: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-xs text-stone-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>Save Settings</span>
            </button>
          </form>
        )}
      </div>

      {/* Product Edit / Add Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                {editingProduct.id ? 'Edit Jewelry Piece' : 'Add New Jewelry Piece'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Piece Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Baroque Pearl Drop Earrings"
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Regular Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Sale Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'earrings'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 capitalize"
                  >
                    {adminCategories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Anti-Tarnish Plating?</label>
                  <select
                    value={editingProduct.isAntiTarnish ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isAntiTarnish: e.target.value === 'true' })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2"
                  >
                    <option value="true">Yes (18K PVD Anti-Tarnish)</option>
                    <option value="false">No (Standard Fashion)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 text-white rounded font-semibold uppercase tracking-wider"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal for Admin */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          settings={storeConfig}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
