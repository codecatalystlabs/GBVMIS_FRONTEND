export interface PoliceOfficer {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  first_name: string;
  last_name: string;
  rank: string;
  badge_no: string;
  phone: string;
  post_id: number;
  username: string;
  email: string;
  roles: any | null; // Replace with Role[] if roles are arrays
  cases: any | null; // Replace with Case[] if cases are arrays
}

export interface PolicePost {
  updatedAt: string | number | Date;
  id: number;
  name: string;
  location: string;
  contact: string;
  officers: PoliceOfficer[]; // Changed to array to match typical API response
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
  id: number | string;
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

export interface Suspect {
  id: number | string;
  first_name: string;
  last_name: string;
  gender?: string;
  nin?: string;
  address?: string;
  // Add other fields as per your API
}

export interface CaseCharge {
  id?: number; // Added id for potential uniqueness
  charge_title: string;
  description: string;
  severity: string;
}

export interface Case {
  id?: number; // Made optional to match API response variability
  case_number: string;
  title: string;
  status: string;
  date_opened: string;
  officer_id?: number;
  police_post_id?: number;
  suspect_ids?: number[];
  victim_ids?: number[];
  description?: string;
  suspects?: Suspect[]; // Changed to array of Suspect
  victims?: Victim[]; // Changed to array of Victim
  charges?: CaseCharge[]; // Array of charges
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