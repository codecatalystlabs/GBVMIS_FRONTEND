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
  id?: number | string;
  address: string;
  case_ids: number[];
  created_by: string;
  dob: string;
  first_name: string;
  gender: string;
  last_name: string;
  nationality: string;
  nin: string;
  phone_number: string;
  updated_by: string;
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

export interface CaseCharge {
  charge_title: string;
  description: string;
  severity: string;
}

export interface Case {
  id?: number;
  case_number: string;
  charges: CaseCharge[];
  date_opened: string;
  description: string;
  officer_id: number;
  police_post_id: number;
  status: string;
  suspect_ids: number[];
  title: string;
  victim_ids: number[];
  created_at?: string;
  updated_at?: string;
}

export interface Charge {
  id: number;
  case_id: number;
  charge_title: string;
  description: string;
  severity: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: { time: string; valid: boolean };
}

export interface Examination {
  id: number;
  victim_id: string | number;
  findings: string;
  examiner: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}
