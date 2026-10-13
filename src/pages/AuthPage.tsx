import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface AuthPageProps {
  navigate: (path: string) => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ navigate, defaultMode = 'login' }) => {
  const { loginUser, showToast } = useStore();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' ? { email, password } : { name, email, phone, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        loginUser(data.user, data.token);
        navigate('/account');
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCustomerLogin = () => {
    setEmail('customer@example.com');
    setPassword('customer123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-8 shadow-sm space-y-6">
        {/* Header Tabs */}
        <div className="flex border-b border-stone-200">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              mode === 'login' ? 'text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Sign In
            {mode === 'login' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              mode === 'signup' ? 'text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Create Account
            {mode === 'signup' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
          </button>
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-2xl text-stone-900 font-medium">
            {mode === 'login' ? 'Welcome Back' : 'Join Zariya Luxe'}
          </h1>
          <p className="text-xs text-stone-500">
            {mode === 'login'
              ? 'Sign in to access your order history and saved addresses.'
              : 'Create an account for expedited checkout and private vault offers.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mahnoor Tariq"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Phone Number (WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </button>
        </form>

        {/* Demo Credentials Quick-Fill helper */}
        <div className="pt-4 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-400 mb-1.5">For quick demonstration testing:</p>
          <button
            type="button"
            onClick={handleDemoCustomerLogin}
            className="text-xs text-[#8C6D46] hover:underline font-semibold"
          >
            Fill Demo Customer Credentials (customer@example.com)
          </button>
        </div>
      </div>
    </div>
  );
};
