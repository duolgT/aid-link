// Backend API Configuration (Production)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aidlinkkakuma.vercel.app/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`
  },

  // Organizations
  ORGANIZATIONS: {
    LIST: `${API_BASE_URL}/organizations`
  },

  // Reports
  REPORTS: {
    CREATE: `${API_BASE_URL}/reports`,
    BATCH: `${API_BASE_URL}/reports/batch`,
    ORG_REPORTS: `${API_BASE_URL}/reports/org`,
    UPDATE: (id) => `${API_BASE_URL}/reports/org/${id}`
  },

  // Services
  SERVICES: {
    LIST: `${API_BASE_URL}/services`,
    CATEGORIES: `${API_BASE_URL}/services/categories`,
    DETAIL: (id) => `${API_BASE_URL}/services/${id}`,
    CREATE: `${API_BASE_URL}/services`,
    UPDATE: (id) => `${API_BASE_URL}/services/${id}`,
    DELETE: (id) => `${API_BASE_URL}/services/${id}`
  },

  // Emergency Guides
  EMERGENCY_GUIDES: {
    LIST: `${API_BASE_URL}/emergency-guides`,
    CATEGORIES: `${API_BASE_URL}/emergency-guides/categories`,
    DETAIL: (id) => `${API_BASE_URL}/emergency-guides/${id}`,
    CREATE: `${API_BASE_URL}/emergency-guides`,
    UPDATE: (id) => `${API_BASE_URL}/emergency-guides/${id}`,
    DELETE: (id) => `${API_BASE_URL}/emergency-guides/${id}`
  }
};

// Helper function to build query string
export function buildQueryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  return query.toString();
}

// Helper function to make API requests
export async function apiRequest(url, options = {}) {
  try {
    const token = localStorage.getItem('orgToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// API Helper Methods
export const API = {
  // Organizations
  async getOrganizations() {
    return apiRequest(API_ENDPOINTS.ORGANIZATIONS.LIST);
  },

  // Reports
  async createReport(reportData) {
    return apiRequest(API_ENDPOINTS.REPORTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  async batchSyncReports(reports) {
    return apiRequest(API_ENDPOINTS.REPORTS.BATCH, {
      method: 'POST',
      body: JSON.stringify({ reports })
    });
  },

  async getOrganizationReports(filters = {}) {
    const query = buildQueryString(filters);
    const url = query ? `${API_ENDPOINTS.REPORTS.ORG_REPORTS}?${query}` : API_ENDPOINTS.REPORTS.ORG_REPORTS;
    return apiRequest(url);
  },

  async updateReportStatus(id, status, notes) {
    return apiRequest(API_ENDPOINTS.REPORTS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  },

  // Services
  async getServices(filters = {}) {
    const query = buildQueryString(filters);
    const url = query ? `${API_ENDPOINTS.SERVICES.LIST}?${query}` : API_ENDPOINTS.SERVICES.LIST;
    return apiRequest(url, { skipAuth: true });
  },

  async getServiceById(id) {
    return apiRequest(API_ENDPOINTS.SERVICES.DETAIL(id), { skipAuth: true });
  },

  async getServiceCategories() {
    return apiRequest(API_ENDPOINTS.SERVICES.CATEGORIES, { skipAuth: true });
  },

  // Emergency Guides
  async getEmergencyGuides(filters = {}) {
    const query = buildQueryString(filters);
    const url = query ? `${API_ENDPOINTS.EMERGENCY_GUIDES.LIST}?${query}` : API_ENDPOINTS.EMERGENCY_GUIDES.LIST;
    return apiRequest(url, { skipAuth: true });
  },

  async getEmergencyGuideById(id) {
    return apiRequest(API_ENDPOINTS.EMERGENCY_GUIDES.DETAIL(id), { skipAuth: true });
  },

  async getEmergencyCategories() {
    return apiRequest(API_ENDPOINTS.EMERGENCY_GUIDES.CATEGORIES, { skipAuth: true });
  },

  // Authentication
  async register(orgData) {
    return apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(orgData),
      skipAuth: true
    });
  },

  async login(email, password) {
    return apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });
  },

  async getProfile() {
    return apiRequest(API_ENDPOINTS.AUTH.ME);
  },

  // Services Management (Protected)
  async createService(serviceData) {
    return apiRequest(API_ENDPOINTS.SERVICES.CREATE, {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  },

  async updateService(id, serviceData) {
    return apiRequest(API_ENDPOINTS.SERVICES.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(serviceData)
    });
  },

  async deleteService(id) {
    return apiRequest(API_ENDPOINTS.SERVICES.DELETE(id), {
      method: 'DELETE'
    });
  },

  // Emergency Guides Management (Protected)
  async createEmergencyGuide(guideData) {
    return apiRequest(API_ENDPOINTS.EMERGENCY_GUIDES.CREATE, {
      method: 'POST',
      body: JSON.stringify(guideData)
    });
  },

  async updateEmergencyGuide(id, guideData) {
    return apiRequest(API_ENDPOINTS.EMERGENCY_GUIDES.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(guideData)
    });
  },

  async deleteEmergencyGuide(id) {
    return apiRequest(API_ENDPOINTS.EMERGENCY_GUIDES.DELETE(id), {
      method: 'DELETE'
    });
  }
};

export default API;
