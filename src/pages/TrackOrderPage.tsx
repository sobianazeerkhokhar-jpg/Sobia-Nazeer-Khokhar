import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, ArrowRight, Printer } from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { InvoiceModal } from '../components/InvoiceModal.tsx';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  navigate: (path: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber, navigate }) => {
  const { settings } = useStore();
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = async (numToSearch: string) => {
    if (!numToSearch.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(numToSearch.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        setOrder(null);
        setError(data.error || 'Order not found. Please double-check your order number.');
      }
    } catch {
      setError('Unable to track order right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(orderQuery);
  };

  // Milestone steps calculation
  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Order placed & payment verified' },
    { key: 'processing', label: 'Processing', desc: 'Jewelry item pulled from vault' },
    { key: 'packed', label: 'Quality Packed', desc: 'Packaged in signature velvet gift box' },
    { key: 'shipped', label: 'Dispatched', desc: 'Handed over to courier express' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier rider on the route' },
    { key: 'delivered', label: 'Delivered', desc: 'Received & signed by customer' },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    if (!order) return 'upcoming';
    const orderIndex = statusSteps.findIndex((s) => s.key === order.orderStatus);
    const thisIndex = statusSteps.findIndex((s) => s.key === stepKey);

    if (order.orderStatus === 'cancelled') return 'cancelled';
    if (thisIndex < orderIndex) return 'completed';
    if (thisIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Enter your Zariya Luxe Order Number (e.g. <span className="font-mono font-semibold">ZL-98214</span>) or reference ID to view real-time courier milestone updates.
        </p>

        {/* Search input form */}
        <form onSubmit={onSubmit} className="pt-2 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value.toUpperCase())}
              placeholder="e.g. ZL-98214"
              className="w-full bg-white border border-stone-300 rounded-lg px-4 py-3 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-stone-900 placeholder:normal-case shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'Tracking...' : 'Track'}</span>
          </button>
        </form>

        {error && <p className="text-xs text-red-600 pt-2">{error}</p>}
      </div>

      {/* Result Display */}
      {order && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="text-[11px] text-stone-400 uppercase font-semibold">Order Tracking</span>
              <h2 className="font-mono text-xl font-bold text-stone-900">{order.orderNumber}</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString()} by {order.customerName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoice(true)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-stone-600" />
                <span>Invoice</span>
              </button>
              <div className="bg-[#FAF8F5] border border-stone-200 px-3 py-1.5 rounded text-xs">
                <span className="text-stone-500">Courier: </span>
                <strong className="font-mono font-semibold text-stone-900">
                  {order.trackingNumber || 'Assigned upon dispatch'}
                </strong>
              </div>
            </div>
          </div>

          {/* Milestone Stepper */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Fulfillment Journey
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {statusSteps.map((step, idx) => {
                const stepState = getStepStatus(step.key);
                return (
                  <div
                    key={step.key}
                    className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                      stepState === 'completed'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : stepState === 'current'
                        ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-[#D4AF37]/50'
                        : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1.5 text-xs font-bold">
                      {stepState === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold block leading-tight">{step.label}</span>
                    <span
                      className={`text-[10px] mt-1 block leading-tight ${
                        stepState === 'current' ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Items details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-stone-100 text-xs text-stone-600">
            <div>
              <h4 className="font-semibold text-stone-900 text-xs mb-1 uppercase tracking-wider">
                Delivery Address
              </h4>
              <p>{order.shippingAddress.houseFlat}, {order.shippingAddress.streetArea}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
              <p>Recipient: {order.customerName} ({order.phone})</p>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 text-xs mb-1 uppercase tracking-wider">
                Payment & Total
              </h4>
              <p>
                Method: <strong className="uppercase text-stone-900">{order.paymentMethod}</strong> ({order.paymentStatus})
              </p>
              <p className="text-base font-semibold text-stone-950 mt-1 tabular-nums">
                Rs. {order.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {showInvoice && order && (
        <InvoiceModal order={order} settings={settings} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
