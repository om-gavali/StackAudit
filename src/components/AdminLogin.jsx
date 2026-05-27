import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.adminLogin(username, password);
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Network error. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-6 py-24 max-w-md relative z-10 flex flex-col justify-center min-h-[80vh]">
      <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
            <Lock className="text-purple-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard Access</h1>
          <p className="text-slate-400 text-sm mt-2">Enter credentials to manage generated audits</p>
        </div>

        {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-102 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
