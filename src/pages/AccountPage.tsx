import React, { useState, useEffect } from 'react';
import { User as UserIcon, Package, MapPin, Heart, LogOut, CheckCircle2, Truck, Printer, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Order, ShippingAddress } from '../types.ts';
import { InvoiceModal } from '../components/InvoiceModal.tsx';

interface AccountPageProps {
  navigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate }) => {
  const { user, logoutUser, showToast, settings } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'profile'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Profile edit fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingOrders(true);
    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingOrders(false);
      });
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name,
          phone,
          newPassword: newPassword || undefined,
        }),
      });

      if (res.ok) {
        showToast('Profile updated successfully');
        setNewPassword('');
      } else {
        showToast('Failed to update profile');
      }
    } catch {
      showToast('Error updating profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header Profile Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-stone-900 font-medium">Hello, {user.name}</h1>
            <p className="text-xs text-stone-500">{user.email} · Customer since {new Date(user.createdAt).getFullYear()}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logoutUser();
            navigate('/');
          }}
          className="px-4 py-2 border border-stone-200 hover:border-red-300 text-stone-600 hover:text-red-600 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-1">
          {[
            { id: 'overview', label: 'Overview', icon: UserIcon },
            { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'profile', label: 'Profile Settings', icon: Lock },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === item.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area (9 cols) */}
        <main className="lg:col-span-9 bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 min-h-[400px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-medium">Account Overview</h2>
                <p className="text-xs text-stone-500 mt-0.5">Summary of your jewelry purchases and preferences.</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                  <span className="text-[11px] text-stone-400 uppercase font-semibold">Total Orders</span>
                  <p className="text-2xl font-serif text-stone-900 font-semibold">{orders.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                  <span className="text-[11px] text-stone-400 uppercase font-semibold">Total Spent</span>
                  <p className="text-2xl font-serif text-stone-900 font-semibold tabular-nums">
                    Rs. {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                  <span className="text-[11px] text-stone-400 uppercase font-semibold">Anti-Tarnish Guarantee</span>
                  <p className="text-sm font-semibold text-emerald-800 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Active on all orders
                  </p>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-base text-stone-900 font-medium">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#8C6D46] hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-stone-500">No orders placed yet.</p>
                ) : (
                  <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-xl overflow-hidden">
                    {orders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs font-bold text-stone-900">{ord.orderNumber}</p>
                          <p className="text-[11px] text-stone-500">
                            {new Date(ord.createdAt).toLocaleDateString()} · {ord.items.length} items · Rs.{' '}
                            {ord.total.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs font-semibold capitalize px-2.5 py-1 bg-stone-100 rounded text-stone-800">
                          {ord.orderStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-medium">Order History</h2>
                <p className="text-xs text-stone-500 mt-0.5">Track and view invoices for all previous purchases.</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-500">You haven't placed any orders yet.</p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="px-5 py-2.5 bg-stone-900 text-white rounded text-xs font-semibold uppercase tracking-wider"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-xl border border-stone-200/80 space-y-4 hover:border-stone-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-stone-100 gap-2">
                        <div>
                          <span className="font-mono text-sm font-bold text-stone-900">{ord.orderNumber}</span>
                          <span className="text-stone-400 text-xs ml-3">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5 text-stone-600" />
                            <span>Invoice</span>
                          </button>
                          <button
                            onClick={() => navigate(`/track-order?order=${ord.orderNumber}`)}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Track</span>
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-stone-50">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-12 object-cover rounded border border-stone-200"
                              />
                              <div>
                                <h4 className="font-medium text-stone-900">{item.name}</h4>
                                <p className="text-[11px] text-stone-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-stone-900 tabular-nums">
                              Rs. {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                        <span className="text-stone-500">
                          Status:{' '}
                          <strong className="capitalize text-stone-900">{ord.orderStatus}</strong> (
                          {ord.paymentMethod.toUpperCase()})
                        </span>
                        <span className="text-sm font-semibold text-stone-950 tabular-nums">
                          Total: Rs. {ord.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-medium">Saved Addresses</h2>
                <p className="text-xs text-stone-500 mt-0.5">Your addresses for expedited one-click checkout.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(user.addresses || []).length === 0 ? (
                  <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-center sm:col-span-2 space-y-2">
                    <p className="text-xs text-stone-500">
                      No saved addresses yet. Address will be saved automatically upon your next checkout.
                    </p>
                  </div>
                ) : (
                  user.addresses?.map((addr, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-stone-200 text-xs space-y-1">
                      <span className="font-semibold text-stone-900 block">{addr.fullName}</span>
                      <p className="text-stone-600">{addr.houseFlat}, {addr.streetArea}</p>
                      <p className="text-stone-600">{addr.city}, {addr.province}</p>
                      <p className="text-stone-500">Phone: {addr.phone}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-medium">Profile Settings</h2>
                <p className="text-xs text-stone-500 mt-0.5">Update your personal contact details and password.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    New Password (Leave blank to keep unchanged)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          settings={settings}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
