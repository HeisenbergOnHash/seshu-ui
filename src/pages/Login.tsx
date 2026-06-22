import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Loader2 } from 'lucide-react';
import { useAuth, api } from '../contexts/AuthProvider';
import { getCookie, setCookie } from '../lib/cookies';

const LAST_PHONE_COOKIE = 'last_phone';

export function Login() {
  const [phone, setPhone] = useState(() => getCookie(LAST_PHONE_COOKIE) ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', { phone, password });
      setCookie(LAST_PHONE_COOKIE, phone.trim());
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col mesh-bg overflow-hidden">
      {/* Decorative graphics */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl animate-float delay-200"
      />

      <div className="flex flex-1 flex-col justify-end px-5 pb-8 pt-safe sm:justify-center sm:px-6">
        {/* Brand */}
        <div className="mb-8 animate-fade-in-up sm:mb-10 sm:text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <IndianRupee className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FinManager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        {/* Minimal form panel */}
        <div className="animate-fade-in-up delay-100 glass-panel rounded-3xl p-5 sm:mx-auto sm:max-w-sm sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="sr-only">Phone number</label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className="input-minimal"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input-minimal"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="animate-fade-in text-center text-sm text-destructive">{error}</p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground animate-fade-in delay-300">
          Loan & interest management
        </p>
      </div>
    </div>
  );
}
