import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Trash2, LogOut, ExternalLink, RefreshCw, BarChart2, Users, 
  TrendingUp, FileSpreadsheet, Search, Filter, ShieldAlert, Loader2, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('audits'); // audits, leads, analytics
  const [reports, setReports] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [auditSearch, setAuditSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [useCaseFilter, setUseCaseFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const [fetchedStats, fetchedReports, fetchedLeads] = await Promise.all([
        api.getStats(),
        api.getReports(),
        api.getLeads()
      ]);

      setStats(fetchedStats);
      setReports(fetchedReports);
      setLeads(fetchedLeads);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Authentication expired. Please log in again.');
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report and its associated lead?')) return;
    
    try {
      await api.deleteReport(id);
      toast.success('Report deleted successfully');
      // Refresh list
      setReports(prev => prev.filter(r => r.id !== id));
      setLeads(prev => prev.filter(l => l.reportId !== id));
      // Refresh stats
      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err) {
      toast.error('Failed to delete report.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  // CSV Exporter
  const handleExportCSV = (type) => {
    if (type === 'audits') {
      if (reports.length === 0) return toast.error('No audits to export.');
      const headers = ['id', 'createdAt', 'companyStage', 'teamSize', 'primaryUseCase', 'totalCurrentMonthlySpend', 'totalOptimizedMonthlySpend', 'monthlySavings', 'yearlySavings', 'leadCaptured'];
      const csvData = reports.map(r => ({
        id: r.id,
        createdAt: new Date(r.createdAt).toISOString(),
        companyStage: r.companyDetails?.companyStage || '',
        teamSize: r.companyDetails?.teamSize || 1,
        primaryUseCase: r.companyDetails?.primaryUseCase || '',
        totalCurrentMonthlySpend: r.totalCurrentMonthlySpend,
        totalOptimizedMonthlySpend: r.totalOptimizedMonthlySpend,
        monthlySavings: r.monthlySavings,
        yearlySavings: r.yearlySavings,
        leadCaptured: r.leadCaptured ? 'Yes' : 'No'
      }));
      triggerCSVDownload(csvData, headers, 'stackaudit_audits_report.csv');
    } else {
      if (leads.length === 0) return toast.error('No leads to export.');
      const headers = ['email', 'companyName', 'role', 'teamSize', 'reportId', 'createdAt'];
      const csvData = leads.map(l => ({
        email: l.email,
        companyName: l.companyName,
        role: l.role || '',
        teamSize: l.teamSize || 1,
        reportId: l.reportId,
        createdAt: new Date(l.createdAt).toISOString()
      }));
      triggerCSVDownload(csvData, headers, 'stackaudit_captured_leads.csv');
    }
  };

  const triggerCSVDownload = (data, headers, filename) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} exported successfully!`);
  };

  // Filtering calculations
  const filteredReports = reports.filter(r => {
    const stage = r.companyDetails?.companyStage || '';
    const useCase = r.companyDetails?.primaryUseCase || '';
    const idMatches = r.id.toLowerCase().includes(auditSearch.toLowerCase());
    
    const stageMatches = stageFilter === 'All' || stage === stageFilter;
    const useCaseMatches = useCaseFilter === 'All' || useCase === useCaseFilter;

    return idMatches && stageMatches && useCaseMatches;
  });

  const filteredLeads = leads.filter(l => {
    const email = l.email.toLowerCase();
    const company = l.companyName.toLowerCase();
    const query = leadSearch.toLowerCase();
    return email.includes(query) || company.includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white relative z-10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-purple-500" size={48} />
          <p className="text-slate-400">Loading admin analytics console...</p>
        </div>
      </div>
    );
  }

  // Pre-formatting charts data
  const stageChartData = stats ? Object.keys(stats.stageBreakdown).map((key, i) => ({
    name: key,
    value: stats.stageBreakdown[key]
  })).filter(item => item.value > 0) : [];

  const useCaseChartData = stats ? Object.keys(stats.useCaseBreakdown).map((key, i) => ({
    name: key,
    value: stats.useCaseBreakdown[key]
  })).filter(item => item.value > 0) : [];

  return (
    <div className="container mx-auto px-6 py-12 relative z-10 text-slate-200">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <BarChart2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Console</h1>
            <p className="text-xs text-slate-400">Manage stack audits, monitor leads, and view platform metrics</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={loadData}
            className="p-3 rounded-xl glass-dark border border-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 rounded-xl font-bold text-sm cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="glass-dark p-5 rounded-2xl border border-slate-800/80">
            <div className="text-slate-400 text-xs font-semibold mb-1 uppercase">Total Audits</div>
            <div className="text-3xl font-black text-white">{stats.totalAudits}</div>
          </div>
          <div className="glass-dark p-5 rounded-2xl border border-slate-800/80">
            <div className="text-slate-400 text-xs font-semibold mb-1 uppercase">Leads Captured</div>
            <div className="text-3xl font-black text-purple-400">{stats.totalLeads}</div>
          </div>
          <div className="glass-dark p-5 rounded-2xl border border-slate-800/80">
            <div className="text-slate-400 text-xs font-semibold mb-1 uppercase">Unlock Rate</div>
            <div className="text-3xl font-black text-white">{stats.conversionRate}%</div>
          </div>
          <div className="glass-dark p-5 rounded-2xl border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="text-slate-400 text-xs font-semibold mb-1 uppercase">Monthly Savings</div>
            <div className="text-3xl font-black text-green-400">${stats.totalMonthlySavings}</div>
          </div>
          <div className="glass p-5 rounded-2xl border border-green-500/20 col-span-2 lg:col-span-1 bg-green-500/5">
            <div className="text-green-400 text-xs font-bold mb-1 uppercase">Annual Budget Saved</div>
            <div className="text-3xl font-black text-white">${stats.totalYearlySavings}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-8 gap-2">
        <button
          onClick={() => setActiveTab('audits')}
          className={`px-5 py-3.5 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'audits' 
              ? 'border-purple-500 text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Audit History
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-5 py-3.5 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'leads' 
              ? 'border-purple-500 text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Leads List
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3.5 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'analytics' 
              ? 'border-purple-500 text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Visual Analytics
        </button>
      </div>

      {/* Tab Panels */}
      
      {/* 1. Audit panel */}
      {activeTab === 'audits' && (
        <div className="space-y-6">
          {/* Filters & Export */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/30 p-5 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Search Audit ID..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1"><Filter size={12} /> Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="All">All Stages</option>
                  <option value="Startup">Startup</option>
                  <option value="Growth">Growth</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Agency">Agency</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1"><Filter size={12} /> Use Case:</span>
                <select
                  value={useCaseFilter}
                  onChange={(e) => setUseCaseFilter(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="All">All Use Cases</option>
                  <option value="coding">Coding</option>
                  <option value="writing">Writing</option>
                  <option value="research">Research</option>
                  <option value="data analysis">Data Analysis</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleExportCSV('audits')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-sm cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet size={16} /> Export Audits CSV
            </button>
          </div>

          {/* Audits Table */}
          <div className="glass-dark rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              {filteredReports.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No matching audits found.</div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                      <th className="p-5">Audit ID / Date</th>
                      <th className="p-5">Details</th>
                      <th className="p-5 text-right">Current Spend</th>
                      <th className="p-5 text-right text-green-400">Savings Discovered</th>
                      <th className="p-5 text-center">Lead Status</th>
                      <th className="p-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="p-5">
                          <div className="font-semibold text-white truncate max-w-[150px]">{report.id}</div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {new Date(report.createdAt).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="font-semibold text-white">Stage: {report.companyDetails?.companyStage || 'Startup'}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {report.companyDetails?.teamSize || 1} users • {report.companyDetails?.primaryUseCase || 'mixed'}
                          </div>
                        </td>
                        <td className="p-5 text-right font-semibold text-white">
                          ${report.totalCurrentMonthlySpend}/mo
                        </td>
                        <td className="p-5 text-right font-extrabold text-green-400">
                          ${report.monthlySavings}/mo (${report.yearlySavings}/yr)
                        </td>
                        <td className="p-5 text-center">
                          {report.leadCaptured ? (
                            <span className="inline-block bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded text-xs font-semibold">
                              Unlocked
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-800 text-slate-400 border border-slate-700/50 px-2 py-1 rounded text-xs font-semibold">
                              Locked
                            </span>
                          )}
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2.5">
                            <Link 
                              to={`/report/${report.id}`}
                              target="_blank"
                              className="p-2 bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/10 rounded-lg flex items-center gap-1.5 transition-colors font-medium text-xs"
                            >
                              <ExternalLink size={12} /> View Report
                            </Link>
                            <button 
                              onClick={() => handleDeleteReport(report.id)}
                              className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 rounded-lg transition-colors cursor-pointer"
                              title="Delete Report"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Leads panel */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          {/* Filter & Export */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/30 p-5 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="Search Email or Company Name..."
              />
            </div>
            
            <button
              onClick={() => handleExportCSV('leads')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-sm cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet size={16} /> Export Leads CSV
            </button>
          </div>

          {/* Leads Table */}
          <div className="glass-dark rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No leads captured yet.</div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                      <th className="p-5">Company & Email</th>
                      <th className="p-5">Role</th>
                      <th className="p-5">Team Size</th>
                      <th className="p-5">Captured Date</th>
                      <th className="p-5 text-center">Associated Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredLeads.map((lead, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                        <td className="p-5">
                          <div className="font-semibold text-white">{lead.companyName}</div>
                          <div className="text-xs text-slate-400 mt-1">{lead.email}</div>
                        </td>
                        <td className="p-5 text-slate-300">
                          {lead.role}
                        </td>
                        <td className="p-5 font-semibold text-white">
                          {lead.teamSize} users
                        </td>
                        <td className="p-5 text-slate-400">
                          {new Date(lead.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="p-5 text-center">
                          <Link 
                            to={`/report/${lead.reportId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-semibold border border-purple-500/20 transition-colors"
                          >
                            <ExternalLink size={10} /> View Report
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Analytics Charts panel */}
      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Stage breakdown */}
          <div className="glass-dark p-6 rounded-3xl border border-slate-800">
            <h3 className="font-extrabold text-white text-base mb-6 uppercase tracking-wider">Company Stage Distribution</h3>
            {stageChartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-slate-500">No chart data.</div>
            ) : (
              <div className="h-[250px] w-full flex">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie data={stageChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {stageChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} companies`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[40%] flex flex-col justify-center gap-2">
                  {stageChartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      {entry.name}: {entry.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Use cases breakdown */}
          <div className="glass-dark p-6 rounded-3xl border border-slate-800">
            <h3 className="font-extrabold text-white text-base mb-6 uppercase tracking-wider">Primary Use Case Split</h3>
            {useCaseChartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-slate-500">No chart data.</div>
            ) : (
              <div className="h-[250px] w-full flex">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie data={useCaseChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {useCaseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} audits`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[40%] flex flex-col justify-center gap-2">
                  {useCaseChartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      {entry.name}: {entry.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
