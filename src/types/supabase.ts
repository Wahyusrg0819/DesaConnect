export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string
          reference_id: string
          name: string | null
          contact_info: string | null
          category: string
          description: string
          created_at: string
          status: 'pending' | 'in progress' | 'resolved'
          file_url: string | null
          priority: 'Urgent' | 'Regular'
          internal_comments: Json | null
        }
        Insert: {
          id?: string
          reference_id: string
          name?: string | null
          contact_info?: string | null
          category: string
          description: string
          created_at?: string
          status?: 'pending' | 'in progress' | 'resolved'
          file_url?: string | null
          priority?: 'Urgent' | 'Regular'
          internal_comments?: Json | null
        }
        Update: {
          id?: string
          reference_id?: string
          name?: string | null
          contact_info?: string | null
          category?: string
          description?: string
          created_at?: string
          status?: 'pending' | 'in progress' | 'resolved'
          file_url?: string | null
          priority?: 'Urgent' | 'Regular'
          internal_comments?: Json | null
        }
        Relationships: []
      }
      admin_list: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
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
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          public: boolean | null
        }
        Insert: {
          id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
        }
        Relationships: []
      }
      objects: {
        Row: {
          id: string
          bucket_id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          bucket_id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          bucket_id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketid_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
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
  }
  auth: {
    Tables: {
      [_ in never]: never
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
  }
} 