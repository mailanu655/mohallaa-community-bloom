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
      businesses: {
        Row: {
          address: string
          business_hours: Json | null
          category: Database["public"]["Enums"]["business_category"]
          city: string
          community_id: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: string
          owner_id: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          search_vector: unknown | null
          state: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          business_hours?: Json | null
          category: Database["public"]["Enums"]["business_category"]
          city: string
          community_id?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          search_vector?: unknown | null
          state: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          business_hours?: Json | null
          category?: Database["public"]["Enums"]["business_category"]
          city?: string
          community_id?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          search_vector?: unknown | null
          state?: string
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
          {
            foreignKeyName: "comment_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          created_at: string
          description: string | null
          id: string
          is_indian_diaspora_focused: boolean | null
          location_coordinates: unknown | null
          member_count: number | null
          name: string
          neighborhood_name: string | null
          privacy_type: string
          radius_miles: number | null
          require_approval: boolean
          state: string
          type: Database["public"]["Enums"]["community_type"]
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          auto_approve_members?: boolean
          city: string
          created_at?: string
          description?: string | null
          id?: string
          is_indian_diaspora_focused?: boolean | null
          location_coordinates?: unknown | null
          member_count?: number | null
          name: string
          neighborhood_name?: string | null
          privacy_type?: string
          radius_miles?: number | null
          require_approval?: boolean
          state: string
          type?: Database["public"]["Enums"]["community_type"]
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          auto_approve_members?: boolean
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          is_indian_diaspora_focused?: boolean | null
          location_coordinates?: unknown | null
          member_count?: number | null
          name?: string
          neighborhood_name?: string | null
          privacy_type?: string
          radius_miles?: number | null
          require_approval?: boolean
          state?: string
          type?: Database["public"]["Enums"]["community_type"]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "post_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      [_ in never]: never
    }
    Functions: {
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
