export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'supervisor' | 'user';
  department: string;
}

export interface Project {
  _id: string;
  projectId: string;
  name: string;
  description?: string;
  location: string;
  client: string;
  startDate: Date;
  endDate: Date;
  estimatedCost: number;
  actualCost: number;
  budget: {
    total: number;
    remaining: number;
    allocated: number;
  };
  status: 'planning' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'suspended';
  manager: User;
  contractNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  _id: string;
  vendorId: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  taxId?: string;
  specialties: string[];
  rating: number;
  isActive: boolean;
  paymentTerms?: string;
  notes?: string;
}

export interface Material {
  _id: string;
  materialId: string;
  name: string;
  category: string;
  unit: string;
  specification?: string;
  standardPrice?: number;
  isActive: boolean;
}

export interface MaterialAnalysis {
  _id: string;
  project: Project;
  materials: {
    material: Material;
    quantity: number;
    estimatedPrice: number;
    notes?: string;
  }[];
  totalEstimatedCost: number;
  generatedFrom: string;
  status: 'draft' | 'approved' | 'sent_for_quotation';
  createdAt: Date;
}

export interface Quotation {
  _id: string;
  quotationId: string;
  project: Project;
  vendor: Vendor;
  materialAnalysis: MaterialAnalysis;
  items: {
    material: Material;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }[];
  totalAmount: number;
  validUntil: Date;
  status: 'sent' | 'received' | 'selected' | 'rejected';
  submittedAt?: Date;
  createdAt: Date;
}

export interface PriceComparison {
  _id: string;
  project: Project;
  quotations: Quotation[];
  comparison: {
    material: Material;
    vendors: {
      vendor: Vendor;
      unitPrice: number;
      totalPrice: number;
      isLowest: boolean;
    }[];
  }[];
  recommendedVendor: Vendor;
  status: 'comparing' | 'completed';
  createdAt: Date;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  project: Project;
  vendor: Vendor;
  items: {
    material: Material;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    deliveryDate: Date;
    receivedQuantity: number;
  }[];
  totalAmount: number;
  paymentTerms: string;
  deliveryAddress: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'completed' | 'cancelled';
  approvedBy: User;
  approvedAt: Date;
  createdAt: Date;
}

export interface ProgressTask {
  taskId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  assignedTo?: User;
  dependencies: string[];
  materials: {
    material: Material;
    requiredQuantity: number;
    availableQuantity: number;
  }[];
}

export interface ProgressSchedule {
  _id: string;
  project: Project;
  tasks: ProgressTask[];
  overallProgress: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface Alert {
  type: 'delay' | 'deadline' | 'delivery_delay';
  priority: 'high' | 'medium' | 'low';
  message: string;
  taskId?: string;
  poNumber?: string;
  delayDays?: number;
  daysLeft?: number;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}