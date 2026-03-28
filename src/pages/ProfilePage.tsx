import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/supabase/auth';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    AuthService.getProfile(user.id).then(({ data }) => {
      const name = data?.display_name ?? '';
      setDisplayName(name);
      setSavedName(name);
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const trimmed = displayName.trim();
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { data, error: err } = await AuthService.updateProfile(user.id, trimmed);
    setSaving(false);
    if (err) {
      setError('Failed to save. Please try again.');
    } else {
      setSavedName(data?.display_name ?? trimmed);
      setSuccess(true);
    }
  };

  const isDirty = displayName.trim() !== savedName;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-800">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-orange-600">Profile</h1>
          <button
            onClick={async () => { await signOut(); }}
            className="rounded-lg bg-stone-100 px-3 py-1 text-sm text-stone-700 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800">
          {loading ? (
            <div className="py-8 text-center text-sm text-stone-500">Loading...</div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Email
                </label>
                <p className="text-sm text-stone-800 dark:text-stone-200">{user?.email}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="display-name"
                  className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400"
                >
                  Display name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setSuccess(false); }}
                  placeholder="Your name"
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-orange-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              {success && (
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Saved.</p>
              )}

              <button
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="self-end rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
