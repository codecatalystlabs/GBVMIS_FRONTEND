

import { ReactNode } from "react";

// Suspect interface (simplified to match CasesTable usage)
export interface Suspect {
  id: number;
  first_name: string;
  last_name: string;
  gender?: string;
  nin?: string;
  address?: string;
}

// Victim interface (simplified to match CasesTable usage)
export interface Victim {
  id: number;
  first_name: string;
  last_name: string;
  gender?: string;
  phone_number?: string;
}

// Case interface (updated to fix suspects, victims, id, and title)
export interface Case {
  id: number; // Made non-optional to resolve c.id?.toString() warning
  case_number: string;
  charges: CaseCharge[];
  date_opened: string;
  description: string;
  officer_id: number;
  police_post_id: number;
  status: string;
  title: string; // Changed from ReactNode to string to match usage
  suspect_ids: number[];
  victim_ids: number[];
  suspects?: Suspect[]; // Changed from function to array to fix map warning
  victims?: Victim[]; // Changed from function to array to fix map warning
  created_at?: string;
  updated_at?: string;
}

// CaseCharge interface (unchanged)
export interface CaseCharge {
  charge_title: string;
  description: string;
  severity: string;
}

// Charge interface (unchanged)
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

// PoliceOfficer interface (unchanged)
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

// PolicePost interface (unchanged)
export interface PolicePost {
  id: number;
  name: string;
  location: string;
  contact: string;
  officers: Partial<PoliceOfficer>;
  created_at: string;
}

// Examination interface (unchanged)
export interface Examination {
  id: number;
  victim_id: number;
  case_id: number;
  findings: string;
  examiner: string;
  exam_date: string;
  facility_id?: number;
  practitioner_id?: number;
  consent_given?: boolean;
  referral?: string;
  treatment?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response wrappers (unchanged)
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