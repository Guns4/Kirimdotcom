export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            orders: {
                Row: {
                    id: string
                    user_id: string
                    customer_name: string
                    customer_phone: string | null
                    product_name: string
                    price: number
                    resi_number: string | null
                    courier: string | null
                    status: 'Unpaid' | 'Paid' | 'Shipped' | 'Done' | 'Cancelled' | 'Returned'
                    tracking_status: string
                    created_at: string
                    updated_at: string
                    last_tracking_check: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    customer_name: string
                    customer_phone?: string | null
                    product_name: string
                    price?: number
                    resi_number?: string | null
                    courier?: string | null
                    status?: 'Unpaid' | 'Paid' | 'Shipped' | 'Done' | 'Cancelled' | 'Returned'
                    tracking_status?: string
                    created_at?: string
                    updated_at?: string
                    last_tracking_check?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    customer_name?: string
                    customer_phone?: string | null
                    product_name?: string
                    price?: number
                    resi_number?: string | null
                    courier?: string | null
                    status?: 'Unpaid' | 'Paid' | 'Shipped' | 'Done' | 'Cancelled' | 'Returned'
                    tracking_status?: string
                    created_at?: string
                    updated_at?: string
                    last_tracking_check?: string | null
                }
            }
            api_keys: {
                Row: {
                    id: string
                    user_id: string
                    secret_key: string
                    status: 'active' | 'revoked'
                    monthly_quota: number
                    current_usage: number
                    created_at: string
                    last_used_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    secret_key: string
                    status?: 'active' | 'revoked'
                    monthly_quota?: number
                    current_usage?: number
                    created_at?: string
                    last_used_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    secret_key?: string
                    status?: 'active' | 'revoked'
                    monthly_quota?: number
                    current_usage?: number
                    created_at?: string
                    last_used_at?: string | null
                }
            }
            cached_resi: {
                Row: {
                    id: string
                    waybill: string
                    courier: string
                    status_code: string | null
                    is_delivered: boolean
                    last_updated: string
                    raw_data: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    waybill: string
                    courier: string
                    status_code?: string | null
                    is_delivered?: boolean
                    last_updated?: string
                    raw_data?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    waybill?: string
                    courier?: string
                    status_code?: string | null
                    is_delivered?: boolean
                    last_updated?: string
                    raw_data?: Json | null
                    created_at?: string
                }
            }
            search_history: {
                Row: {
                    id: string
                    user_id: string
                    type: 'resi' | 'ongkir'
                    query: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: 'resi' | 'ongkir'
                    query: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'resi' | 'ongkir'
                    query?: string
                    created_at?: string
                }
            }
        }
    }
}
