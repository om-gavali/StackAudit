import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  return (
    <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
      <Link to="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white text-lg">✦</span>
        </div>
        StackAudit
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="/#features" className="hover:text-white transition-colors">Features</a>
        <a href="/#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        <a href="/#faq" className="hover:text-white transition-colors">FAQ</a>
      </div>
      <button 
        onClick={() => navigate('/admin/login')}
        className="px-5 py-2.5 rounded-full glass-dark text-white font-medium hover:bg-white/10 transition-colors border border-white/10"
      >
        Admin Login
      </button>
    </nav>
  );
}
