import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Printer, Compass, Package, MapPin, Truck } from 'lucide-react';
import { Order } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { InvoiceModal } from '../components/InvoiceModal.tsx';

interface OrderSuccessPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, navigate }) => {
  const { settings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#8C6D46', '#1C1917', '#EBDBC9'],
      });
    } catch {
      // ignore
    }

    // Fetch order
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-xs text-stone-500">Retrieving your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Order confirmed!</h2>
        <p className="text-xs text-stone-500">Thank you for your order. We are preparing it for shipment.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
      {/* Thank you card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-10 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 stroke-[1.8]" />
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Your order has been placed successfully and is being prepared for express dispatch.
          </p>
        </div>

        {/* Order Number pill */}
        <div className="inline-flex items-center gap-2 bg-[#FAF8F5] border border-stone-200 px-4 py-2 rounded-xl text-xs">
          <span className="text-stone-500">Order Reference:</span>
          <strong className="font-mono text-stone-950 font-bold text-sm tracking-wide">
            {order.orderNumber}
          </strong>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(`/track-order?order=${order.orderNumber}`)}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            <span>Track My Order</span>
          </button>
          <button
            onClick={() => setShowInvoice(true)}
            className="px-5 py-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Details */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-6">
        <h2 className="font-serif text-lg text-stone-900 font-medium pb-2 border-b border-stone-100">
          Order Summary & Shipping Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-600">
          <div className="space-y-1">
            <span className="font-semibold text-stone-900 block text-xs mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#8C6D46]" />
              Shipping Destination
            </span>
            <p className="font-medium text-stone-900">{order.customerName}</p>
            <p>{order.shippingAddress.houseFlat}, {order.shippingAddress.streetArea}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
            <p>Phone: {order.phone}</p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-stone-900 block text-xs mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#8C6D46]" />
              Delivery Details
            </span>
            <p>
              Payment: <strong className="uppercase text-stone-900">{order.paymentMethod}</strong> ({order.paymentStatus})
            </p>
            <p>
              Status: <span className="capitalize font-medium text-stone-900">{order.orderStatus}</span>
            </p>
            {order.trackingNumber && (
              <p>
                Tracking ID: <span className="font-mono font-semibold text-stone-900">{order.trackingNumber}</span>
              </p>
            )}
            <p className="text-stone-500">Estimated Delivery: 2–4 Business Days</p>
          </div>
        </div>

        {/* Ordered items */}
        <div className="pt-4 border-t border-stone-100 divide-y divide-stone-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-14 object-cover rounded border border-stone-200"
                />
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">{item.name}</h4>
                  <p className="text-[11px] text-stone-400">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="text-xs font-semibold tabular-nums text-stone-900">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Total calculation */}
        <div className="pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums">Rs. {order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Coupon Discount</span>
              <span className="tabular-nums">-Rs. {order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-stone-950 pt-2 border-t border-stone-100">
            <span>Grand Total</span>
            <span className="tabular-nums">Rs. {order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal
          order={order}
          settings={settings}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};
