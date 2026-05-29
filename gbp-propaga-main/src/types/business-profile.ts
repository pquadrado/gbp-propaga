export interface BusinessProfile {
  name: string;
  phone_primary: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  channels: string[];
  phone_whatsapp?: string;
  website?: string;
  email?: string;
  description?: string;
  business_hours?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  categories?: string[];
  external_id?: string;
}

export interface ChannelResult {
  status: 'pending' | 'syncing' | 'success' | 'sent' | 'error';
  message?: string;
  statusCode?: number;
  durationMs?: number;
}

export interface SyncResponse {
  success: boolean;
  sync_id: string;
  timestamp: string;
  results: Record<string, ChannelResult>;
}

export interface DirectoryChannel {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  requires_approval: boolean;
  categories: string[];
}

export type BusinessType =
  | 'general'
  | 'restaurants'
  | 'healthcare'
  | 'real_estate'
  | 'services'
  | 'hotels';
