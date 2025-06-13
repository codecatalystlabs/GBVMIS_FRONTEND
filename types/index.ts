

export interface PoliceOfficer {
    ID: number;
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
