export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      benchmark_metrics: {
        Row: {
          component_id: number | null
          metrics_json: Json | null
        }
        Insert: {
          component_id?: number | null
          metrics_json?: Json | null
        }
        Update: {
          component_id?: number | null
          metrics_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_benchmark_metrics_component_id"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      component_variants: {
        Row: {
          component_id: number | null
          image_url: string | null
          in_stock: boolean | null
          price: number | null
          product_id: number
          updated_at: string | null
          variant_spec_json: Json | null
        }
        Insert: {
          component_id?: number | null
          image_url?: string | null
          in_stock?: boolean | null
          price?: number | null
          product_id: number
          updated_at?: string | null
          variant_spec_json?: Json | null
        }
        Update: {
          component_id?: number | null
          image_url?: string | null
          in_stock?: boolean | null
          price?: number | null
          product_id?: number
          updated_at?: string | null
          variant_spec_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_component_variants_component_id"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      components: {
        Row: {
          base_spec_json: Json | null
          category: string | null
          id: number
          name: string | null
          updated_at: string | null
        }
        Insert: {
          base_spec_json?: Json | null
          category?: string | null
          id: number
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          base_spec_json?: Json | null
          category?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      demo_compatibility: {
        Row: {
          compat: Json | null
          created_at: string
          id: number
        }
        Insert: {
          compat?: Json | null
          created_at?: string
          id?: number
        }
        Update: {
          compat?: Json | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      estimate_items: {
        Row: {
          component_score_json: Json | null
          estimate_id: number | null
          id: number
          product_id: number | null
          quantity: number | null
          selection_reason: string | null
        }
        Insert: {
          component_score_json?: Json | null
          estimate_id?: number | null
          id: number
          product_id?: number | null
          quantity?: number | null
          selection_reason?: string | null
        }
        Update: {
          component_score_json?: Json | null
          estimate_id?: number | null
          id?: number
          product_id?: number | null
          quantity?: number | null
          selection_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_estimate_items_estimate_id"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimate_items_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "component_variants"
            referencedColumns: ["product_id"]
          },
        ]
      }
      estimates: {
        Row: {
          compatibility: boolean | null
          compatibility_json: Json | null
          created_at: string | null
          id: number
          metrics_score_json: Json | null
          overall_reason: string | null
          purpose: string | null
          total_price: number | null
          user_id: number | null
        }
        Insert: {
          compatibility?: boolean | null
          compatibility_json?: Json | null
          created_at?: string | null
          id: number
          metrics_score_json?: Json | null
          overall_reason?: string | null
          purpose?: string | null
          total_price?: number | null
          user_id?: number | null
        }
        Update: {
          compatibility?: boolean | null
          compatibility_json?: Json | null
          created_at?: string | null
          id?: number
          metrics_score_json?: Json | null
          overall_reason?: string | null
          purpose?: string | null
          total_price?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_estimates_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string | null
          id: number
          input_text: string | null
          response_json: Json | null
          role: string | null
          session_id: number | null
        }
        Insert: {
          created_at?: string | null
          id: number
          input_text?: string | null
          response_json?: Json | null
          role?: string | null
          session_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          input_text?: string | null
          response_json?: Json | null
          role?: string | null
          session_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          content_text: string | null
          doc_type: string | null
          id: number
          metadata_json: Json | null
        }
        Insert: {
          content_text?: string | null
          doc_type?: string | null
          id: number
          metadata_json?: Json | null
        }
        Update: {
          content_text?: string | null
          doc_type?: string | null
          id?: number
          metadata_json?: Json | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: number
          session_name: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id: number
          session_name?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: number
          session_name?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: number
          profile: string | null
        }
        Insert: {
          created_at?: string | null
          id: number
          profile?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          profile?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
