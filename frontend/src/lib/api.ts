import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── API Methods ─────────────────────────────────────────────────────────────

export const authAPI = {
  getGoogleRedirect: async () => {
    const res = await api.get('/auth/google');
    return res.data; // e.g. { url: "..." }
  },
  getGitHubRedirect: async () => {
    const res = await api.get('/auth/github');
    return res.data;
  },
  handleGoogleCallback: async (code: string) => {
    const res = await api.get(`/auth/google/callback?code=${code}`);
    return res.data.data; // e.g. { access_token, user_id, email }
  },
  handleGitHubCallback: async (code: string) => {
    const res = await api.get(`/auth/github/callback?code=${code}`);
    return res.data.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  }
};

export const startupAPI = {
  list: async () => {
    const res = await api.get('/startups');
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post('/startups', data);
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get(`/startups/${id}`);
    return res.data.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/startups/${id}`, data);
    return res.data.data;
  },
  analyze: async (id: string) => {
    const res = await api.post(`/startups/${id}/analyze`);
    return res.data.data; // { report_id, health_score, report }
  }
};

export const chatAPI = {
  list: async () => {
    const res = await api.get('/chats');
    return res.data.data;
  },
  create: async (title: string, startupId?: string) => {
    const res = await api.post('/chats', { title, startup_id: startupId });
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get(`/chats/${id}`);
    return res.data.data;
  },
  sendMessage: async (id: string, content: string, metadata?: any) => {
    const res = await api.post(`/chats/${id}/messages`, { content, metadata_json: metadata });
    return res.data.data;
  }
};

export const dashboardAPI = {
  getMetrics: async () => {
    const res = await api.get('/dashboard');
    return res.data.data;
  }
};

export const reportAPI = {
  list: async () => {
    const res = await api.get('/reports');
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get(`/reports/${id}`);
    return res.data.data;
  },
  getDownloadUrl: (id: string) => {
    return `${API_URL}/reports/${id}/download`;
  }
};
