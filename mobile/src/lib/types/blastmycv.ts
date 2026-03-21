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

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary?: string;
  description: string;
  requirements?: string[];
  postedAt: string;
  logo?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected';
  appliedAt: string;
  updatedAt: string;
  logo?: string;
}

export interface CVSection {
  id: string;
  type: 'experience' | 'education' | 'skills' | 'summary';
  title: string;
  content: string;
  order: number;
}

export interface CV {
  id: string;
  userId: string;
  title: string;
  sections: CVSection[];
  updatedAt: string;
}

export interface DashboardStats {
  totalApplications: number;
  profileViews: number;
  jobMatches: number;
  interviewsScheduled: number;
}
