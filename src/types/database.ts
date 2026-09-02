/**
 * Supabase schema types — GENERATED. Do not edit by hand.
 *
 * Regenerate after any migration:
 *   npx supabase gen types typescript --project-id jxcwytbeiskjtgvumlws > src/types/database.ts
 */
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
      appointments: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          ends_at: string | null
          id: string
          lead_id: string | null
          location: string | null
          notes: string | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          type: Database["public"]["Enums"]["appointment_type"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          ends_at?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          notes?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          ends_at?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          notes?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "published_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          changed_fields: string[]
          created_at: string
          id: number
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: never
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: never
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          preferred_contact: Database["public"]["Enums"]["contact_method"]
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          customer_id: string | null
          expected_close: string | null
          gross_profit: number | null
          id: string
          lead_id: string | null
          lender_application_id: string | null
          lost_reason: string | null
          notes: string | null
          prequalification_id: string | null
          sale_price: number | null
          stage: Database["public"]["Enums"]["deal_stage"]
          trade_in_id: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          expected_close?: string | null
          gross_profit?: number | null
          id?: string
          lead_id?: string | null
          lender_application_id?: string | null
          lost_reason?: string | null
          notes?: string | null
          prequalification_id?: string | null
          sale_price?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          trade_in_id?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          expected_close?: string | null
          gross_profit?: number | null
          id?: string
          lead_id?: string | null
          lender_application_id?: string | null
          lost_reason?: string | null
          notes?: string | null
          prequalification_id?: string | null
          sale_price?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          trade_in_id?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lender_application_id_fkey"
            columns: ["lender_application_id"]
            isOneToOne: false
            referencedRelation: "lender_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_prequalification_id_fkey"
            columns: ["prequalification_id"]
            isOneToOne: false
            referencedRelation: "prequalifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_trade_in_id_fkey"
            columns: ["trade_in_id"]
            isOneToOne: false
            referencedRelation: "trade_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "published_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          bot_check_passed: boolean | null
          bot_provider: string | null
          bot_score: number | null
          country: string | null
          created_at: string
          error_code: string | null
          field_errors: Json | null
          form_key: string
          honeypot_tripped: boolean
          id: string
          ip_hash: string | null
          outcome: Database["public"]["Enums"]["submission_outcome"]
          referrer: string | null
          related_id: string | null
          related_table: string | null
          spam_signals: string[]
          time_to_submit_ms: number | null
          user_agent: string | null
        }
        Insert: {
          bot_check_passed?: boolean | null
          bot_provider?: string | null
          bot_score?: number | null
          country?: string | null
          created_at?: string
          error_code?: string | null
          field_errors?: Json | null
          form_key: string
          honeypot_tripped?: boolean
          id?: string
          ip_hash?: string | null
          outcome: Database["public"]["Enums"]["submission_outcome"]
          referrer?: string | null
          related_id?: string | null
          related_table?: string | null
          spam_signals?: string[]
          time_to_submit_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          bot_check_passed?: boolean | null
          bot_provider?: string | null
          bot_score?: number | null
          country?: string | null
          created_at?: string
          error_code?: string | null
          field_errors?: Json | null
          form_key?: string
          honeypot_tripped?: boolean
          id?: string
          ip_hash?: string | null
          outcome?: Database["public"]["Enums"]["submission_outcome"]
          referrer?: string | null
          related_id?: string | null
          related_table?: string | null
          spam_signals?: string[]
          time_to_submit_ms?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      inventory_feeds: {
        Row: {
          auto_archive_missing: boolean
          created_at: string
          credentials_ref: string | null
          endpoint_url: string | null
          field_mapping: Json
          id: string
          is_active: boolean
          last_run_at: string | null
          last_run_status: Database["public"]["Enums"]["feed_run_status"] | null
          name: string
          partner_lot_id: string | null
          schedule_cron: string | null
          type: Database["public"]["Enums"]["feed_type"]
          updated_at: string
        }
        Insert: {
          auto_archive_missing?: boolean
          created_at?: string
          credentials_ref?: string | null
          endpoint_url?: string | null
          field_mapping?: Json
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_run_status?:
            | Database["public"]["Enums"]["feed_run_status"]
            | null
          name: string
          partner_lot_id?: string | null
          schedule_cron?: string | null
          type?: Database["public"]["Enums"]["feed_type"]
          updated_at?: string
        }
        Update: {
          auto_archive_missing?: boolean
          created_at?: string
          credentials_ref?: string | null
          endpoint_url?: string | null
          field_mapping?: Json
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_run_status?:
            | Database["public"]["Enums"]["feed_run_status"]
            | null
          name?: string
          partner_lot_id?: string | null
          schedule_cron?: string | null
          type?: Database["public"]["Enums"]["feed_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_feeds_partner_lot_id_fkey"
            columns: ["partner_lot_id"]
            isOneToOne: false
            referencedRelation: "partner_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_staging: {
        Row: {
          error_message: string | null
          external_id: string
          feed_id: string
          id: string
          processed_at: string | null
          raw: Json
          received_at: string
          row_hash: string
          run_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          error_message?: string | null
          external_id: string
          feed_id: string
          id?: string
          processed_at?: string | null
          raw: Json
          received_at?: string
          row_hash: string
          run_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          error_message?: string | null
          external_id?: string
          feed_id?: string
          id?: string
          processed_at?: string | null
          raw?: Json
          received_at?: string
          row_hash?: string
          run_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_staging_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "inventory_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_staging_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "inventory_sync_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_staging_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "published_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_staging_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_sync_runs: {
        Row: {
          details: Json
          error_message: string | null
          feed_id: string
          finished_at: string | null
          id: string
          rows_received: number
          rows_skipped: number
          started_at: string
          status: Database["public"]["Enums"]["feed_run_status"]
          triggered_by: string | null
          vehicles_archived: number
          vehicles_created: number
          vehicles_updated: number
        }
        Insert: {
          details?: Json
          error_message?: string | null
          feed_id: string
          finished_at?: string | null
          id?: string
          rows_received?: number
          rows_skipped?: number
          started_at?: string
          status?: Database["public"]["Enums"]["feed_run_status"]
          triggered_by?: string | null
          vehicles_archived?: number
          vehicles_created?: number
          vehicles_updated?: number
        }
        Update: {
          details?: Json
          error_message?: string | null
          feed_id?: string
          finished_at?: string | null
          id?: string
          rows_received?: number
          rows_skipped?: number
          started_at?: string
          status?: Database["public"]["Enums"]["feed_run_status"]
          triggered_by?: string | null
          vehicles_archived?: number
          vehicles_created?: number
          vehicles_updated?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_sync_runs_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "inventory_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_sync_runs_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          contacted_at: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          message: string | null
          phone: string | null
          preferred_contact: Database["public"]["Enums"]["contact_method"]
          referrer: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          contacted_at?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          message?: string | null
          phone?: string | null
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          referrer?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          contacted_at?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          message?: string | null
          phone?: string | null
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          referrer?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "published_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      lender_applications: {
        Row: {
          created_at: string
          customer_id: string | null
          decided_at: string | null
          decision: string | null
          external_id: string
          external_url: string | null
          id: string
          lead_id: string | null
          notes: string | null
          prequalification_id: string | null
          provider: string
          status: string
          submitted_by: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          decided_at?: string | null
          decision?: string | null
          external_id: string
          external_url?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          prequalification_id?: string | null
          provider: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          decided_at?: string | null
          decision?: string | null
          external_id?: string
          external_url?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          prequalification_id?: string | null
          provider?: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lender_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lender_applications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lender_applications_prequalification_id_fkey"
            columns: ["prequalification_id"]
            isOneToOne: false
            referencedRelation: "prequalifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lender_applications_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lender_applications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "published_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lender_applications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_id: string | null
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at: string
          customer_id: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          id: string
          lead_id: string | null
          read_at: string | null
          sent_at: string
          subject: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          customer_id?: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          id?: string
          lead_id?: string | null
          read_at?: string | null
          sent_at?: string
          subject?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          customer_id?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          id?: string
          lead_id?: string | null
          read_at?: string | null
          sent_at?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_lots: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          commission_notes: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          display_on_site: boolean
          id: string
          is_active: boolean
          name: string
          notes: string | null
          postal_code: string | null
          slug: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          commission_notes?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          display_on_site?: boolean
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          postal_code?: string | null
          slug: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          commission_notes?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          display_on_site?: boolean
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          postal_code?: string | null
          slug?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prequalifications: {
        Row: {
          assigned_to: string | null
          consent_contact: boolean
          consent_ip: unknown
          consent_text_version: string | null
          consent_user_agent: string | null
          consented_at: string | null
          created_at: string
          customer_id: string | null
          down_payment_band: Database["public"]["Enums"]["down_payment_range"]
          email: string | null
          employer_name: string | null
          employment: Database["public"]["Enums"]["employment_status"]
          first_name: string
          has_trade_in: boolean
          id: string
          last_name: string
          lead_id: string | null
          monthly_income_band: Database["public"]["Enums"]["income_range"]
          notes: string | null
          phone: string
          preferred_contact: Database["public"]["Enums"]["contact_method"]
          preferred_vehicle_type: string | null
          status: Database["public"]["Enums"]["prequal_status"]
          timeframe: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          consent_contact?: boolean
          consent_ip?: unknown
          consent_text_version?: string | null
          consent_user_agent?: string | null
          consented_at?: string | null
          created_at?: string
          customer_id?: string | null
          down_payment_band?: Database["public"]["Enums"]["down_payment_range"]
          email?: string | null
          employer_name?: string | null
          employment?: Database["public"]["Enums"]["employment_status"]
          first_name: string
          has_trade_in?: boolean
          id?: string
          last_name: string
          lead_id?: string | null
          monthly_income_band?: Database["public"]["Enums"]["income_range"]
          notes?: string | null
          phone: string
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          preferred_vehicle_type?: string | null
          status?: Database["public"]["Enums"]["prequal_status"]
          timeframe?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          consent_contact?: boolean
          consent_ip?: unknown
          consent_text_version?: string | null
          consent_user_agent?: string | null
          consented_at?: string | null
          created_at?: string
          customer_id?: string | null
          down_payment_band?: Database["public"]["Enums"]["down_payment_range"]
          email?: string | null
          employer_name?: string | null
          employment?: Database["public"]["Enums"]["employment_status"]
          first_name?: string
          has_trade_in?: boolean
          id?: string
          last_name?: string
          lead_id?: string | null
          monthly_income_band?: Database["public"]["Enums"]["income_range"]
          notes?: string | null
          phone?: string
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          preferred_vehicle_type?: string | null
          status?: Database["public"]["Enums"]["prequal_status"]
          timeframe?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prequalifications_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prequalifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prequalifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prequalifications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "published_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prequalifications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          external_url: string | null
          id: string
          is_primary: boolean
          position: number
          product_id: string
          storage_path: string | null
        }
        Insert: {
          alt?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          is_primary?: boolean
          position?: number
          product_id: string
          storage_path?: string | null
        }
        Update: {
          alt?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          is_primary?: boolean
          position?: number
          product_id?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          collection: string | null
          colors: Json
          compare_at: number | null
          created_at: string
          description: string | null
          details: string[]
          id: string
          is_new: boolean
          name: string
          photography_is_render: boolean
          position: number
          price: number
          sizes: string[]
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock: Database["public"]["Enums"]["product_stock"]
          subtitle: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          collection?: string | null
          colors?: Json
          compare_at?: number | null
          created_at?: string
          description?: string | null
          details?: string[]
          id?: string
          is_new?: boolean
          name: string
          photography_is_render?: boolean
          position?: number
          price: number
          sizes?: string[]
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: Database["public"]["Enums"]["product_stock"]
          subtitle?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          collection?: string | null
          colors?: Json
          compare_at?: number | null
          created_at?: string
          description?: string | null
          details?: string[]
          id?: string
          is_new?: boolean
          name?: string
          photography_is_render?: boolean
          position?: number
          price?: number
          sizes?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: Database["public"]["Enums"]["product_stock"]
          subtitle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          hits: number
          identifier: string
          window_start: string
        }
        Insert: {
          bucket: string
          hits?: number
          identifier: string
          window_start: string
        }
        Update: {
          bucket?: string
          hits?: number
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_email: string | null
          author_name: string
          body: string
          created_at: string
          id: string
          published_at: string | null
          rating: number
          source: string
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          author_email?: string | null
          author_name: string
          body: string
          created_at?: string
          id?: string
          published_at?: string | null
          rating: number
          source?: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          published_at?: string | null
          rating?: number
          source?: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "published_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_in_photos: {
        Row: {
          created_at: string
          id: string
          position: number
          storage_path: string
          trade_in_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          storage_path: string
          trade_in_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          storage_path?: string
          trade_in_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_in_photos_trade_in_id_fkey"
            columns: ["trade_in_id"]
            isOneToOne: false
            referencedRelation: "trade_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_ins: {
        Row: {
          assigned_to: string | null
          condition: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          estimated_value_high: number | null
          estimated_value_low: number | null
          first_name: string | null
          has_accidents: boolean | null
          id: string
          last_name: string | null
          lead_id: string | null
          make: string | null
          mileage: number | null
          model: string | null
          notes: string | null
          offer_amount: number | null
          offer_expires_at: string | null
          phone: string | null
          status: Database["public"]["Enums"]["trade_in_status"]
          still_financed: boolean | null
          trim: string | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          assigned_to?: string | null
          condition?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          estimated_value_high?: number | null
          estimated_value_low?: number | null
          first_name?: string | null
          has_accidents?: boolean | null
          id?: string
          last_name?: string | null
          lead_id?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          notes?: string | null
          offer_amount?: number | null
          offer_expires_at?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["trade_in_status"]
          still_financed?: boolean | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          assigned_to?: string | null
          condition?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          estimated_value_high?: number | null
          estimated_value_low?: number | null
          first_name?: string | null
          has_accidents?: boolean | null
          id?: string
          last_name?: string | null
          lead_id?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          notes?: string | null
          offer_amount?: number | null
          offer_expires_at?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["trade_in_status"]
          still_financed?: boolean | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_ins_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_ins_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_ins_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_photos: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          position: number
          remote_url: string | null
          storage_path: string | null
          vehicle_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          remote_url?: string | null
          storage_path?: string | null
          vehicle_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          remote_url?: string | null
          storage_path?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "published_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_type: string | null
          created_at: string
          created_by: string | null
          cylinders: number | null
          description: string | null
          doors: number | null
          down_payment: number | null
          drivetrain: string | null
          engine: string | null
          exterior_color: string | null
          external_id: string | null
          features: string[]
          feed_id: string | null
          fuel_type: string | null
          history_report_url: string | null
          id: string
          ingestion_method: Database["public"]["Enums"]["ingestion_method"]
          interior_color: string | null
          is_featured: boolean
          last_synced_at: string | null
          locked_fields: string[]
          make: string
          mileage: number | null
          model: string
          monthly_payment: number | null
          mpg_city: number | null
          mpg_highway: number | null
          partner_lot_id: string | null
          previous_price: number | null
          price: number | null
          price_changed_at: string | null
          seating: number | null
          slug: string
          sold_at: string | null
          source: Database["public"]["Enums"]["vehicle_source"]
          source_hash: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          stock_number: string | null
          sync_enabled: boolean
          sync_state: Database["public"]["Enums"]["sync_state"]
          title_status: Database["public"]["Enums"]["title_status"]
          transmission: string | null
          trim: string | null
          updated_at: string
          video_url: string | null
          vin: string | null
          warranty_details: string | null
          warranty_status: Database["public"]["Enums"]["warranty_status"]
          year: number
        }
        Insert: {
          body_type?: string | null
          created_at?: string
          created_by?: string | null
          cylinders?: number | null
          description?: string | null
          doors?: number | null
          down_payment?: number | null
          drivetrain?: string | null
          engine?: string | null
          exterior_color?: string | null
          external_id?: string | null
          features?: string[]
          feed_id?: string | null
          fuel_type?: string | null
          history_report_url?: string | null
          id?: string
          ingestion_method?: Database["public"]["Enums"]["ingestion_method"]
          interior_color?: string | null
          is_featured?: boolean
          last_synced_at?: string | null
          locked_fields?: string[]
          make: string
          mileage?: number | null
          model: string
          monthly_payment?: number | null
          mpg_city?: number | null
          mpg_highway?: number | null
          partner_lot_id?: string | null
          previous_price?: number | null
          price?: number | null
          price_changed_at?: string | null
          seating?: number | null
          slug: string
          sold_at?: string | null
          source?: Database["public"]["Enums"]["vehicle_source"]
          source_hash?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          stock_number?: string | null
          sync_enabled?: boolean
          sync_state?: Database["public"]["Enums"]["sync_state"]
          title_status?: Database["public"]["Enums"]["title_status"]
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          video_url?: string | null
          vin?: string | null
          warranty_details?: string | null
          warranty_status?: Database["public"]["Enums"]["warranty_status"]
          year: number
        }
        Update: {
          body_type?: string | null
          created_at?: string
          created_by?: string | null
          cylinders?: number | null
          description?: string | null
          doors?: number | null
          down_payment?: number | null
          drivetrain?: string | null
          engine?: string | null
          exterior_color?: string | null
          external_id?: string | null
          features?: string[]
          feed_id?: string | null
          fuel_type?: string | null
          history_report_url?: string | null
          id?: string
          ingestion_method?: Database["public"]["Enums"]["ingestion_method"]
          interior_color?: string | null
          is_featured?: boolean
          last_synced_at?: string | null
          locked_fields?: string[]
          make?: string
          mileage?: number | null
          model?: string
          monthly_payment?: number | null
          mpg_city?: number | null
          mpg_highway?: number | null
          partner_lot_id?: string | null
          previous_price?: number | null
          price?: number | null
          price_changed_at?: string | null
          seating?: number | null
          slug?: string
          sold_at?: string | null
          source?: Database["public"]["Enums"]["vehicle_source"]
          source_hash?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          stock_number?: string | null
          sync_enabled?: boolean
          sync_state?: Database["public"]["Enums"]["sync_state"]
          title_status?: Database["public"]["Enums"]["title_status"]
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          video_url?: string | null
          vin?: string | null
          warranty_details?: string | null
          warranty_status?: Database["public"]["Enums"]["warranty_status"]
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "inventory_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_partner_lot_id_fkey"
            columns: ["partner_lot_id"]
            isOneToOne: false
            referencedRelation: "partner_lots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      published_vehicles: {
        Row: {
          body_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          down_payment: number | null
          drivetrain: string | null
          engine: string | null
          exterior_color: string | null
          external_id: string | null
          features: string[] | null
          feed_id: string | null
          fuel_type: string | null
          id: string | null
          ingestion_method:
            | Database["public"]["Enums"]["ingestion_method"]
            | null
          interior_color: string | null
          is_featured: boolean | null
          last_synced_at: string | null
          locked_fields: string[] | null
          make: string | null
          mileage: number | null
          model: string | null
          monthly_payment: number | null
          partner_lot_id: string | null
          partner_lot_name: string | null
          partner_lot_slug: string | null
          previous_price: number | null
          price: number | null
          price_changed_at: string | null
          slug: string | null
          sold_at: string | null
          source: Database["public"]["Enums"]["vehicle_source"] | null
          source_hash: string | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          stock_number: string | null
          sync_enabled: boolean | null
          sync_state: Database["public"]["Enums"]["sync_state"] | null
          transmission: string | null
          trim: string | null
          updated_at: string | null
          vin: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "inventory_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_partner_lot_id_fkey"
            columns: ["partner_lot_id"]
            isOneToOne: false
            referencedRelation: "partner_lots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      build_vehicle_slug: {
        Args: {
          p_make: string
          p_model: string
          p_suffix: string
          p_year: number
        }
        Returns: string
      }
      can_write: { Args: never; Returns: boolean }
      check_rate_limit: {
        Args: {
          p_bucket: string
          p_identifier: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      feed_archive_missing: {
        Args: { p_feed_id: string; p_seen_external_ids: string[] }
        Returns: number
      }
      feed_upsert_vehicle: {
        Args: {
          p_data: Json
          p_external_id: string
          p_feed_id: string
          p_run_id?: string
        }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      prune_rate_limits: { Args: { p_older_than?: string }; Returns: number }
      syncable_vehicle_columns: { Args: never; Returns: string[] }
      unlock_vehicle_fields: {
        Args: { p_fields: string[]; p_vehicle_id: string }
        Returns: string[]
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      appointment_type: "test_drive" | "delivery" | "consultation"
      audit_action: "insert" | "update" | "delete"
      contact_method: "phone" | "text" | "email" | "any"
      deal_stage:
        | "new"
        | "qualified"
        | "prequalified"
        | "vehicle_selected"
        | "lender_submitted"
        | "approved"
        | "paperwork"
        | "delivered"
        | "lost"
      down_payment_range:
        | "none"
        | "under_500"
        | "from_500_to_999"
        | "from_1000_to_2499"
        | "from_2500_to_4999"
        | "from_5000_plus"
        | "undecided"
      employment_status:
        | "employed_full_time"
        | "employed_part_time"
        | "self_employed"
        | "military"
        | "retired"
        | "student"
        | "not_employed"
        | "other"
        | "prefer_not_to_say"
      feed_run_status: "running" | "success" | "partial" | "failed"
      feed_type: "manual_upload" | "csv" | "xml" | "json_api" | "partner_api"
      income_range:
        | "under_2000"
        | "from_2000_to_2999"
        | "from_3000_to_3999"
        | "from_4000_to_4999"
        | "from_5000_to_6999"
        | "from_7000_plus"
        | "prefer_not_to_say"
      ingestion_method:
        | "manual"
        | "csv_import"
        | "xml_feed"
        | "json_api"
        | "partner_api"
      lead_source:
        | "homepage_form"
        | "vehicle_inquiry"
        | "financing"
        | "prequalification"
        | "trade_in"
        | "contact_form"
        | "phone"
        | "walk_in"
        | "referral"
        | "social"
        | "other"
        | "find_my_car"
      lead_status:
        | "new"
        | "contacted"
        | "working"
        | "appointment_set"
        | "prequalified"
        | "won"
        | "lost"
      message_channel: "sms" | "email" | "web_form" | "phone" | "other"
      message_direction: "inbound" | "outbound"
      prequal_status:
        | "new"
        | "contacted"
        | "prequalified"
        | "referred_to_lender"
        | "not_qualified"
        | "converted"
        | "closed"
      product_status: "draft" | "published" | "archived"
      product_stock: "in_stock" | "sold_out" | "coming_soon"
      review_status: "pending" | "published" | "hidden"
      submission_outcome:
        | "accepted"
        | "rejected_validation"
        | "rejected_rate_limit"
        | "rejected_bot"
        | "rejected_duplicate"
        | "error"
      sync_state: "not_synced" | "synced" | "stale" | "error" | "orphaned"
      title_status:
        | "clean"
        | "salvage"
        | "rebuilt"
        | "flood"
        | "lemon"
        | "not_disclosed"
      trade_in_status:
        | "submitted"
        | "appraising"
        | "offer_made"
        | "accepted"
        | "declined"
        | "expired"
      user_role: "admin" | "sales" | "viewer"
      vehicle_source: "owned" | "partner"
      vehicle_status: "draft" | "available" | "pending" | "sold" | "archived"
      warranty_status:
        | "as_is"
        | "remaining_factory"
        | "dealer_warranty"
        | "certified"
        | "not_specified"
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
      appointment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      appointment_type: ["test_drive", "delivery", "consultation"],
      audit_action: ["insert", "update", "delete"],
      contact_method: ["phone", "text", "email", "any"],
      deal_stage: [
        "new",
        "qualified",
        "prequalified",
        "vehicle_selected",
        "lender_submitted",
        "approved",
        "paperwork",
        "delivered",
        "lost",
      ],
      down_payment_range: [
        "none",
        "under_500",
        "from_500_to_999",
        "from_1000_to_2499",
        "from_2500_to_4999",
        "from_5000_plus",
        "undecided",
      ],
      employment_status: [
        "employed_full_time",
        "employed_part_time",
        "self_employed",
        "military",
        "retired",
        "student",
        "not_employed",
        "other",
        "prefer_not_to_say",
      ],
      feed_run_status: ["running", "success", "partial", "failed"],
      feed_type: ["manual_upload", "csv", "xml", "json_api", "partner_api"],
      income_range: [
        "under_2000",
        "from_2000_to_2999",
        "from_3000_to_3999",
        "from_4000_to_4999",
        "from_5000_to_6999",
        "from_7000_plus",
        "prefer_not_to_say",
      ],
      ingestion_method: [
        "manual",
        "csv_import",
        "xml_feed",
        "json_api",
        "partner_api",
      ],
      lead_source: [
        "homepage_form",
        "vehicle_inquiry",
        "financing",
        "prequalification",
        "trade_in",
        "contact_form",
        "phone",
        "walk_in",
        "referral",
        "social",
        "other",
        "find_my_car",
      ],
      lead_status: [
        "new",
        "contacted",
        "working",
        "appointment_set",
        "prequalified",
        "won",
        "lost",
      ],
      message_channel: ["sms", "email", "web_form", "phone", "other"],
      message_direction: ["inbound", "outbound"],
      prequal_status: [
        "new",
        "contacted",
        "prequalified",
        "referred_to_lender",
        "not_qualified",
        "converted",
        "closed",
      ],
      product_status: ["draft", "published", "archived"],
      product_stock: ["in_stock", "sold_out", "coming_soon"],
      review_status: ["pending", "published", "hidden"],
      submission_outcome: [
        "accepted",
        "rejected_validation",
        "rejected_rate_limit",
        "rejected_bot",
        "rejected_duplicate",
        "error",
      ],
      sync_state: ["not_synced", "synced", "stale", "error", "orphaned"],
      title_status: [
        "clean",
        "salvage",
        "rebuilt",
        "flood",
        "lemon",
        "not_disclosed",
      ],
      trade_in_status: [
        "submitted",
        "appraising",
        "offer_made",
        "accepted",
        "declined",
        "expired",
      ],
      user_role: ["admin", "sales", "viewer"],
      vehicle_source: ["owned", "partner"],
      vehicle_status: ["draft", "available", "pending", "sold", "archived"],
      warranty_status: [
        "as_is",
        "remaining_factory",
        "dealer_warranty",
        "certified",
        "not_specified",
      ],
    },
  },
} as const
