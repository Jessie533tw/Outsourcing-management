import axios, { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { 
  ApiResponse, 
  User, 
  LoginCredentials, 
  RegisterData,
  Project,
  CreateProjectData,
  PaginatedResponse,
  ProjectFilters,
  MaterialAnalysisList,
  Budget,
  Supplier,
  DashboardStats
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize with existing token
if (authToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.error?.message || error.message;
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = '/login';
      toast.error('登入已過期，請重新登入');
    } else if (error.response?.status && error.response.status >= 400) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<{ user: User; token: string }> =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials)
      .then(res => res.data.data!),

  register: (data: RegisterData): Promise<{ user: User; token: string }> =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data)
      .then(res => res.data.data!),

  getProfile: (): Promise<{ user: User }> =>
    api.get<ApiResponse<{ user: User }>>('/auth/me')
      .then(res => res.data.data!),

  updateProfile: (data: Partial<User>): Promise<{ user: User }> =>
    api.put<ApiResponse<{ user: User }>>('/auth/profile', data)
      .then(res => res.data.data!),

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<void> =>
    api.put<ApiResponse>('/auth/change-password', data)
      .then(() => undefined),

  refreshToken: (): Promise<{ token: string }> =>
    api.post<ApiResponse<{ token: string }>>('/auth/refresh')
      .then(res => res.data.data!),

  logout: (): Promise<void> =>
    api.post<ApiResponse>('/auth/logout')
      .then(() => undefined),
};

// Projects API
export const projectsAPI = {
  getProjects: (params?: { 
    page?: number; 
    limit?: number; 
    filters?: ProjectFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Project>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    
    if (params?.filters) {
      const { status, managerId, startDate, endDate, search } = params.filters;
      if (status?.length) status.forEach(s => searchParams.append('status', s));
      if (managerId) searchParams.append('managerId', managerId);
      if (startDate) searchParams.append('startDate', startDate);
      if (endDate) searchParams.append('endDate', endDate);
      if (search) searchParams.append('search', search);
    }
    
    return api.get<ApiResponse<PaginatedResponse<Project>>>(`/projects?${searchParams}`)
      .then(res => res.data.data!);
  },

  getProject: (id: string): Promise<{ project: Project }> =>
    api.get<ApiResponse<{ project: Project }>>(`/projects/${id}`)
      .then(res => res.data.data!),

  createProject: (data: CreateProjectData): Promise<{ project: Project }> =>
    api.post<ApiResponse<{ project: Project }>>('/projects', data)
      .then(res => res.data.data!),

  updateProject: (id: string, data: Partial<CreateProjectData>): Promise<{ project: Project }> =>
    api.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, data)
      .then(res => res.data.data!),

  deleteProject: (id: string): Promise<void> =>
    api.delete<ApiResponse>(`/projects/${id}`)
      .then(() => undefined),

  getProjectStats: (id: string): Promise<{ stats: any }> =>
    api.get<ApiResponse<{ stats: any }>>(`/projects/${id}/stats`)
      .then(res => res.data.data!),
};

// Material Analysis API
export const materialAnalysisAPI = {
  getLists: (): Promise<{ lists: MaterialAnalysisList[] }> =>
    api.get<ApiResponse<{ lists: MaterialAnalysisList[] }>>('/material-analysis')
      .then(res => res.data.data!),
};

// Budgets API
export const budgetsAPI = {
  getBudgets: (): Promise<{ budgets: Budget[] }> =>
    api.get<ApiResponse<{ budgets: Budget[] }>>('/budgets')
      .then(res => res.data.data!),
};

// Suppliers API
export const suppliersAPI = {
  getSuppliers: (): Promise<{ suppliers: Supplier[] }> =>
    api.get<ApiResponse<{ suppliers: Supplier[] }>>('/suppliers')
      .then(res => res.data.data!),
};

// Dashboard API
export const dashboardAPI = {
  getStats: (): Promise<DashboardStats> =>
    Promise.resolve({
      projects: {
        total: 12,
        active: 8,
        completed: 4,
      },
      purchaseOrders: {
        total: 45,
        pending: 12,
        approved: 33,
        totalAmount: 15500000,
      },
      budgets: {
        total: 25000000,
        approved: 22000000,
        used: 18500000,
        remaining: 3500000,
      },
      delays: {
        deliveryDelays: 3,
        scheduleDelays: 2,
      },
    }),
};

export default api;