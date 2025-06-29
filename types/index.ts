export interface PoliceOfficer {
  id: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  first_name: string;
  last_name: string;
  rank: string;
  badge_no: string;
  phone: string;
  post_id: number;
  username: string;
  email: string;
  roles: any | null;
  cases: any | null;
}

export interface PolicePost {
  id: number;
  name: string;
  location: string;
  contact: string;
  officers: Partial<PoliceOfficer>;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface Victim {
  ID: number;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
}

// API Response wrapper interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}