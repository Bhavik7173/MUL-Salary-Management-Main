import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('employee@company.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    if (!password) { setError('Please enter your password'); return; }
    const result = await login(email, password);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(231 75% 55%), transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(231 75% 55%), transparent)' }} />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-[hsl(231_75%_55%)] opacity-30" />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-[hsl(231_75%_55%)] opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-[hsl(231_75%_55%)] opacity-40" />
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
        {theme === 'light' ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
      </button>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(var(--primary))] shadow-lg mb-4">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">MUL Salary</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your salary tracker</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-8">
          <h2 className="text-lg font-heading font-semibold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@company.com"
                className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]
                  focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full h-10 px-3.5 pr-10 rounded-xl border border-input bg-background text-sm
                    placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]
                    focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Hint */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[hsl(var(--primary)/0.07)] border border-[hsl(var(--primary)/0.2)] rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Demo: use any email + any password (4+ chars)
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[hsl(var(--primary))] text-white text-sm font-semibold
                hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-60 disabled:cursor-not-allowed
                transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          MUL Salary Tracker © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
