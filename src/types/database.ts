// Enhanced type definitions for better type safety
import { Database } from '@/integrations/supabase/types';

// Re-export database types for easier access
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Commonly used table row types
export type Community = Tables['communities']['Row'];
export type CommunityInsert = Tables['communities']['Insert'];
export type CommunityUpdate = Tables['communities']['Update'];

export type Post = Tables['posts']['Row'];
export type PostInsert = Tables['posts']['Insert'];
export type PostUpdate = Tables['posts']['Update'];

export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

export type Event = Tables['events']['Row'];
export type EventInsert = Tables['events']['Insert'];
export type EventUpdate = Tables['events']['Update'];

export type CommunityMember = Tables['community_members']['Row'];
export type CommunityMemberInsert = Tables['community_members']['Insert'];
export type CommunityMemberUpdate = Tables['community_members']['Update'];

export type EventAttendee = Tables['event_attendees']['Row'];
export type EventAttendeeInsert = Tables['event_attendees']['Insert'];
export type EventAttendeeUpdate = Tables['event_attendees']['Update'];

// Extended types with joins
export interface PostWithProfile extends Post {
  profiles: Profile;
  communities?: Community;
}

export interface EventWithProfile extends Event {
  profiles: Profile;
}

export interface CommunityMemberWithProfile extends CommunityMember {
  profiles: Profile;
}

export interface EventAttendeeWithProfile extends EventAttendee {
  profiles: Profile;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

// Common filter and sort types
export interface TableFilters {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}

export interface CommunityFilters extends TableFilters {
  city?: string;
  state?: string;
  type?: Enums['community_type'];
}

export interface PostFilters extends TableFilters {
  community_id?: string;
  post_type?: Enums['post_type'];
  author_id?: string;
}

export interface EventFilters extends TableFilters {
  community_id?: string;
  event_type?: Enums['event_type'];
  upcoming_only?: boolean;
}