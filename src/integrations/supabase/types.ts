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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alumni_other: {
        Row: {
          batch: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          sort_order: number | null
          track_record: string | null
          updated_at: string | null
        }
        Insert: {
          batch: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          sort_order?: number | null
          track_record?: string | null
          updated_at?: string | null
        }
        Update: {
          batch?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          sort_order?: number | null
          track_record?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alumni_stories: {
        Row: {
          batch: string
          company: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          position: string | null
          quote: string | null
          sector: string
          sort_order: number | null
          story: string | null
          updated_at: string | null
        }
        Insert: {
          batch: string
          company?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          position?: string | null
          quote?: string | null
          sector: string
          sort_order?: number | null
          story?: string | null
          updated_at?: string | null
        }
        Update: {
          batch?: string
          company?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          position?: string | null
          quote?: string | null
          sector?: string
          sort_order?: number | null
          story?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_versions: {
        Row: {
          article_id: string
          author_affiliation: string | null
          category: string
          change_summary: string | null
          content: string
          created_at: string
          created_by: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          related_region: string | null
          status: string | null
          tags: string[] | null
          title: string
          version_number: number
        }
        Insert: {
          article_id: string
          author_affiliation?: string | null
          category: string
          change_summary?: string | null
          content: string
          created_at?: string
          created_by: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          related_region?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          version_number?: number
        }
        Update: {
          article_id?: string
          author_affiliation?: string | null
          category?: string
          change_summary?: string | null
          content?: string
          created_at?: string
          created_by?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          related_region?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_view_tracking: {
        Row: {
          article_id: string
          id: string
          ip_address: string
          last_viewed: string
        }
        Insert: {
          article_id: string
          id?: string
          ip_address: string
          last_viewed?: string
        }
        Update: {
          article_id?: string
          id?: string
          ip_address?: string
          last_viewed?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_view_tracking_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author_affiliation:
            | Database["public"]["Enums"]["author_affiliation"]
            | null
          author_id: string
          category: Database["public"]["Enums"]["article_category"]
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_pinned: boolean | null
          media_urls: Json | null
          needs_approval: boolean | null
          pinned_at: string | null
          pinned_by: string | null
          published_at: string | null
          rejection_reason: string | null
          related_region: string | null
          revision_notes: string | null
          revision_requested_at: string | null
          revision_requested_by: string | null
          scheduled_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author_affiliation?:
            | Database["public"]["Enums"]["author_affiliation"]
            | null
          author_id: string
          category: Database["public"]["Enums"]["article_category"]
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_pinned?: boolean | null
          media_urls?: Json | null
          needs_approval?: boolean | null
          pinned_at?: string | null
          pinned_by?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          related_region?: string | null
          revision_notes?: string | null
          revision_requested_at?: string | null
          revision_requested_by?: string | null
          scheduled_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author_affiliation?:
            | Database["public"]["Enums"]["author_affiliation"]
            | null
          author_id?: string
          category?: Database["public"]["Enums"]["article_category"]
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_pinned?: boolean | null
          media_urls?: Json | null
          needs_approval?: boolean | null
          pinned_at?: string | null
          pinned_by?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          related_region?: string | null
          revision_notes?: string | null
          revision_requested_at?: string | null
          revision_requested_by?: string | null
          scheduled_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blocked_registrations: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          blocked_reason: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          nik: string | null
          phone: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          nik?: string | null
          phone?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          nik?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      dynamic_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          label: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          label: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          label?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string | null
          updated_by: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      featured_videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: []
      }
      fim_clubs: {
        Row: {
          activities: string[] | null
          category: string
          created_at: string | null
          description: string | null
          email: string | null
          icon: string
          id: string
          instagram: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          activities?: string[] | null
          category: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          icon?: string
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          activities?: string[] | null
          category?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          icon?: string
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fim_regionals: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          island: string
          logo_url: string | null
          name: string
          province: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          island: string
          logo_url?: string | null
          name: string
          province: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          island?: string
          logo_url?: string | null
          name?: string
          province?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fim_registrations: {
        Row: {
          admin_selection_note: string | null
          auth_user_id: string | null
          batch_id: string | null
          created_at: string | null
          email: string
          email_verification_expires_at: string | null
          email_verification_token: string | null
          email_verified: boolean | null
          email_verified_at: string | null
          final_result: string | null
          full_name: string
          id: string
          interview_date: string | null
          interview_note: string | null
          note_visible_to_applicant: boolean | null
          phone: string | null
          phone_country_code: string | null
          photo_url: string | null
          registration_status: string | null
          selection_passed: boolean | null
          selection_stage: string | null
          updated_at: string | null
          verification_attempts: number | null
        }
        Insert: {
          admin_selection_note?: string | null
          auth_user_id?: string | null
          batch_id?: string | null
          created_at?: string | null
          email: string
          email_verification_expires_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          final_result?: string | null
          full_name: string
          id?: string
          interview_date?: string | null
          interview_note?: string | null
          note_visible_to_applicant?: boolean | null
          phone?: string | null
          phone_country_code?: string | null
          photo_url?: string | null
          registration_status?: string | null
          selection_passed?: boolean | null
          selection_stage?: string | null
          updated_at?: string | null
          verification_attempts?: number | null
        }
        Update: {
          admin_selection_note?: string | null
          auth_user_id?: string | null
          batch_id?: string | null
          created_at?: string | null
          email?: string
          email_verification_expires_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          final_result?: string | null
          full_name?: string
          id?: string
          interview_date?: string | null
          interview_note?: string | null
          note_visible_to_applicant?: boolean | null
          phone?: string | null
          phone_country_code?: string | null
          photo_url?: string | null
          registration_status?: string | null
          selection_passed?: boolean | null
          selection_stage?: string | null
          updated_at?: string | null
          verification_attempts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fim_registrations_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "registration_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      fim_training_registrations: {
        Row: {
          achievements: Json | null
          address: string | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          completion_percentage: number | null
          created_at: string | null
          education: string | null
          gender: string | null
          graduation_year: string | null
          how_did_you_know: string | null
          id: string
          impact_expected: string | null
          institution: string | null
          is_submitted: boolean | null
          last_saved_at: string | null
          major: string | null
          motivation: string | null
          nik: string | null
          occupation: string | null
          organization: string | null
          organizational_experience: Json | null
          province: string | null
          recommendation_file_url: string | null
          recommender_duration: string | null
          recommender_email: string | null
          recommender_name: string | null
          recommender_phone: string | null
          recommender_position: string | null
          registration_id: string | null
          social_contribution_experience: string | null
          social_issue_concern: string | null
          strategic_contribution_plan: string | null
          submitted_at: string | null
          updated_at: string | null
          why_join_fim: string | null
        }
        Insert: {
          achievements?: Json | null
          address?: string | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          education?: string | null
          gender?: string | null
          graduation_year?: string | null
          how_did_you_know?: string | null
          id?: string
          impact_expected?: string | null
          institution?: string | null
          is_submitted?: boolean | null
          last_saved_at?: string | null
          major?: string | null
          motivation?: string | null
          nik?: string | null
          occupation?: string | null
          organization?: string | null
          organizational_experience?: Json | null
          province?: string | null
          recommendation_file_url?: string | null
          recommender_duration?: string | null
          recommender_email?: string | null
          recommender_name?: string | null
          recommender_phone?: string | null
          recommender_position?: string | null
          registration_id?: string | null
          social_contribution_experience?: string | null
          social_issue_concern?: string | null
          strategic_contribution_plan?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          why_join_fim?: string | null
        }
        Update: {
          achievements?: Json | null
          address?: string | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          education?: string | null
          gender?: string | null
          graduation_year?: string | null
          how_did_you_know?: string | null
          id?: string
          impact_expected?: string | null
          institution?: string | null
          is_submitted?: boolean | null
          last_saved_at?: string | null
          major?: string | null
          motivation?: string | null
          nik?: string | null
          occupation?: string | null
          organization?: string | null
          organizational_experience?: Json | null
          province?: string | null
          recommendation_file_url?: string | null
          recommender_duration?: string | null
          recommender_email?: string | null
          recommender_name?: string | null
          recommender_phone?: string | null
          recommender_position?: string | null
          registration_id?: string | null
          social_contribution_experience?: string | null
          social_issue_concern?: string | null
          strategic_contribution_plan?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          why_join_fim?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fim_training_registrations_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "fim_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          id: string
          interview_feedback: string | null
          interviewer_name: string | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          registration_id: string
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          scheduled_date: string
          scheduled_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          interview_feedback?: string | null
          interviewer_name?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          registration_id: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          interview_feedback?: string | null
          interviewer_name?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          registration_id?: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_schedules_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "fim_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success: boolean
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscription_attempts: {
        Row: {
          attempted_at: string
          email: string
          id: string
          ip_address: string
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
          ip_address: string
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      partner_logos: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      prd_changelog: {
        Row: {
          changes: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          release_date: string | null
          title: string
          version: string
        }
        Insert: {
          changes?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          release_date?: string | null
          title: string
          version: string
        }
        Update: {
          changes?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          release_date?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      prd_documents: {
        Row: {
          assigned_to: string | null
          category: string
          completed_at: string | null
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          must_change_password: boolean | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          must_change_password?: boolean | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          must_change_password?: boolean | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      recruiter_assignments: {
        Row: {
          assigned_by: string | null
          assigned_to: string
          assignment_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          registration_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to: string
          assignment_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          registration_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string
          assignment_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          registration_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_assignments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "fim_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          registration_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          registration_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          registration_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_activity_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "fim_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_settings: {
        Row: {
          batch_name: string
          batch_number: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_registration_open: boolean
          max_participants: number | null
          registration_end_date: string | null
          registration_start_date: string | null
          updated_at: string
        }
        Insert: {
          batch_name: string
          batch_number: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_registration_open?: boolean
          max_participants?: number | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          updated_at?: string
        }
        Update: {
          batch_name?: string
          batch_number?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_registration_open?: boolean
          max_participants?: number | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          permission_key: string
          role_id: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          permission_key: string
          role_id: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          permission_key?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "dynamic_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_broadcasts: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          error_message: string | null
          failed_count: number | null
          id: string
          scheduled_at: string
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          error_message?: string | null
          failed_count?: number | null
          id?: string
          scheduled_at: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          error_message?: string | null
          failed_count?: number | null
          id?: string
          scheduled_at?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          key: string
          language: string
          updated_at: string | null
          value: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          key: string
          language: string
          updated_at?: string | null
          value: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          key?: string
          language?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      unauthorized_access_attempts: {
        Row: {
          attempted_path: string
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          user_role: string | null
          username: string | null
        }
        Insert: {
          attempted_path: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          user_role?: string | null
          username?: string | null
        }
        Update: {
          attempted_path?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          user_role?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_dynamic_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dynamic_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "dynamic_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_testimonials: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          speaker: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          youtube_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          speaker?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          youtube_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          speaker?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          youtube_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_login_rate_limit: {
        Args: { p_email: string; p_ip: string }
        Returns: {
          attempts_count: number
          is_blocked: boolean
          should_show_captcha: boolean
        }[]
      }
      cleanup_old_subscription_attempts: { Args: never; Returns: undefined }
      cleanup_old_view_tracking: { Args: never; Returns: undefined }
      get_next_article_version: {
        Args: { p_article_id: string }
        Returns: number
      }
      has_permission: {
        Args: { _action?: string; _permission_key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_view_count: { Args: { article_id: string }; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit_event:
        | {
            Args: {
              p_action: string
              p_details?: Json
              p_ip_address?: string
              p_resource_id?: string
              p_resource_type?: string
              p_user_agent?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_action: string
              p_details?: Json
              p_ip_address?: string
              p_resource_id?: string
              p_resource_type?: string
              p_user_agent?: string
              p_user_id: string
            }
            Returns: string
          }
      publish_scheduled_articles: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "super_admin" | "moderator" | "admin"
      article_category:
        | "pengumuman"
        | "prestasi"
        | "kegiatan"
        | "sosial"
        | "opini"
        | "tips"
      article_status:
        | "draft"
        | "scheduled"
        | "published"
        | "archived"
        | "rejected"
      author_affiliation: "fim_pusat" | "fim_club" | "fim_regional"
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
      app_role: ["super_admin", "moderator", "admin"],
      article_category: [
        "pengumuman",
        "prestasi",
        "kegiatan",
        "sosial",
        "opini",
        "tips",
      ],
      article_status: [
        "draft",
        "scheduled",
        "published",
        "archived",
        "rejected",
      ],
      author_affiliation: ["fim_pusat", "fim_club", "fim_regional"],
    },
  },
} as const
