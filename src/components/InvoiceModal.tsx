import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { Order, StoreSettings } from '../types.ts';

interface InvoiceModalProps {
  order: Order;
  settings: StoreSettings | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full p-8 md:p-12 shadow-2xl border border-stone-200">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-stone-500">Official Invoice</span>
            <span className="font-mono text-xs font-bold text-stone-900">{order.orderNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="space-y-8 text-stone-900">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-200">
            <div>
              <h1 className="font-serif text-3xl font-medium tracking-wider uppercase text-stone-900">
                {settings?.storeName || 'ZARIYA LUXE'}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {settings?.tagline || 'Timeless Shine. Everyday Elegance.'}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                {settings?.storeAddress || 'Al-Hafeez Executive, Gulberg III, Lahore, Pakistan'}
              </p>
              <p className="text-[11px] text-stone-400">
                WhatsApp: {settings?.whatsappNumber || '+92 321 8849201'} · Email: {settings?.contactEmail || 'care@zariyaluxe.com'}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block bg-stone-100 text-stone-800 font-bold uppercase text-[11px] px-2.5 py-1 rounded">
                Invoice / Receipt
              </span>
              <p className="font-mono text-sm font-semibold text-stone-900 mt-1">
                {order.orderNumber}
              </p>
              <p className="text-xs text-stone-500">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-stone-500 uppercase">
                Payment: <strong className="text-stone-900">{order.paymentMethod.toUpperCase()}</strong> ({order.paymentStatus})
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <h3 className="uppercase tracking-wider font-semibold text-stone-400 mb-1.5 text-[11px]">
                Billed & Shipped To:
              </h3>
              <p className="font-semibold text-stone-900 text-sm">{order.customerName}</p>
              <p className="text-stone-600 mt-0.5">{order.shippingAddress.houseFlat}</p>
              <p className="text-stone-600">{order.shippingAddress.streetArea}</p>
              <p className="text-stone-600">
                {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
              </p>
              <p className="text-stone-600">{order.shippingAddress.country}</p>
              <p className="text-stone-600 mt-1">Phone: {order.phone}</p>
              <p className="text-stone-600">Email: {order.email}</p>
            </div>

            <div className="text-right">
              <h3 className="uppercase tracking-wider font-semibold text-stone-400 mb-1.5 text-[11px]">
                Shipment Status:
              </h3>
              <p className="font-semibold text-stone-900 capitalize text-sm">{order.orderStatus}</p>
              {order.trackingNumber && (
                <p className="text-stone-600 mt-1">
                  Courier Tracking: <strong className="font-mono text-stone-900">{order.trackingNumber}</strong>
                </p>
              )}
              {order.internalNotes && (
                <p className="text-stone-500 italic mt-2 text-[11px]">
                  Notes: {order.internalNotes}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] tracking-wider text-stone-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Item & Variant</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-medium text-stone-900">
                      {item.name}
                      {item.variant && (
                        <span className="block text-[11px] text-stone-400 font-normal">
                          {item.variant}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">{item.sku}</td>
                    <td className="py-3 px-4 text-center tabular-nums font-semibold">{item.quantity}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-stone-600">
                      Rs. {item.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold text-stone-900">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end text-xs">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="tabular-nums font-semibold text-stone-900">
                  Rs. {order.subtotal.toLocaleString()}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span className="tabular-nums font-semibold">
                    -Rs. {order.discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Courier Delivery:</span>
                <span className="tabular-nums font-semibold text-stone-900">
                  {order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-stone-950 pt-2 border-t border-stone-200">
                <span>Total Amount:</span>
                <span className="tabular-nums">Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Guarantee */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>100% Anti-Tarnish Lifetime Lustre Guarantee on 18K PVD items.</span>
            </div>
            <p className="text-[11px]">Thank you for adorning with Zariya Luxe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
