/**
 * API Service Layer - StackAudit
 */

// In production (Vercel), set VITE_API_URL to your deployed backend URL.
// In development, leave it unset — Vite's proxy handles /api -> localhost:5000.
const BASE_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Audit Engine endpoints
  createAudit: async (formData) => {
    const response = await fetch(`${BASE_URL}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to submit audit');
    return data;
  },

  getReport: async (id) => {
    const response = await fetch(`${BASE_URL}/api/report/${id}`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch report');
    return data;
  },

  submitLead: async (id, leadData) => {
    const response = await fetch(`${BASE_URL}/api/report/${id}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to capture lead');
    return data;
  },

  // Auth endpoints
  adminLogin: async (username, password) => {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Authentication failed');
    return data;
  },

  // Admin Dashboard endpoints
  getStats: async () => {
    const response = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to load statistics');
    return data.stats;
  },

  getReports: async () => {
    const response = await fetch(`${BASE_URL}/api/admin/reports`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch reports');
    return data;
  },

  getLeads: async () => {
    const response = await fetch(`${BASE_URL}/api/admin/leads`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch leads');
    return data;
  },

  deleteReport: async (id) => {
    const response = await fetch(`${BASE_URL}/api/admin/reports/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete report');
    return data;
  }
};
