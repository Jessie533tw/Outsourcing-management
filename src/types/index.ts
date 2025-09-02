import { 
  User, Project, MaterialAnalysisList, Budget, Supplier, 
  Inquiry, Quote, PriceComparison, PurchaseOrder, 
  ConstructionSchedule, ProgressReport, Contract, 
  Voucher, LedgerReport, Notification 
} from '@prisma/client';

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
export interface UserWithProjects extends User {
  createdProjects: Project[];
  managedProjects: Project[];
}

// Project Types
export interface ProjectWithDetails extends Project {
  createdBy: Pick<User, 'id' | 'name' | 'username'>;
  manager?: Pick<User, 'id' | 'name' | 'username'>;
  _count: {
    materialAnalysisLists: number;
    budgets: number;
    inquiries: number;
    purchaseOrders: number;
    schedules: number;
  };
}

// Material Analysis Types
export interface MaterialAnalysisWithItems extends MaterialAnalysisList {
  items: MaterialAnalysisItem[];
  createdBy: Pick<User, 'id' | 'name' | 'username'>;
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
}

// Budget Types
export interface BudgetWithItems extends Budget {
  items: BudgetItem[];
  approvedBy?: Pick<User, 'id' | 'name' | 'username'>;
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
}

// Supplier Types
export interface SupplierWithStats extends Supplier {
  _count: {
    inquiries: number;
    quotes: number;
    purchaseOrders: number;
  };
}

// Inquiry Types
export interface InquiryWithDetails extends Inquiry {
  project: Pick<Project, 'id' | 'name' | 'code'>;
  createdBy: Pick<User, 'id' | 'name' | 'username'>;
  items: InquiryItem[];
  supplierInquiries: SupplierInquiry[];
  quotes: Quote[];
}

export interface InquiryItem {
  id: string;
  inquiryId: string;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  specification?: string;
  notes?: string;
}

export interface SupplierInquiry {
  id: string;
  inquiryId: string;
  supplierId: string;
  supplier: Pick<Supplier, 'id' | 'name' | 'contactPerson'>;
  sentAt: Date;
  isReplied: boolean;
  repliedAt?: Date;
}

// Quote Types
export interface QuoteWithDetails extends Quote {
  inquiry: Pick<Inquiry, 'id' | 'inquiryNumber' | 'title'>;
  supplier: Pick<Supplier, 'id' | 'name' | 'contactPerson'>;
  items: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDays?: number;
  notes?: string;
}

// Price Comparison Types
export interface PriceComparisonWithDetails extends PriceComparison {
  project: Pick<Project, 'id' | 'name' | 'code'>;
  items: PriceComparisonItemWithSupplier[];
  selectedSupplier?: Pick<Supplier, 'id' | 'name'>;
}

export interface PriceComparisonItemWithSupplier {
  id: string;
  comparisonId: string;
  supplier: Pick<Supplier, 'id' | 'name'>;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDays?: number;
  isSelected: boolean;
  notes?: string;
}

// Purchase Order Types
export interface PurchaseOrderWithDetails extends PurchaseOrder {
  project: Pick<Project, 'id' | 'name' | 'code'>;
  supplier: Pick<Supplier, 'id' | 'name' | 'contactPerson'>;
  createdBy: Pick<User, 'id' | 'name' | 'username'>;
  approvedBy?: Pick<User, 'id' | 'name' | 'username'>;
  items: PurchaseItem[];
  materialDetails: MaterialPurchaseDetail[];
  progressDetails: ProgressPurchaseDetail[];
}

export interface PurchaseItem {
  id: string;
  purchaseOrderId: string;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQty: number;
  notes?: string;
}

export interface MaterialPurchaseDetail {
  id: string;
  projectId: string;
  purchaseOrderId: string;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveredQty: number;
  usedQty: number;
  isReceived: boolean;
  receivedDate?: Date;
}

export interface ProgressPurchaseDetail {
  id: string;
  projectId: string;
  purchaseOrderId: string;
  scheduleItemId?: string;
  phase: string;
  activity: string;
  amount: number;
  progressRate: number;
  isPaid: boolean;
  paymentDate?: Date;
}

// Schedule Types
export interface ScheduleWithItems extends ConstructionSchedule {
  project: Pick<Project, 'id' | 'name' | 'code'>;
  items: ScheduleItemWithPurchase[];
}

export interface ScheduleItemWithPurchase {
  id: string;
  scheduleId: string;
  purchaseOrder?: Pick<PurchaseOrder, 'id' | 'orderNumber'>;
  activity: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  currentProgress: number;
  status: string;
  isDelayed: boolean;
  delayDays: number;
  notes?: string;
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

// Workflow Types
export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  description?: string;
  timestamp?: Date;
}

export interface ProjectWorkflow {
  projectId: string;
  currentStep: number;
  steps: WorkflowStep[];
}

// Notification Types
export interface NotificationWithUsers extends Notification {
  users: UserNotification[];
}

export interface UserNotification {
  id: string;
  userId: string;
  notificationId: string;
  isRead: boolean;
  readAt?: Date;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

// File Upload Types
export interface FileUploadResult {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

// Filter Types
export interface ProjectFilters {
  status?: string[];
  managerId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface PurchaseOrderFilters {
  projectId?: string;
  supplierId?: string;
  status?: string[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
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