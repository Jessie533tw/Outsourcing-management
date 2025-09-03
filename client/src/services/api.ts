import axios from 'axios';
import type { 
  User, 
  Project, 
  Vendor, 
  Material, 
  MaterialAnalysis, 
  Quotation,
  PriceComparison,
  PurchaseOrder,
  ProgressSchedule,
  Alert,
  ApiResponse 
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: {
    username: string;
    email: string;
    password: string;
    department: string;
    role?: string;
  }) => api.post('/auth/register', userData),

  getProfile: () => api.get('/auth/profile'),
};

export const projectAPI = {
  getProjects: (params?: { status?: string; manager?: string }) =>
    api.get('/projects', { params }),

  getProject: (id: string) => api.get(`/projects/${id}`),

  createProject: (projectData: {
    name: string;
    description?: string;
    location: string;
    client: string;
    startDate: Date;
    endDate: Date;
    estimatedCost: number;
  }) => api.post('/projects', projectData),

  updateBudget: (id: string, total: number) =>
    api.put(`/projects/${id}/budget`, { total }),

  approveProject: (id: string, status: 'approved' | 'rejected', comment?: string) =>
    api.post(`/projects/${id}/approve`, { status, comment }),

  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

export const vendorAPI = {
  getVendors: (params?: { specialty?: string; isActive?: boolean }) =>
    api.get('/vendors', { params }),

  getVendor: (id: string) => api.get(`/vendors/${id}`),

  createVendor: (vendorData: Omit<Vendor, '_id' | 'vendorId'>) =>
    api.post('/vendors', vendorData),

  updateVendor: (id: string, vendorData: Partial<Vendor>) =>
    api.put(`/vendors/${id}`, vendorData),

  updateRating: (id: string, rating: number) =>
    api.put(`/vendors/${id}/rating`, { rating }),

  deleteVendor: (id: string) => api.delete(`/vendors/${id}`),
};

export const materialAPI = {
  getMaterials: (params?: { category?: string; isActive?: boolean }) =>
    api.get('/materials', { params }),

  createMaterial: (materialData: Omit<Material, '_id' | 'materialId'>) =>
    api.post('/materials', materialData),

  createAnalysis: (analysisData: {
    projectId: string;
    materials: { materialId: string; quantity: number; notes?: string }[];
    generatedFrom: string;
  }) => api.post('/materials/analysis', analysisData),

  createAnalysisFromDrawing: (projectId: string, drawingFile: File) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('drawing', drawingFile);
    return api.post('/materials/analysis/from-drawing', formData);
  },

  getAnalysis: (projectId: string) => api.get(`/materials/analysis/${projectId}`),

  approveAnalysis: (id: string) => api.put(`/materials/analysis/${id}/approve`),
};

export const purchaseAPI = {
  createQuotations: (data: {
    projectId: string;
    vendorIds: string[];
    materialAnalysisId: string;
  }) => api.post('/purchases/quotations', data),

  submitQuotation: (id: string, data: {
    items: { material: string; quantity: number; unitPrice: number; totalPrice: number }[];
    totalAmount: number;
    vendorComments?: string;
  }) => api.put(`/purchases/quotations/${id}/submit`, data),

  createPriceComparison: (data: {
    projectId: string;
    quotationIds: string[];
  }) => api.post('/purchases/price-comparison', data),

  createPurchaseOrder: (data: {
    projectId: string;
    vendorId: string;
    items: {
      material: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      deliveryDate: Date;
    }[];
    paymentTerms: string;
    deliveryAddress: string;
  }) => api.post('/purchases/purchase-orders', data),

  getPurchaseOrders: (params?: { projectId?: string; status?: string }) =>
    api.get('/purchases/purchase-orders', { params }),

  receivePurchaseOrder: (id: string, receivedItems: { quantity: number }[]) =>
    api.put(`/purchases/purchase-orders/${id}/receive`, { receivedItems }),
};

export const progressAPI = {
  createSchedule: (projectId: string, tasks: Omit<ProgressTask, 'taskId' | 'status' | 'progress'>[]) =>
    api.post('/progress/schedule', { projectId, tasks }),

  getSchedule: (projectId: string) => api.get(`/progress/schedule/${projectId}`),

  updateTask: (scheduleId: string, taskId: string, updates: {
    progress?: number;
    status?: string;
    actualStartDate?: Date;
    actualEndDate?: Date;
    notes?: string;
  }) => api.put(`/progress/schedule/${scheduleId}/task/${taskId}`, updates),

  createDeliveryTracking: (purchaseOrderId: string) =>
    api.post('/progress/delivery-tracking', { purchaseOrderId }),

  addDelivery: (trackingId: string, delivery: {
    deliveryDate?: Date;
    items: { material: string; quantity: number; condition: string }[];
    notes?: string;
  }) => api.post(`/progress/delivery-tracking/${trackingId}/delivery`, delivery),

  generateReport: (projectId: string) => api.get(`/progress/reports/${projectId}`),

  getAlerts: (projectId: string) => api.get(`/progress/alerts/${projectId}`),
};

export const reportAPI = {
  getProjectSummary: (projectId: string) => api.get(`/reports/project-summary/${projectId}`),

  getProjectDetails: (projectId: string, format?: 'pdf') =>
    api.get(`/reports/project-details/${projectId}`, { 
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),

  getFinancialSummary: (params?: {
    startDate?: Date;
    endDate?: Date;
    projectId?: string;
  }) => api.get('/reports/financial-summary', { params }),

  generateCompletionReport: (projectId: string) =>
    api.post(`/reports/completion-report/${projectId}`, {}, { responseType: 'blob' }),
};

export default api;