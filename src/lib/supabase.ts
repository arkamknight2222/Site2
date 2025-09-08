import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone?: string;
          first_name?: string;
          last_name?: string;
          age?: number;
          gender?: string;
          is_veteran: boolean;
          is_citizen: boolean;
          highest_degree?: string;
          has_criminal_record: boolean;
          profile_picture?: string;
          bio?: string;
          skills: string[];
          points: number;
          is_employer: boolean;
          is_verified: boolean;
          company_name?: string;
          company_id?: string;
          company_location?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string;
          first_name?: string;
          last_name?: string;
          age?: number;
          gender?: string;
          is_veteran?: boolean;
          is_citizen?: boolean;
          highest_degree?: string;
          has_criminal_record?: boolean;
          profile_picture?: string;
          bio?: string;
          skills?: string[];
          points?: number;
          is_employer?: boolean;
          is_verified?: boolean;
          company_name?: string;
          company_id?: string;
          company_location?: string;
        };
        Update: {
          email?: string;
          phone?: string;
          first_name?: string;
          last_name?: string;
          age?: number;
          gender?: string;
          is_veteran?: boolean;
          is_citizen?: boolean;
          highest_degree?: string;
          has_criminal_record?: boolean;
          profile_picture?: string;
          bio?: string;
          skills?: string[];
          points?: number;
          is_employer?: boolean;
          is_verified?: boolean;
          company_name?: string;
          company_id?: string;
          company_location?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          company: string;
          location: string;
          type: string;
          salary_min: number;
          salary_max: number;
          description: string;
          requirements: string[];
          experience_level: string;
          education_level: string;
          minimum_points: number;
          is_event: boolean;
          event_date?: string;
          requires_application: boolean;
          featured: boolean;
          posted_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          company: string;
          location: string;
          type: string;
          salary_min?: number;
          salary_max?: number;
          description: string;
          requirements?: string[];
          experience_level: string;
          education_level: string;
          minimum_points?: number;
          is_event?: boolean;
          event_date?: string;
          requires_application?: boolean;
          featured?: boolean;
          posted_by?: string;
        };
        Update: {
          title?: string;
          company?: string;
          location?: string;
          type?: string;
          salary_min?: number;
          salary_max?: number;
          description?: string;
          requirements?: string[];
          experience_level?: string;
          education_level?: string;
          minimum_points?: number;
          is_event?: boolean;
          event_date?: string;
          requires_application?: boolean;
          featured?: boolean;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          resume_id?: string;
          points_used: number;
          added_points: number;
          status: string;
          response?: string;
          has_direct_message: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          job_id: string;
          user_id: string;
          resume_id?: string;
          points_used?: number;
          added_points?: number;
          status?: string;
          response?: string;
          has_direct_message?: boolean;
        };
        Update: {
          points_used?: number;
          added_points?: number;
          status?: string;
          response?: string;
          has_direct_message?: boolean;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          file_name: string;
          file_size: number;
          file_url: string;
          folder_id: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          file_name: string;
          file_size: number;
          file_url: string;
          folder_id?: string;
          is_default?: boolean;
        };
        Update: {
          name?: string;
          folder_id?: string;
          is_default?: boolean;
        };
      };
      resume_folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sort_by: string;
          sort_order: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          sort_by?: string;
          sort_order?: string;
        };
        Update: {
          name?: string;
          sort_by?: string;
          sort_order?: string;
        };
      };
      points_history: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          description: string;
          category: string;
          related_job_id?: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          amount: number;
          description: string;
          category: string;
          related_job_id?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          address: string;
          verification_status: string;
          verified_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          address: string;
          verification_status?: string;
          verified_by?: string;
        };
        Update: {
          name?: string;
          address?: string;
          verification_status?: string;
          verified_by?: string;
        };
      };
    };
  };
}