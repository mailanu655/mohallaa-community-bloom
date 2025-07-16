export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_clicks: {
        Row: {
          ad_id: string | null
          clicked_at: string
          id: string
          placement_page: string
          viewer_id: string | null
        }
        Insert: {
          ad_id?: string | null
          clicked_at?: string
          id?: string
          placement_page: string
          viewer_id?: string | null
        }
        Update: {
          ad_id?: string | null
          clicked_at?: string
          id?: string
          placement_page?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_clicks_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          ad_id: string | null
          created_at: string
          id: string
          placement_page: string
          viewer_id: string | null
        }
        Insert: {
          ad_id?: string | null
          created_at?: string
          id?: string
          placement_page: string
          viewer_id?: string | null
        }
        Update: {
          ad_id?: string | null
          created_at?: string
          id?: string
          placement_page?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_impressions_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          ad_type: string
          advertiser_id: string | null
          budget_daily: number | null
          budget_total: number | null
          clicks: number | null
          cost_per_click: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          impressions: number | null
          placement_type: string
          spend_total: number | null
          start_date: string | null
          status: string
          target_community_id: string | null
          target_location: string | null
          target_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ad_type: string
          advertiser_id?: string | null
          budget_daily?: number | null
          budget_total?: number | null
          clicks?: number | null
          cost_per_click?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          placement_type: string
          spend_total?: number | null
          start_date?: string | null
          status?: string
          target_community_id?: string | null
          target_location?: string | null
          target_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ad_type?: string
          advertiser_id?: string | null
          budget_daily?: number | null
          budget_total?: number | null
          clicks?: number | null
          cost_per_click?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          placement_type?: string
          spend_total?: number | null
          start_date?: string | null
          status?: string
          target_community_id?: string | null
          target_location?: string | null
          target_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertisements_target_community_id_fkey"
            columns: ["target_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          business_id: string
          created_at: string
          customer_email: string
          customer_id: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          service_id: string
          status: string
          total_price: number | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          business_id: string
          created_at?: string
          customer_email: string
          customer_id: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          service_id: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          business_id?: string
          created_at?: string
          customer_email?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          service_id?: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_analytics: {
        Row: {
          business_id: string | null
          created_at: string
          customer_inquiries: number | null
          date: string
          id: string
          profile_views: number | null
          rating_average: number | null
          revenue: number | null
          service_bookings: number | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          customer_inquiries?: number | null
          date?: string
          id?: string
          profile_views?: number | null
          rating_average?: number | null
          revenue?: number | null
          service_bookings?: number | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          customer_inquiries?: number | null
          date?: string
          id?: string
          profile_views?: number | null
          rating_average?: number | null
          revenue?: number | null
          service_bookings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_analytics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_analytics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_deals: {
        Row: {
          business_id: string
          created_at: string
          current_redemptions: number | null
          deal_type: string
          description: string
          discount_amount: number | null
          discount_percentage: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          start_date: string
          target_communities: string[] | null
          terms_conditions: string | null
          title: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          current_redemptions?: number | null
          deal_type?: string
          description: string
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          start_date?: string
          target_communities?: string[] | null
          terms_conditions?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          current_redemptions?: number | null
          deal_type?: string
          description?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          start_date?: string
          target_communities?: string[] | null
          terms_conditions?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_deals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_deals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_events: {
        Row: {
          business_id: string
          created_at: string
          current_attendees: number | null
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          is_free: boolean | null
          location: string | null
          max_attendees: number | null
          price: number | null
          title: string
        }
        Insert: {
          business_id: string
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          is_free?: boolean | null
          location?: string | null
          max_attendees?: number | null
          price?: number | null
          title: string
        }
        Update: {
          business_id?: string
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          is_free?: boolean | null
          location?: string | null
          max_attendees?: number | null
          price?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_favorites: {
        Row: {
          business_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_messages: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          replied_at: string | null
          sender_id: string
          subject: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          replied_at?: string | null
          sender_id: string
          subject?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          replied_at?: string | null
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_photos: {
        Row: {
          business_id: string
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          is_featured: boolean | null
          photo_url: string
        }
        Insert: {
          business_id: string
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          photo_url: string
        }
        Update: {
          business_id?: string
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_photos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_photos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_posts: {
        Row: {
          allows_comments: boolean | null
          author_id: string
          business_id: string
          content: string
          created_at: string
          engagement_count: number | null
          id: string
          is_promoted: boolean | null
          post_status: string | null
          post_type: string
          promotion_budget: number | null
          promotion_end_date: string | null
          scheduled_for: string | null
          target_communities: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          allows_comments?: boolean | null
          author_id: string
          business_id: string
          content: string
          created_at?: string
          engagement_count?: number | null
          id?: string
          is_promoted?: boolean | null
          post_status?: string | null
          post_type?: string
          promotion_budget?: number | null
          promotion_end_date?: string | null
          scheduled_for?: string | null
          target_communities?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          allows_comments?: boolean | null
          author_id?: string
          business_id?: string
          content?: string
          created_at?: string
          engagement_count?: number | null
          id?: string
          is_promoted?: boolean | null
          post_status?: string | null
          post_type?: string
          promotion_budget?: number | null
          promotion_end_date?: string | null
          scheduled_for?: string | null
          target_communities?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          business_id: string
          content: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_recommended: boolean | null
          rating: number
          recommendation_type: string | null
          reviewer_id: string
          service_used: string | null
          title: string | null
          updated_at: string
          would_recommend_again: boolean | null
        }
        Insert: {
          business_id: string
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_recommended?: boolean | null
          rating: number
          recommendation_type?: string | null
          reviewer_id: string
          service_used?: string | null
          title?: string | null
          updated_at?: string
          would_recommend_again?: boolean | null
        }
        Update: {
          business_id?: string
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_recommended?: boolean | null
          rating?: number
          recommendation_type?: string | null
          reviewer_id?: string
          service_used?: string | null
          title?: string | null
          updated_at?: string
          would_recommend_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          business_id: string | null
          created_at: string
          end_date: string | null
          id: string
          payment_method: string | null
          price: number
          start_date: string
          status: string
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_method?: string | null
          price?: number
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_method?: string | null
          price?: number
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_verifications: {
        Row: {
          business_id: string
          created_at: string
          expires_at: string | null
          id: string
          status: string
          submitted_documents: string[] | null
          updated_at: string
          verification_notes: string | null
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          submitted_documents?: string[] | null
          updated_at?: string
          verification_notes?: string | null
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          submitted_documents?: string[] | null
          updated_at?: string
          verification_notes?: string | null
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_verifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string
          business_hours: Json | null
          categories: string[] | null
          category: Database["public"]["Enums"]["business_category"]
          city: string
          community_id: string | null
          created_at: string
          description: string | null
          email: string | null
          enhanced_features: Json | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          license_number: string | null
          name: string
          owner_id: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          search_vector: unknown | null
          service_radius_miles: number | null
          state: string
          subscription_end_date: string | null
          subscription_price: number | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          business_hours?: Json | null
          categories?: string[] | null
          category: Database["public"]["Enums"]["business_category"]
          city: string
          community_id?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          enhanced_features?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          search_vector?: unknown | null
          service_radius_miles?: number | null
          state: string
          subscription_end_date?: string | null
          subscription_price?: number | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          business_hours?: Json | null
          categories?: string[] | null
          category?: Database["public"]["Enums"]["business_category"]
          city?: string
          community_id?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          enhanced_features?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          search_vector?: unknown | null
          service_radius_miles?: number | null
          state?: string
          subscription_end_date?: string | null
          subscription_price?: number | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_votes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string
          upvotes: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string
          upvotes?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          auto_approve_members: boolean
          city: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          event_count: number | null
          id: string
          is_indian_diaspora_focused: boolean | null
          location_coordinates: unknown | null
          member_count: number | null
          name: string
          neighborhood_name: string | null
          post_count: number | null
          privacy_type: string
          radius_miles: number | null
          require_approval: boolean
          rules: string | null
          state: string
          type: Database["public"]["Enums"]["community_type"]
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          auto_approve_members?: boolean
          city: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          event_count?: number | null
          id?: string
          is_indian_diaspora_focused?: boolean | null
          location_coordinates?: unknown | null
          member_count?: number | null
          name: string
          neighborhood_name?: string | null
          post_count?: number | null
          privacy_type?: string
          radius_miles?: number | null
          require_approval?: boolean
          rules?: string | null
          state: string
          type?: Database["public"]["Enums"]["community_type"]
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          auto_approve_members?: boolean
          city?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          event_count?: number | null
          id?: string
          is_indian_diaspora_focused?: boolean | null
          location_coordinates?: unknown | null
          member_count?: number | null
          name?: string
          neighborhood_name?: string | null
          post_count?: number | null
          privacy_type?: string
          radius_miles?: number | null
          require_approval?: boolean
          rules?: string | null
          state?: string
          type?: Database["public"]["Enums"]["community_type"]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      community_analytics: {
        Row: {
          active_members: number | null
          community_id: string | null
          created_at: string
          date: string
          engagement_score: number | null
          events_created: number | null
          id: string
          new_members: number | null
          posts_created: number | null
        }
        Insert: {
          active_members?: number | null
          community_id?: string | null
          created_at?: string
          date?: string
          engagement_score?: number | null
          events_created?: number | null
          id?: string
          new_members?: number | null
          posts_created?: number | null
        }
        Update: {
          active_members?: number | null
          community_id?: string | null
          created_at?: string
          date?: string
          engagement_score?: number | null
          events_created?: number | null
          id?: string
          new_members?: number | null
          posts_created?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_analytics_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_invitations: {
        Row: {
          community_id: string
          created_at: string
          expires_at: string | null
          id: string
          invited_by: string
          invited_email: string | null
          invited_user_id: string | null
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          invited_by: string
          invited_email?: string | null
          invited_user_id?: string | null
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          invited_email?: string | null
          invited_user_id?: string | null
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_invitations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_invitations_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_join_requests: {
        Row: {
          community_id: string
          created_at: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_join_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          attendee_id: string
          created_at: string
          event_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          attendee_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          attendee_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          community_id: string | null
          created_at: string
          current_attendees: number | null
          description: string | null
          end_date: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          image_url: string | null
          is_free: boolean | null
          is_virtual: boolean
          location: string | null
          max_attendees: number | null
          organizer_id: string | null
          start_date: string
          ticket_price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          community_id?: string | null
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          is_virtual?: boolean
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          start_date: string
          ticket_price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          community_id?: string | null
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          is_virtual?: boolean
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          start_date?: string
          ticket_price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      local_recommendations: {
        Row: {
          address: string | null
          author_id: string
          business_name: string | null
          category: string
          community_id: string | null
          created_at: string
          description: string
          halal_options: boolean | null
          helpful_count: number | null
          id: string
          indian_friendly: boolean | null
          phone: string | null
          price_range: string | null
          rating: number | null
          title: string
          updated_at: string
          vegetarian_options: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          author_id: string
          business_name?: string | null
          category: string
          community_id?: string | null
          created_at?: string
          description: string
          halal_options?: boolean | null
          helpful_count?: number | null
          id?: string
          indian_friendly?: boolean | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          title: string
          updated_at?: string
          vegetarian_options?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          author_id?: string
          business_name?: string | null
          category?: string
          community_id?: string | null
          created_at?: string
          description?: string
          halal_options?: boolean | null
          helpful_count?: number | null
          id?: string
          indian_friendly?: boolean | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          title?: string
          updated_at?: string
          vegetarian_options?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_recommendations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace: {
        Row: {
          category: Database["public"]["Enums"]["marketplace_category"]
          community_id: string | null
          contact_info: Json | null
          created_at: string
          description: string
          id: string
          images: string[] | null
          is_negotiable: boolean | null
          location: string | null
          price: number | null
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["marketplace_category"]
          community_id?: string | null
          contact_info?: Json | null
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          is_negotiable?: boolean | null
          location?: string | null
          price?: number | null
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["marketplace_category"]
          community_id?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          is_negotiable?: boolean | null
          location?: string | null
          price?: number | null
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          created_at: string
          focus_areas: string[] | null
          id: string
          mentee_id: string
          mentor_id: string
          message: string | null
          status: Database["public"]["Enums"]["mentorship_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          mentee_id: string
          mentor_id: string
          message?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          mentee_id?: string
          mentor_id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorships_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorships_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          community_id: string | null
          content: string
          created_at: string
          id: string
          message_type: string
          read: boolean
          recipient_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          community_id?: string | null
          content: string
          created_at?: string
          id?: string
          message_type?: string
          read?: boolean
          recipient_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          community_id?: string | null
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          read?: boolean
          recipient_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_engagements: {
        Row: {
          comment_text: string | null
          created_at: string
          engagement_type: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          engagement_type: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          engagement_type?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_engagements_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "business_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_engagements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_votes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comment_count: number | null
          community_id: string | null
          content: string
          created_at: string
          downvotes: number | null
          id: string
          is_pinned: boolean | null
          media_type: string | null
          media_urls: string[] | null
          post_type: Database["public"]["Enums"]["post_type"]
          rich_content: Json | null
          search_vector: unknown | null
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number | null
        }
        Insert: {
          author_id: string
          comment_count?: number | null
          community_id?: string | null
          content: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_pinned?: boolean | null
          media_type?: string | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["post_type"]
          rich_content?: Json | null
          search_vector?: unknown | null
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number | null
        }
        Update: {
          author_id?: string
          comment_count?: number | null
          community_id?: string | null
          content?: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_pinned?: boolean | null
          media_type?: string | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["post_type"]
          rich_content?: Json | null
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          community_id: string | null
          contact_preferences: Json | null
          created_at: string
          current_address: string | null
          email: string
          experience_years: number | null
          first_name: string
          hometown_india: string | null
          id: string
          interests: string[] | null
          is_verified: boolean | null
          languages: string[] | null
          last_name: string
          linkedin_url: string | null
          origin_state_india: string | null
          preferred_languages: string[] | null
          profession: string | null
          profile_completion_score: number | null
          skills: string[] | null
          social_media_links: Json | null
          updated_at: string
          years_in_area: number | null
          zip_code: string | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          community_id?: string | null
          contact_preferences?: Json | null
          created_at?: string
          current_address?: string | null
          email: string
          experience_years?: number | null
          first_name: string
          hometown_india?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_name: string
          linkedin_url?: string | null
          origin_state_india?: string | null
          preferred_languages?: string[] | null
          profession?: string | null
          profile_completion_score?: number | null
          skills?: string[] | null
          social_media_links?: Json | null
          updated_at?: string
          years_in_area?: number | null
          zip_code?: string | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          community_id?: string | null
          contact_preferences?: Json | null
          created_at?: string
          current_address?: string | null
          email?: string
          experience_years?: number | null
          first_name?: string
          hometown_india?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_name?: string
          linkedin_url?: string | null
          origin_state_india?: string | null
          preferred_languages?: string[] | null
          profession?: string | null
          profile_completion_score?: number | null
          skills?: string[] | null
          social_media_links?: Json | null
          updated_at?: string
          years_in_area?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_tags: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_tags_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          author_id: string
          category: string
          community_id: string | null
          content: string | null
          created_at: string
          description: string | null
          external_url: string | null
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          search_vector: unknown | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          community_id?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          search_vector?: unknown | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          community_id?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_alerts: {
        Row: {
          alert_type: string
          author_id: string
          community_id: string | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          is_resolved: boolean | null
          latitude: number | null
          location_details: string | null
          longitude: number | null
          radius_affected_miles: number | null
          resolved_at: string | null
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_type?: string
          author_id: string
          community_id?: string | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          is_resolved?: boolean | null
          latitude?: number | null
          location_details?: string | null
          longitude?: number | null
          radius_affected_miles?: number | null
          resolved_at?: string | null
          severity?: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          author_id?: string
          community_id?: string | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          is_resolved?: boolean | null
          latitude?: number | null
          location_details?: string | null
          longitude?: number | null
          radius_affected_miles?: number | null
          resolved_at?: string | null
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_alerts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          category: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number | null
          requirements: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
          requirements?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
          requirements?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_dashboard_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          addressee_id: string | null
          created_at: string
          id: string
          message: string | null
          requester_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          requester_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          requester_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      business_dashboard_stats: {
        Row: {
          active_deals: number | null
          favorites_count: number | null
          id: string | null
          name: string | null
          rating: number | null
          review_count: number | null
          total_posts: number | null
          unread_messages: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      business_has_premium_features: {
        Args: { business_uuid: string }
        Returns: boolean
      }
      calculate_profile_completion: {
        Args: { profile_id: string }
        Returns: number
      }
      can_moderate_community: {
        Args: { user_id: string; community_id: string }
        Returns: boolean
      }
      get_user_community_role: {
        Args: { user_id: string; community_id: string }
        Returns: string
      }
      update_ad_click: {
        Args: { ad_uuid: string; click_cost: number }
        Returns: undefined
      }
      update_ad_impression: {
        Args: { ad_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      business_category:
        | "restaurant"
        | "grocery"
        | "services"
        | "healthcare"
        | "education"
        | "retail"
        | "technology"
        | "finance"
        | "real_estate"
        | "other"
      community_type: "city" | "neighborhood" | "region"
      event_type:
        | "cultural"
        | "professional"
        | "social"
        | "religious"
        | "educational"
      listing_status: "active" | "sold" | "expired"
      marketplace_category: "goods" | "services" | "housing" | "jobs"
      mentorship_status: "pending" | "approved" | "declined" | "completed"
      post_type:
        | "discussion"
        | "question"
        | "announcement"
        | "resource"
        | "event"
        | "job"
        | "housing"
        | "marketplace"
        | "recommendation"
        | "safety_alert"
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
      business_category: [
        "restaurant",
        "grocery",
        "services",
        "healthcare",
        "education",
        "retail",
        "technology",
        "finance",
        "real_estate",
        "other",
      ],
      community_type: ["city", "neighborhood", "region"],
      event_type: [
        "cultural",
        "professional",
        "social",
        "religious",
        "educational",
      ],
      listing_status: ["active", "sold", "expired"],
      marketplace_category: ["goods", "services", "housing", "jobs"],
      mentorship_status: ["pending", "approved", "declined", "completed"],
      post_type: [
        "discussion",
        "question",
        "announcement",
        "resource",
        "event",
        "job",
        "housing",
        "marketplace",
        "recommendation",
        "safety_alert",
      ],
    },
  },
} as const
