import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError('Invalid email or password.');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-stone-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-orange-600">Stock Manager</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
