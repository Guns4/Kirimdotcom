export interface TrackingHistory {
  date: string;
  desc: string;
  location: string;
}

export interface TrackingSummary {
  awb: string;
  courier: string;
  service: string;
  status: string;
  date: string;
  desc: string;
  weight: string;
  amount: string;
}

export interface TrackingData {
  summary: TrackingSummary;
  detail: string;
  history: TrackingHistory[];
}

export interface OngkirCost {
  value: number;
  etd: string;
  note: string;
}

export interface OngkirService {
  service: string;
  description: string;
  cost: OngkirCost[];
}

export interface CourierRate {
  id: string;
  courier_code: string;
  courier_name: string;
  service: string;
  description: string;
  price: number;
  etd: string;
}
