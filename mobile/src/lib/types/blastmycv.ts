export interface Package {
  id: number;
  name: string;
  description: string;
  price: string;
  employersReached: string;
  countries: string[];
  features: string[];
  isPopular: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CV {
  id: number;
  userId: number;
  title: string;
  fileName: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  userId: number;
  packageId: number;
  cvId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  targetCountries: string[];
  totalPrice: string;
  package?: Package;
  cv?: CV;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: number;
  orderId: number;
  employerName: string;
  employerEmail?: string;
  country: string;
  status: 'sent' | 'delivered' | 'opened' | 'failed';
  sentAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'order' | 'submission' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  currentLocation?: string;
  jobTitle?: string;
  yearsExperience?: number;
  preferredIndustry?: string;
  createdAt?: string;
}

// Legacy aliases kept for compatibility
export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  postedAt: string;
};

export type Application = Order;

export interface DashboardStats {
  totalOrders: number;
  totalSubmissions: number;
  cvCount: number;
  unreadNotifications: number;
}
