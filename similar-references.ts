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
      audience_reactions: {
        Row: {
          age_range: string | null
          created_at: string
          id: string
          persona_attributes: Json | null
          persona_description: string | null
          persona_label: string
          predicted_action: string | null
          reaction_text: string | null
          run_id: string
          sentiment: number | null
          sentiment_label: string | null
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          id?: string
          persona_attributes?: Json | null
          persona_description?: string | null
          persona_label: string
          predicted_action?: string | null
          reaction_text?: string | null
          run_id: string
          sentiment?: number | null
          sentiment_label?: string | null
        }
        Update: {
          age_range?: string | null
          created_at?: string
          id?: string
          persona_attributes?: Json | null
          persona_description?: string | null
          persona_label?: string
          predicted_action?: string | null
          reaction_text?: string | null
          run_id?: string
          sentiment?: number | null
          sentiment_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audience_reactions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "simulation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_waitlist: {
        Row: {
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["connection_platform"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: Database["public"]["Enums"]["connection_platform"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["connection_platform"]
          user_id?: string
        }
        Relationships: []
      }
      content_submissions: {
        Row: {
          audience_description: string | null
          audience_tags: string[] | null
          caption: string | null
          created_at: string
          created_by_user_id: string
          deleted_at: string | null
          goal: string | null
          goal_custom: string | null
          id: string
          media_duration_seconds: number | null
          media_extracted_metadata: Json | null
          media_size_bytes: number | null
          media_url: string | null
          organization_id: string
          raw_media_expires_at: string | null
          script: string | null
          target_platform: Database["public"]["Enums"]["platform"]
          updated_at: string
        }
        Insert: {
          audience_description?: string | null
          audience_tags?: string[] | null
          caption?: string | null
          created_at?: string
          created_by_user_id: string
          deleted_at?: string | null
          goal?: string | null
          goal_custom?: string | null
          id?: string
          media_duration_seconds?: number | null
          media_extracted_metadata?: Json | null
          media_size_bytes?: number | null
          media_url?: string | null
          organization_id: string
          raw_media_expires_at?: string | null
          script?: string | null
          target_platform: Database["public"]["Enums"]["platform"]
          updated_at?: string
        }
        Update: {
          audience_description?: string | null
          audience_tags?: string[] | null
          caption?: string | null
          created_at?: string
          created_by_user_id?: string
          deleted_at?: string | null
          goal?: string | null
          goal_custom?: string | null
          id?: string
          media_duration_seconds?: number | null
          media_extracted_metadata?: Json | null
          media_size_bytes?: number | null
          media_url?: string | null
          organization_id?: string
          raw_media_expires_at?: string | null
          script?: string | null
          target_platform?: Database["public"]["Enums"]["platform"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_usage: {
        Row: {
          billable_simulations: number
          created_at: string
          id: string
          organization_id: string | null
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billable_simulations?: number
          created_at?: string
          id?: string
          organization_id?: string | null
          period_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billable_simulations?: number
          created_at?: string
          id?: string
          organization_id?: string | null
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string
          organization_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          name: string
          plan: Database["public"]["Enums"]["org_plan"]
          seat_count: number
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["org_plan"]
          seat_count?: number
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["org_plan"]
          seat_count?: number
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
        }
        Relationships: []
      }
      pricing_clicks: {
        Row: {
          billing_period: string
          came_from_route: string | null
          clicked_at: string
          id: string
          tier_clicked: string
          user_id: string | null
        }
        Insert: {
          billing_period: string
          came_from_route?: string | null
          clicked_at?: string
          id?: string
          tier_clicked: string
          user_id?: string | null
        }
        Update: {
          billing_period?: string
          came_from_route?: string | null
          clicked_at?: string
          id?: string
          tier_clicked?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          audience_description: string | null
          audience_size: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          creator_type: string | null
          default_organization_id: string
          display_name: string | null
          id: string
          niche: string | null
          niche_custom: string | null
          onboarding_completed_at: string | null
          onboarding_skipped: boolean
          posting_cadence: string | null
          primary_goal: string | null
          primary_goal_custom: string | null
          primary_niche: string | null
          primary_platform: Database["public"]["Enums"]["platform"] | null
          role: Database["public"]["Enums"]["app_role"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          audience_description?: string | null
          audience_size?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          creator_type?: string | null
          default_organization_id: string
          display_name?: string | null
          id: string
          niche?: string | null
          niche_custom?: string | null
          onboarding_completed_at?: string | null
          onboarding_skipped?: boolean
          posting_cadence?: string | null
          primary_goal?: string | null
          primary_goal_custom?: string | null
          primary_niche?: string | null
          primary_platform?: Database["public"]["Enums"]["platform"] | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          audience_description?: string | null
          audience_size?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          creator_type?: string | null
          default_organization_id?: string
          display_name?: string | null
          id?: string
          niche?: string | null
          niche_custom?: string | null
          onboarding_completed_at?: string | null
          onboarding_skipped?: boolean
          posting_cadence?: string | null
          primary_goal?: string | null
          primary_goal_custom?: string | null
          primary_niche?: string | null
          primary_platform?: Database["public"]["Enums"]["platform"] | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          category: string | null
          created_at: string
          detail: string | null
          done_at: string | null
          id: string
          is_done: boolean
          predicted_lift: number | null
          predicted_score_lift: number | null
          priority: number | null
          run_id: string
          sort_order: number
          suggestion: string
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          detail?: string | null
          done_at?: string | null
          id?: string
          is_done?: boolean
          predicted_lift?: number | null
          predicted_score_lift?: number | null
          priority?: number | null
          run_id: string
          sort_order?: number
          suggestion: string
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          detail?: string | null
          done_at?: string | null
          id?: string
          is_done?: boolean
          predicted_lift?: number | null
          predicted_score_lift?: number | null
          priority?: number | null
          run_id?: string
          sort_order?: number
          suggestion?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "simulation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_patterns: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          match_status: string
          run_id: string
          sort_order: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          match_status: string
          run_id: string
          sort_order?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          match_status?: string
          run_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_patterns_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "simulation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      similar_references: {
        Row: {
          created_at: string
          creator_handle: string | null
          id: string
          platform: Database["public"]["Enums"]["platform"] | null
          reasoning: string | null
          reference_title: string | null
          reference_url: string | null
          run_id: string
          similarity_score: number | null
          sort_order: number
          thumbnail_seed: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string
          creator_handle?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["platform"] | null
          reasoning?: string | null
          reference_title?: string | null
          reference_url?: string | null
          run_id: string
          similarity_score?: number | null
          sort_order?: number
          thumbnail_seed?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string
          creator_handle?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["platform"] | null
          reasoning?: string | null
          reference_title?: string | null
          reference_url?: string | null
          run_id?: string
          similarity_score?: number | null
          sort_order?: number
          thumbnail_seed?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "similar_references_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "simulation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_runs: {
        Row: {
          billable_reason: Database["public"]["Enums"]["billable_reason"] | null
          confidence: Database["public"]["Enums"]["confidence_level"] | null
          created_at: string
          error_message: string | null
          generated_at: string | null
          id: string
          is_billable: boolean
          raw_response: Json | null
          reach_high: number | null
          reach_low: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["simulation_status"]
          submission_id: string
          submission_snapshot: Json
          triggered_by_user_id: string
          virality_score: number | null
        }
        Insert: {
          billable_reason?:
            | Database["public"]["Enums"]["billable_reason"]
            | null
          confidence?: Database["public"]["Enums"]["confidence_level"] | null
          created_at?: string
          error_message?: string | null
          generated_at?: string | null
          id?: string
          is_billable?: boolean
          raw_response?: Json | null
          reach_high?: number | null
          reach_low?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["simulation_status"]
          submission_id: string
          submission_snapshot?: Json
          triggered_by_user_id: string
          virality_score?: number | null
        }
        Update: {
          billable_reason?:
            | Database["public"]["Enums"]["billable_reason"]
            | null
          confidence?: Database["public"]["Enums"]["confidence_level"] | null
          created_at?: string
          error_message?: string | null
          generated_at?: string | null
          id?: string
          is_billable?: boolean
          raw_response?: Json | null
          reach_high?: number | null
          reach_low?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["simulation_status"]
          submission_id?: string
          submission_snapshot?: Json
          triggered_by_user_id?: string
          virality_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_runs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "content_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      style_profiles: {
        Row: {
          created_at: string
          embedding_version: string | null
          id: string
          last_trained_at: string | null
          patterns: Json
          sample_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          embedding_version?: string | null
          id?: string
          last_trained_at?: string | null
          patterns?: Json
          sample_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          embedding_version?: string | null
          id?: string
          last_trained_at?: string | null
          patterns?: Json
          sample_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_run: {
        Args: { _run_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_submission: {
        Args: { _submission_id: string; _user_id: string }
        Returns: boolean
      }
      has_org_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["org_member_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "creator" | "team_member"
      billable_reason: "compute_started" | "ai_inference_ran" | "gpu_used"
      confidence_level: "low" | "medium" | "high"
      connection_platform: "instagram" | "tiktok" | "youtube" | "facebook"
      org_member_role: "owner" | "admin" | "member"
      org_plan: "team" | "enterprise"
      org_type: "personal" | "team"
      platform: "tiktok" | "instagram" | "youtube" | "facebook" | "other"
      simulation_status: "queued" | "running" | "succeeded" | "failed"
      subscription_tier: "free" | "pro" | "team" | "enterprise"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["creator", "team_member"],
      billable_reason: ["compute_started", "ai_inference_ran", "gpu_used"],
      confidence_level: ["low", "medium", "high"],
      connection_platform: ["instagram", "tiktok", "youtube", "facebook"],
      org_member_role: ["owner", "admin", "member"],
      org_plan: ["team", "enterprise"],
      org_type: ["personal", "team"],
      platform: ["tiktok", "instagram", "youtube", "facebook", "other"],
      simulation_status: ["queued", "running", "succeeded", "failed"],
      subscription_tier: ["free", "pro", "team", "enterprise"],
    },
  },
} as const
