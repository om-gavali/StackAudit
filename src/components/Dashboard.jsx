import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Download, Share2, ArrowLeft, CheckCircle2, TrendingDown, Info, Mail, Building, Briefcase, Users, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

export default function Dashboard({ isPublic = false }) {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [leadCapturedState, setLeadCapturedState] = useState(false);
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('Developer');
  const [teamSize, setTeamSize] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const updateOrCreateMeta = (nameOrProperty, content, keyType = 'name') => {
    let element = document.querySelector(`meta[${keyType}="${nameOrProperty}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(keyType, nameOrProperty);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  useEffect(() => {
    const fetchHeaders = {};
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchHeaders['Authorization'] = `Bearer ${token}`;
    }

    fetch(`/api/report/${id}`, { headers: fetchHeaders })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data);
          // If it is public, we automatically bypass the gated modal blur
          setLeadCapturedState(isPublic ? true : data.leadCaptured);
          setTeamSize(data.companyDetails?.teamSize || 1);
          
          // Set OG / Twitter Meta Tags
          const metaTitle = `AI Spend Audit - Potential Savings: $${data.monthlySavings}/mo`;
          const metaDesc = `Optimized stack reduces monthly AI tool spending from $${data.totalCurrentMonthlySpend} to $${data.totalOptimizedMonthlySpend}. Audit your stack instantly.`;
          
          document.title = metaTitle;
          updateOrCreateMeta('description', metaDesc);
          updateOrCreateMeta('og:title', metaTitle, 'property');
          updateOrCreateMeta('og:description', metaDesc, 'property');
          updateOrCreateMeta('og:type', 'website', 'property');
          updateOrCreateMeta('og:url', window.location.href, 'property');
          updateOrCreateMeta('twitter:card', 'summary_large_image');
          updateOrCreateMeta('twitter:title', metaTitle);
          updateOrCreateMeta('twitter:description', metaDesc);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load report.');
        setLoading(false);
      });
  }, [id, isPublic]);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    try {
      const res = await fetch(`/api/report/${id}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName, role, teamSize })
      });
      const data = await res.json();
      if (data.success) {
        setLeadCapturedState(true);
        if (data.previewUrl) {
          toast.success(
            (t) => (
              <span className="flex items-center gap-1">
                Report unlocked! 📬 Test email sent.
                <a 
                  href={data.previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline text-purple-400 font-bold ml-1 hover:text-purple-300 hover:scale-102 transition-transform"
                  onClick={() => toast.dismiss(t.id)}
                >
                  View test email
                </a>
              </span>
            ),
            { duration: 10000 }
          );
        } else {
          toast.success('Report unlocked! A confirmation has been sent to your email.');
        }
      } else {
        setSubmitError(data.error || 'Failed to submit details');
        toast.error(data.error || 'Submission failed');
      }
    } catch (err) {
      setSubmitError('Network error. Is the server running?');
      toast.error('Network connection error.');
    }
    setSubmitLoading(false);
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/report/${id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Shareable public link copied to clipboard!');
  };

  const handleShareTwitter = () => {
    const tweetText = `We just audited our AI tool expenses on StackAudit and discovered $${report.monthlySavings}/mo ($${report.yearlySavings}/yr) in potential savings! Check out our optimized stack:`;
    const shareUrl = `${window.location.origin}/report/${id}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleExportPDF = () => {
    toast.success('Opening print menu. Choose "Save as PDF" to download report.');
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-purple-500" size={48} />
          <p className="text-slate-400 font-medium">Analyzing stack data and generating AI recommendations...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 text-white text-center">
        <div className="glass-dark border border-slate-800 p-8 rounded-3xl max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-400 mb-4">{error || 'Report not found'}</h2>
          <p className="text-slate-400 mb-6">The requested audit code is invalid or the database is currently resetting.</p>
          <Link to="/audit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold inline-block hover:scale-105 transition-transform">
            Return to Audit Tool
          </Link>
        </div>
      </div>
    );
  }

  const currentChartData = report.originalTools.map(t => ({
    name: t.name,
    value: Number(t.spend) * (Number(t.seats) || 1)
  }));

  const optimizedChartData = report.optimizedStack.map(t => ({
    name: t.name,
    value: Number(t.cost) * (Number(t.seats) || 1)
  }));

  const savingsPercentage = report.totalCurrentMonthlySpend > 0 
    ? Math.round((report.monthlySavings / report.totalCurrentMonthlySpend) * 100)
    : 0;

  return (
    <div className="container mx-auto px-6 py-12 relative z-10 print:p-0">
      
      {/* Back Button (Hidden on Print) */}
      <div className="print:hidden">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Your AI Spend Audit</h1>
          <p className="text-slate-400">
            {isPublic ? 'Public Share Link' : 'Personal Audit Dashboard'} • Generated for a team of {teamSize}
          </p>
        </div>
        
        {/* Interactive Action Buttons (Hidden on Print) */}
        {leadCapturedState && (
          <div className="flex flex-wrap gap-3 print:hidden">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 glass-dark text-slate-300 rounded-xl hover:text-white transition-colors border border-slate-700/80 cursor-pointer text-sm font-semibold"
            >
              <Download size={16} /> Download PDF
            </button>
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 glass-dark text-slate-300 rounded-xl hover:text-white transition-colors border border-slate-700/80 cursor-pointer text-sm font-semibold"
            >
              <Share2 size={16} /> Copy share URL
            </button>
            <button 
              onClick={handleShareTwitter}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 rounded-xl transition-colors border border-blue-500/20 cursor-pointer text-sm font-semibold"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Share on X
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="glass-dark p-6 rounded-2xl border border-slate-800/80">
          <div className="text-slate-400 text-sm font-medium mb-1">Current Monthly Spend</div>
          <div className="text-4xl font-black text-white">${report.totalCurrentMonthlySpend}</div>
        </div>
        
        <div className="glass p-6 rounded-2xl border border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="text-slate-200 text-sm font-medium mb-1 flex items-center gap-2">
            Potential Monthly Savings <TrendingDown size={16} className="text-green-400" />
          </div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            ${report.monthlySavings}
          </div>
          <div className="mt-2 text-xs font-semibold text-green-400 bg-green-400/10 inline-block px-2.5 py-1 rounded">
            {savingsPercentage}% budget reduction
          </div>
        </div>
        
        <div className="glass-dark p-6 rounded-2xl border border-slate-800/80">
          <div className="text-slate-400 text-sm font-medium mb-1">Annual Savings Impact</div>
          <div className="text-4xl font-black text-white">${report.yearlySavings}</div>
        </div>
      </div>

      {/* Main Gated Content Panel */}
      <div className="relative">
        
        {/* Blurrable Content Wrapper */}
        <div className={`transition-all duration-700 ${leadCapturedState ? '' : 'blur-xl pointer-events-none select-none print:blur-none print:pointer-events-auto'}`}>
          
          {/* Savings Meter / Progress Gauge */}
          <div className="glass-dark p-6 rounded-3xl border border-slate-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-extrabold text-white text-lg">Savings Meter</h3>
              <p className="text-slate-400 text-sm">Visualizing the portion of your budget saved by model consolidation and optimizations.</p>
            </div>
            <div className="w-full md:w-3/5">
              <div className="h-6 rounded-full bg-slate-900 border border-slate-800 p-1 flex overflow-hidden">
                <div 
                  style={{ width: `${Math.max(savingsPercentage, 5)}%` }} 
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-green-500 flex items-center justify-end pr-2 transition-all duration-1000"
                >
                  <span className="text-[10px] font-black text-white">{savingsPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Executive Summary Card */}
          <div className="glass p-6 rounded-3xl border border-white/10 mb-12 bg-gradient-to-r from-purple-950/20 to-pink-950/20">
            <h2 className="text-base font-extrabold text-white mb-2.5 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles size={16} className="text-purple-400" /> AI Generated Summary
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              {report.aiSummary || 'Summary calculation pending...'}
            </p>
          </div>

          {/* Charts and Action Plan Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            
            {/* Visual Charts */}
            <div className="glass-dark p-8 rounded-3xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-6">Spend Breakdown</h2>
              <div className="h-[280px] w-full flex">
                <div className="w-1/2 h-full flex flex-col items-center">
                  <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase">Current Stack</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie data={currentChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {currentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-1/2 h-full flex flex-col items-center">
                  <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase">Optimized Stack</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie data={optimizedChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {optimizedChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                {currentChartData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations list */}
            <div className="glass-dark p-8 rounded-3xl border border-slate-800 flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6">Action Plan</h2>
              {report.recommendations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-6">
                  <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-50" />
                  <p className="font-semibold text-white">Your stack is optimized!</p>
                  <p className="text-sm text-slate-400 mt-1">We found no overlapping subscriptions or plan inefficiencies.</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold text-white text-sm">{rec.title}</h3>
                        <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                          Save ${rec.savings}/mo
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optimized Stack list view */}
          <div className="glass p-8 rounded-3xl border border-white/10 mb-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              Your Optimized Stack <Info size={16} className="text-slate-400" />
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {report.optimizedStack.map((tool, i) => (
                <div key={i} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{tool.name}</div>
                    <div className="text-xs text-slate-500">{tool.seats || 1} seats</div>
                  </div>
                  <div className="font-black text-white">${tool.cost * (tool.seats || 1)}</div>
                </div>
              ))}
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-4 flex justify-between items-center sm:col-span-2 md:col-span-full mt-4">
                <span className="font-bold text-purple-200">Total Optimized Monthly Cost</span>
                <span className="font-black text-2xl text-white">${report.totalOptimizedMonthlySpend}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Capture Gate Overlay Modal (Hidden on Print) */}
        {!leadCapturedState && (
          <div className="absolute inset-0 flex items-start justify-center pt-10 z-30 print:hidden">
            <div className="glass-dark border border-purple-500/30 p-8 rounded-3xl max-w-lg w-full mx-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-500 bg-slate-950/90 backdrop-blur-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-purple-400 animate-pulse" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Unlock Your Optimization Plan</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We've calculated a potential monthly savings of <span className="text-green-400 font-black">${report.monthlySavings}</span>. Enter your business details below to instantly view your custom breakdown and email report.
                </p>
              </div>

              {submitError && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-xs text-center font-medium">{submitError}</div>
              )}

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Work Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Company Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Building size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Your Role</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Briefcase size={16} />
                      </span>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs cursor-pointer"
                      >
                        <option>Developer</option>
                        <option>CTO</option>
                        <option>VP Engineering</option>
                        <option>Founder / CEO</option>
                        <option>Product Manager</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Confirm Team Size</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Users size={16} />
                      </span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold rounded-xl hover:scale-102 transition-transform disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(219,39,119,0.3)] mt-2"
                >
                  {submitLoading ? <Loader2 className="animate-spin" size={18} /> : 'Unlock Savings Report'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
