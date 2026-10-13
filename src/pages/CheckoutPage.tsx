import React, { useState } from 'react';
import { ShieldCheck, Truck, CreditCard, Banknote, Tag, ArrowRight, Lock, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { PaymentMethod } from '../types.ts';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
    settings,
    user,
    showToast,
  } = useStore();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [houseFlat, setHouseFlat] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderNotes, setOrderNotes] = useState('');

  // Online payment card inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Your shopping bag is empty</h2>
        <p className="text-xs text-stone-500">Add some pieces to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  const freeThreshold = settings?.freeShippingThreshold || 3000;
  const flatFee = settings?.flatShippingFee || 250;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingCost =
    cartSubtotal >= freeThreshold || (appliedCoupon && appliedCoupon.coupon.code === 'FREESHIP')
      ? 0
      : flatFee;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponError('');
    const res = await applyCoupon(couponCodeInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCodeInput('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !houseFlat.trim() || !city.trim()) {
      showToast('Please fill in all required shipping address fields.');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvc)) {
      showToast('Please enter your card payment details.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerId: user?.id || undefined,
        customerName: fullName.trim(),
        email: email.trim() || `${phone.trim()}@zariyaluxe.com`,
        phone: phone.trim(),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          houseFlat: houseFlat.trim(),
          streetArea: streetArea.trim(),
          city: city.trim(),
          province,
          postalCode: postalCode.trim() || '00000',
          country: 'Pakistan',
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.images[0],
          price: item.product.salePrice || item.product.price,
          quantity: item.quantity,
          variant: `${item.selectedColor || item.product.color} ${item.selectedSize ? `· ${item.selectedSize}` : ''}`,
          sku: item.product.sku,
        })),
        couponCode: appliedCoupon?.coupon.code,
        paymentMethod,
        internalNotes: orderNotes ? `Customer note: ${orderNotes}` : undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        navigate(`/order-success/${data.id}`);
      } else {
        showToast(data.error || 'Failed to place order');
      }
    } catch {
      showToast('An unexpected error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium">Checkout</h1>
        <p className="text-xs text-stone-500 mt-1">Complete your delivery & payment information.</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Customer & Shipping (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer Information */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-4">
            <h2 className="font-serif text-lg text-stone-900 font-medium pb-2 border-b border-stone-100 flex items-center justify-between">
              <span>1. Contact Information</span>
              {!user && (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-[#8C6D46] hover:underline"
                >
                  Already have an account? Log in
                </button>
              )}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ayesha Siddiqui"
                  className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Mobile Phone Number (for WhatsApp/Courier) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Email Address (for order receipts)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ayesha@example.com"
                  className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-4">
            <h2 className="font-serif text-lg text-stone-900 font-medium pb-2 border-b border-stone-100">
              2. Shipping Address (Pakistan)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  House / Flat / Building No. *
                </label>
                <input
                  type="text"
                  required
                  value={houseFlat}
                  onChange={(e) => setHouseFlat(e.target.value)}
                  placeholder="e.g. House 42-B, Floor 2"
                  className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Street / Sector / Phase / Area *
                </label>
                <input
                  type="text"
                  required
                  value={streetArea}
                  onChange={(e) => setStreetArea(e.target.value)}
                  placeholder="e.g. Street 9, DHA Phase 5"
                  className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Province *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                  <option value="Azad Kashmir">Azad Jammu & Kashmir</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Postal Code (Optional)</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 54000"
                  className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value="Pakistan"
                  className="w-full bg-stone-100 border border-stone-200 text-xs rounded-lg px-3 py-2.5 text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Order Notes / Courier Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Please deliver after 4 PM or call upon arrival"
                className="w-full bg-stone-50/50 border border-stone-300 text-xs rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-4">
            <h2 className="font-serif text-lg text-stone-900 font-medium pb-2 border-b border-stone-100">
              3. Payment Method
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-stone-900 bg-[#FAF8F5]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-stone-900 focus:ring-stone-900"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-[#8C6D46]" />
                    <span className="text-xs font-semibold text-stone-900">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Pay securely in cash directly to the courier rider upon parcel delivery.
                  </p>
                </div>
              </label>

              {/* Online Payment Card */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-stone-900 bg-[#FAF8F5]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-1 text-stone-900 focus:ring-stone-900"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#8C6D46]" />
                    <span className="text-xs font-semibold text-stone-900">
                      Credit / Debit Card (Visa, Mastercard, PayPak)
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Direct 256-bit SSL encrypted bank gateway processing.
                  </p>

                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-4 border-t border-stone-200 space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="•••• •••• •••• ••••"
                          className="w-full bg-white border border-stone-300 text-xs rounded px-3 py-2 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-white border border-stone-300 text-xs rounded px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            CVC / CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="•••"
                            className="w-full bg-white border border-stone-300 text-xs rounded px-3 py-2 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Easypaisa / JazzCash */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash'
                    ? 'border-stone-900 bg-[#FAF8F5]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'easypaisa'}
                  onChange={() => setPaymentMethod('easypaisa')}
                  className="mt-1 text-stone-900 focus:ring-stone-900"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-900">
                      Mobile Wallets (Easypaisa / JazzCash)
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Receive an approval prompt on your mobile wallet app upon placing the order.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 sticky top-28 space-y-5">
            <h2 className="font-serif text-lg text-stone-900 font-medium pb-2 border-b border-stone-100">
              Order Summary ({cart.length} items)
            </h2>

            {/* Items scroll */}
            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => {
                const price = item.product.salePrice || item.product.price;
                return (
                  <div key={item.product.id} className="py-3 flex gap-3 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-16 object-cover rounded border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Qty: {item.quantity} · {item.selectedColor || item.product.color}
                      </p>
                      <span className="text-xs font-semibold tabular-nums text-stone-900">
                        Rs. {(price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Coupon <strong>{appliedCoupon.coupon.code}</strong> (-Rs.{' '}
                    {appliedCoupon.discount.toLocaleString()})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-stone-700 text-xs font-semibold underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-stone-100 space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. LUXE10)"
                    className="flex-1 text-xs border border-stone-300 rounded px-3 py-2 uppercase placeholder:normal-case focus:outline-none focus:border-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-semibold text-stone-900">
                  Rs. {cartSubtotal.toLocaleString()}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums font-semibold">
                    -Rs. {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="tabular-nums font-semibold text-stone-900">
                  {shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-stone-950 pt-3 border-t border-stone-200">
                <span>Grand Total</span>
                <span className="tabular-nums text-lg">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              <span>{isSubmitting ? 'Securing Order...' : 'Place Order Now'}</span>
            </button>

            <div className="pt-2 text-[11px] text-stone-400 text-center space-y-1">
              <p>7-Day Hassle-Free Exchange Guarantee</p>
              <p>Cash on Delivery available nationwide across Pakistan</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
