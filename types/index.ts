export interface DeletedAt {
  time: string;
  valid: boolean;
}

export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: DeletedAt;
}

export interface PoliceOfficer {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: DeletedAt;
  first_name: string;
  last_name: string;
  rank: string;
  badge_no: string;
  phone: string;
  post_id: number;
  username: string;
  email: string;
  roles: Role[];
  cases: string[];
}

export interface PolicePost {
  id: number;
  name: string;
  location: string;
  contact: string;
  officers: PoliceOfficer[];
  createdAt: string;
  updatedAt: string;
  deletedAt: DeletedAt;
}

export interface Charge {
  id: number;
  case_id: number;
  charge_title: string;
  description: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: DeletedAt;
}

export interface Victim {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  nationality: string;
  nin: string;
  phone_number: string;
  address: string;
  cases: string[];
  createdAt: string;
  updatedAt: string;
  created_by: string;
  updated_by: string;
  deletedAt: DeletedAt;
}

export interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: string;
  date_opened: string;
  officer_id: number;
  police_post_id: number;
  suspect_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: DeletedAt;
  officer: PoliceOfficer;
  policePost: PolicePost;
  charges: Charge[];
  victims: Victim[];
}

export interface CasesResponse {
  data: Case[];
  pagination?: {
    total_items?: number;
    total_pages?: number;
    current_page?: number;
  };
}