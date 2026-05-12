import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function DarkField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  suffix,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-normal text-white placeholder-gray-500 bg-gray-800 border border-gray-600 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
          style={{ colorScheme: 'dark' }}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('admin@dss.io');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email.trim(), password);
      if (result.ok) {
        navigate('/');
      } else {
        setError(result.error ?? 'Login failed.');
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-4 shadow-xl shadow-brand-500/40">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DS Studio</h1>
          <p className="text-sm text-gray-400 mt-1">Design System Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <h2 className="text-lg font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-6">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DarkField
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              required
            />

            <DarkField
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="text-gray-500 hover:text-gray-300 transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-lg px-3.5 py-2.5 text-sm text-red-300 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Default credentials hint */}
          <div className="mt-6 pt-5 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center mb-2 uppercase tracking-wider font-medium">Default credentials</p>
            <div className="bg-gray-800/60 rounded-lg px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Email</span>
                <code className="text-gray-200 font-mono">admin@dss.io</code>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Password</span>
                <code className="text-gray-200 font-mono">admin123</code>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          DS Studio v1.0 &nbsp;·&nbsp; Enterprise Design Platform
        </p>
      </div>
    </div>
  );
}
