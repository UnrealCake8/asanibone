export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" }
  public: {
    Tables: {
      order_events: {
        Row: { created_at: string; id: number; note: string | null; order_id: string; status: Database["public"]["Enums"]["order_status"] }
        Insert: { created_at?: string; id?: never; note?: string | null; order_id: string; status: Database["public"]["Enums"]["order_status"] }
        Update: { created_at?: string; id?: never; note?: string | null; order_id?: string; status?: Database["public"]["Enums"]["order_status"] }
        Relationships: [{ foreignKeyName: "order_events_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]
      }
      orders: {
        Row: {
          courier_provider: string; courier_reference: string | null; created_at: string; delivery_address: string;
          delivery_fee: number; delivery_notes: string | null; estimated_item_price: number; final_item_price: number | null;
          id: string; item_allowance: number; item_description: string; payment_fee: number; phone: string; price_buffer: number;
          product_url: string | null; quoted_total: number; receipt_url: string | null; service_fee: number;
          status: Database["public"]["Enums"]["order_status"]; store_location: string; store_name: string; updated_at: string;
          user_id: string; ziina_payment_intent_id: string | null
        }
        Insert: never
        Update: never
        Relationships: []
      }
      profiles: {
        Row: { created_at: string; full_name: string | null; id: string; phone: string | null; role: string; updated_at: string }
        Insert: { created_at?: string; full_name?: string | null; id: string; phone?: string | null; role?: string; updated_at?: string }
        Update: { full_name?: string | null; phone?: string | null }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      create_order: {
        Args: {
          p_buffer: number
          p_delivery_address: string
          p_delivery_notes: string
          p_estimate: number
          p_item_description: string
          p_phone: string
          p_product_url: string
          p_store_location: string
          p_store_name: string
        }
        Returns: Database["public"]["Tables"]["orders"]["Row"]
      }
    }
    Enums: {
      order_status:
        | "draft" | "awaiting_payment" | "paid" | "finding_courier" | "courier_assigned"
        | "heading_to_store" | "at_store" | "purchased" | "delivering" | "delivered" | "cancelled" | "failed"
    }
    CompositeTypes: { [_ in never]: never }
  }
}
