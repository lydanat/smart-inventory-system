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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_feedback: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          id: number
          item_index: number
          rating: string
          recommendation_id: number
          section: string
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          id?: never
          item_index: number
          rating: string
          recommendation_id: number
          section: string
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          id?: never
          item_index?: number
          rating?: string
          recommendation_id?: number
          section?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feedback_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          business_id: string
          expires_at: string
          generated_at: string
          id: number
          input_hash: string
          payload: Json
          source: string
        }
        Insert: {
          business_id: string
          expires_at: string
          generated_at?: string
          id?: never
          input_hash: string
          payload: Json
          source?: string
        }
        Update: {
          business_id?: string
          expires_at?: string
          generated_at?: string
          id?: never
          input_hash?: string
          payload?: Json
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_events: {
        Row: {
          business_id: string
          created_at: string
          dedupe_day: string
          detail: string | null
          id: number
          item_id: string | null
          kind: string
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          dedupe_day?: string
          detail?: string | null
          id?: never
          item_id?: string | null
          kind: string
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          dedupe_day?: string
          detail?: string | null
          id?: never
          item_id?: string | null
          kind?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_events_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          business_id: string
          created_at: string
          entity_id: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          business_id: string
          created_at?: string
          entity_id?: string | null
          id?: never
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          business_id?: string
          created_at?: string
          entity_id?: string | null
          id?: never
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          business_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          alerts_enabled: boolean
          created_at: string
          currency: string
          id: string
          name: string
          plan: string
          telegram_chat_id: number | null
          telegram_linked_at: string | null
          timezone: string
        }
        Insert: {
          alerts_enabled?: boolean
          created_at?: string
          currency?: string
          id?: string
          name: string
          plan?: string
          telegram_chat_id?: number | null
          telegram_linked_at?: string | null
          timezone?: string
        }
        Update: {
          alerts_enabled?: boolean
          created_at?: string
          currency?: string
          id?: string
          name?: string
          plan?: string
          telegram_chat_id?: number | null
          telegram_linked_at?: string | null
          timezone?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          archived_at: string | null
          business_id: string
          category: string
          cost_price: number | null
          created_at: string
          expiry_date: string | null
          id: string
          low_stock_threshold: number
          name: string
          notes: string | null
          price: number
          quantity: number
          sku: string | null
          supplier_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          business_id: string
          category?: string
          cost_price?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          low_stock_threshold?: number
          name: string
          notes?: string | null
          price?: number
          quantity?: number
          sku?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          business_id?: string
          category?: string
          cost_price?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          low_stock_threshold?: number
          name?: string
          notes?: string | null
          price?: number
          quantity?: number
          sku?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count: number
          key: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          delta: number
          id: number
          item_id: string
          note: string | null
          reason: string
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          delta: number
          id?: never
          item_id: string
          note?: string | null
          reason: string
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          delta?: number
          id?: never
          item_id?: string
          note?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          business_id: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          business_id: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          business_id?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_link_codes: {
        Row: {
          business_id: string
          code_hash: string
          created_by: string
          expires_at: string
          used_at: string | null
        }
        Insert: {
          business_id: string
          code_hash: string
          created_by: string
          expires_at: string
          used_at?: string | null
        }
        Update: {
          business_id?: string
          code_hash?: string
          created_by?: string
          expires_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_link_codes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: {
          _delta: number
          _item_id: string
          _note?: string
          _reason: string
        }
        Returns: {
          archived_at: string | null
          business_id: string
          category: string
          cost_price: number | null
          created_at: string
          expiry_date: string | null
          id: string
          low_stock_threshold: number
          name: string
          notes: string | null
          price: number
          quantity: number
          sku: string | null
          supplier_id: string | null
          unit: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      check_rate_limit: {
        Args: { _key: string; _max: number; _window: string }
        Returns: boolean
      }
      dashboard_summary: { Args: { _business_id: string }; Returns: Json }
      is_member: {
        Args: { _business_id: string; _roles?: string[] }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
