import React, { useState } from 'react';
import { Activity, Shield, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { AdminUser } from '../App';

interface LoginProps {
  onLogin: (user: AdminUser) => void;
  apiBaseUrl: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, apiBaseUrl }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If already in fallback mode or backend is detected to be skipped
    if (fallbackMode) {
      setTimeout(() => {
        setLoading(false);
        if (isRegister) {
          onLogin({ id: 99, username: username || 'demo_admin', name: name || 'Demo Administrator' });
        } else {
          if (username === 'admin' && password === 'admin123') {
            onLogin({ id: 1, username: 'admin', name: 'Chief Administrator' });
          } else {
            setError('Invalid credentials! (For demo fallback, use: admin / admin123)');
          }
        }
      }, 500);
      return;
    }

    try {
      const endpoint = isRegister ? '/register' : '/login';
      const body = isRegister ? { username, password, name } : { username, password };

      const response = await fetch(`${apiBaseUrl}/auth${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('Authentication connection error:', err);
      // Automatically prompt to use demo fallback if Flask is down
      setError('Cannot connect to Flask server. Would you like to launch in Local Fallback Mode for immediate demonstration?');
      setFallbackMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToDemo = () => {
    setFallbackMode(true);
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo Brand Title */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl shadow-inner border border-indigo-500/20 mb-4 animate-bounce">
          <Activity size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
          Welcome to <span className="text-indigo-400">MediPulse</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Healthcare & Data Analytics Control Center
        </p>
      </div>

      {/* Card Panel */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl p-8 relative">
        {fallbackMode && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500/90 text-slate-950 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles size={10} /> Local Demo Mode Active
          </div>
        )}

        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield size={18} className="text-indigo-400" />
          {isRegister ? 'Register Administrator' : 'Admin Credentials Sign In'}
        </h3>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span>{error}</span>
              {fallbackMode && !isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                    setError(null);
                  }}
                  className="block mt-2 font-bold text-indigo-400 underline hover:text-indigo-300"
                >
                  Auto-fill Admin Demo Credentials
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chief Administrator"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 text-white rounded-xl placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 text-white rounded-xl placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 bg-slate-900/60 border border-slate-700 text-white rounded-xl placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <KeyRound size={16} className="absolute right-3.5 top-3.5 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all-300 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegister ? (
              'Create Administrator'
            ) : (
              'Sign In securely'
            )}
          </button>
        </form>

        {/* Toggle between Register/Login and Fallback trigger */}
        <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-all"
          >
            {isRegister
              ? 'Already have an administrator account? Sign In'
              : 'Add new secondary administrator? Register'}
          </button>

          {!fallbackMode && (
            <button
              type="button"
              onClick={handleSkipToDemo}
              className="text-xs font-semibold text-indigo-400/80 hover:text-indigo-400 hover:underline border border-indigo-500/10 bg-indigo-500/5 px-3 py-1.5 rounded-lg transition-all"
            >
              Skip directly to Local Fallback Demo Mode
            </button>
          )}
        </div>
      </div>

      {/* Quick Helper Credentials Badge */}
      <div className="mt-5 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          💡 DBMS College Credentials Hint: Username <code className="bg-indigo-500/10 text-indigo-300 px-1 py-0.5 rounded font-mono font-bold">admin</code>, Password <code className="bg-indigo-500/10 text-indigo-300 px-1 py-0.5 rounded font-mono font-bold">admin123</code>
        </p>
      </div>
    </div>
  );
};

export default Login;
