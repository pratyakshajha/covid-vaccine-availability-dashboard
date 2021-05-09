export interface TableData {
  session_date: Date;
  name: string;
  address: string;
  pincode: number;
  fee_type: string;
  available_capacity: number;
  min_age_limit: number;
  vaccine: string;
  google_map: string;
}

export interface Center {
  center_id: number;
  name: string;
  address: string;
  block_name: string;
  district_name: string;
  state_name: string;
  pincode: number;
  lat: number;
  long: number;
  fee_type: string;
  sessions: Session[];
}

export interface Session {
  sessionId: string;
  date: Date;
  available_capacity: number;
  min_age_limit: number;
  vaccine: string;
  slots: string[];
}

export interface Session {
  center_id: number;
  name: string;
  address: string;
  block_name: string;
  district_name: string;
  state_name: string;
  pincode: number;
  lat: number;
  long: number;
  session_id: string;
  date: Date;
  available_capacity: number;
  fee: number;
  min_age_limit: number;
  vaccine: string;
  google_map: string;
  slots: string[];
}

export interface District {
  district_id: number;
  district_name: string;
}