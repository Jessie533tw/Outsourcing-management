// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp?: string;
  path?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'STAFF' | 'ACCOUNTANT';
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  name: string;
  department?: string;
  phone?: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  estimatedCost: number;
  actualCost: number;
  status: 'PLANNING' | 'BUDGETING' | 'APPROVED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  contractNumber?: string;
  clientName?: string;
  clientContact?: string;
  folderPath?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: Pick<User, 'id' | 'name' | 'username'>;
  manager?: Pick<User, 'id' | 'name' | 'username'>;
  _count?: {
    materialAnalysisLists: number;
    budgets: number;
    inquiries: number;
    purchaseOrders: number;
    schedules: number;
  };
}

export interface CreateProjectData {
  name: string;
  code: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  estimatedCost?: number;
  clientName?: string;
  clientContact?: string;
  managerId?: string;
}

// Material Analysis Types
export interface MaterialAnalysisList {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
  project: Pick<Project, 'id' | 'name' | 'code'>;
  createdBy: Pick<User, 'id' | 'name' | 'username'>;
  items: MaterialAnalysisItem[];
}

export interface MaterialAnalysisItem {
  id: string;
  listId: string;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specification?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Budget Types
export interface Budget {
  id: string;
  projectId: string;
  version: number;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'LOCKED';
  submittedAt?: string;
  approvedAt?: string;
  lockedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  project: Pick<Project, 'id' | 'name' | 'code'>;
  approvedBy?: Pick<User, 'id' | 'name' | 'username'>;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  bankAccount?: string;
  paymentTerms?: string;
  rating?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    inquiries: number;
    quotes: number;
    purchaseOrders: number;
  };
}

// Dashboard Types
export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  purchaseOrders: {
    total: number;
    pending: number;
    approved: number;
    totalAmount: number;
  };
  budgets: {
    total: number;
    approved: number;
    used: number;
    remaining: number;
  };
  delays: {
    deliveryDelays: number;
    scheduleDelays: number;
  };
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter Types
export interface ProjectFilters {
  status?: string[];
  managerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Auth Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}