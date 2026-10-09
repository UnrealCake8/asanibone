export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      order_events: {
        Row: {
          created_at: string
          id: number
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          created_at?: string
          id?: never
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          created_at?: string
          id?: never
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          active: boolean
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          merchant_id: string
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          merchant_id: string
          name: string
          price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          merchant_id?: string
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          courier_provider: string
          courier_reference: string | null
          created_at: string
          delivery_address: string
          delivery_fee: number
          delivery_notes: string | null
          estimated_item_price: number
          final_item_price: number | null
          id: string
          item_allowance: number
          item_description: string
          payment_fee: number
          phone: string
          price_buffer: number
          product_url: string | null
          quoted_total: number
          receipt_url: string | null
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          store_location: string
          store_name: string
          updated_at: string
          user_id: string
          ngenius_order_reference: string | null
          ziina_payment_intent_id: string | null
        }
        Insert: {
          courier_provider?: string
          courier_reference?: string | null
          created_at?: string
          delivery_address: string
          delivery_fee: number
          delivery_notes?: string | null
          estimated_item_price: number
          final_item_price?: number | null
          id?: string
          item_allowance: number
          item_description: string
          payment_fee: number
          phone: string
          price_buffer?: number
          product_url?: string | null
          quoted_total: number
          receipt_url?: string | null
          service_fee: number
          status?: Database["public"]["Enums"]["order_status"]
          store_location: string
          store_name: string
          updated_at?: string
          user_id: string
          ngenius_order_reference?: string | null
          ziina_payment_intent_id?: string | null
        }
        Update: {
          courier_provider?: string
          courier_reference?: string | null
          created_at?: string
          delivery_address?: string
          delivery_fee?: number
          delivery_notes?: string | null
          estimated_item_price?: number
          final_item_price?: number | null
          id?: string
          item_allowance?: number
          item_description?: string
          payment_fee?: number
          phone?: string
          price_buffer?: number
          product_url?: string | null
          quoted_total?: number
          receipt_url?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          store_location?: string
          store_name?: string
          updated_at?: string
          user_id?: string
          ngenius_order_reference?: string | null
          ziina_payment_intent_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_orders: {
        Args: never
        Returns: {
          courier_provider: string
          courier_reference: string | null
          created_at: string
          delivery_address: string
          delivery_fee: number
          delivery_notes: string | null
          estimated_item_price: number
          final_item_price: number | null
          id: string
          item_allowance: number
          item_description: string
          payment_fee: number
          phone: string
          price_buffer: number
          product_url: string | null
          quoted_total: number
          receipt_url: string | null
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          store_location: string
          store_name: string
          updated_at: string
          user_id: string
          ngenius_order_reference: string | null
          ziina_payment_intent_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_update_order_status: {
        Args: {
          p_note?: string
          p_order_id: string
          p_status: Database["public"]["Enums"]["order_status"]
        }
        Returns: {
          courier_provider: string
          courier_reference: string | null
          created_at: string
          delivery_address: string
          delivery_fee: number
          delivery_notes: string | null
          estimated_item_price: number
          final_item_price: number | null
          id: string
          item_allowance: number
          item_description: string
          payment_fee: number
          phone: string
          price_buffer: number
          product_url: string | null
          quoted_total: number
          receipt_url: string | null
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          store_location: string
          store_name: string
          updated_at: string
          user_id: string
          ngenius_order_reference: string | null
          ziina_payment_intent_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
        Returns: {
          courier_provider: string
          courier_reference: string | null
          created_at: string
          delivery_address: string
          delivery_fee: number
          delivery_notes: string | null
          estimated_item_price: number
          final_item_price: number | null
          id: string
          item_allowance: number
          item_description: string
          payment_fee: number
          phone: string
          price_buffer: number
          product_url: string | null
          quoted_total: number
          receipt_url: string | null
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          store_location: string
          store_name: string
          updated_at: string
          user_id: string
          ngenius_order_reference: string | null
          ziina_payment_intent_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      order_status:
        | "draft"
        | "awaiting_payment"
        | "paid"
        | "finding_courier"
        | "courier_assigned"
        | "heading_to_store"
        | "at_store"
        | "purchased"
        | "delivering"
        | "delivered"
        | "cancelled"
        | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "draft",
        "awaiting_payment",
        "paid",
        "finding_courier",
        "courier_assigned",
        "heading_to_store",
        "at_store",
        "purchased",
        "delivering",
        "delivered",
        "cancelled",
        "failed",
      ],
    },
  },
} as const
