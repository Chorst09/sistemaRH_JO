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
      employees: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          department: string
          status: string
          avatar: string | null
          managerid: string | null
          hiredate: string
          salary: number
          phone: string | null
          address: string | null
          bank: string | null
          bankagency: string | null
          bankaccount: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: string
          department: string
          status?: string
          avatar?: string | null
          managerid?: string | null
          hiredate: string
          salary: number
          phone?: string | null
          address?: string | null
          bank?: string | null
          bankagency?: string | null
          bankaccount?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          department?: string
          status?: string
          avatar?: string | null
          managerid?: string | null
          hiredate?: string
          salary?: number
          phone?: string | null
          address?: string | null
          bank?: string | null
          bankagency?: string | null
          bankaccount?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      benefits: {
        Row: {
          id: string
          employee_id: string
          benefit_type: string
          value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          benefit_type: string
          value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          benefit_type?: string
          value?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          employee_id: string
          name: string
          type: string
          url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          name: string
          type: string
          url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          name?: string
          type?: string
          url?: string
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          cnpj: string
          tax_regime: string
          status: string
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cnpj: string
          tax_regime: string
          status?: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cnpj?: string
          tax_regime?: string
          status?: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
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
}