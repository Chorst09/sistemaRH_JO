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
          status: "Ativo" | "Inativo" | "De Licença" | "Demitido"
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
          status?: "Ativo" | "Inativo" | "De Licença" | "Demitido"
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
          status: "Ativa" | "Inativa"
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cnpj: string
          tax_regime: string
          status?: "Ativa" | "Inativa"
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cnpj?: string
          tax_regime?: string
          status?: "Ativa" | "Inativa"
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      absence_requests: {
        Row: {
          id: string
          employee_id: string
          start_date: string
          end_date: string
          status: "pending" | "approved" | "rejected"
          type: string
          reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          start_date: string
          end_date: string
          status?: "pending" | "approved" | "rejected"
          type: string
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          start_date?: string
          end_date?: string
          status?: "pending" | "approved" | "rejected"
          type?: string
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vacation_requests: {
        Row: {
          id: string
          employee_id: string
          start_date: string
          end_date: string
          status: "pending" | "approved" | "rejected"
          type: string
          days_requested: number
          sell_one_third: boolean | null
          gross_vacation: number | null
          one_third: number | null
          abono_pecuniario: number | null
          total_gross: number | null
          inss: number | null
          irrf: number | null
          total_net: number | null
          days: number | null
          reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          start_date: string
          end_date: string
          status?: "pending" | "approved" | "rejected"
          type?: string
          days_requested: number
          sell_one_third?: boolean | null
          gross_vacation?: number | null
          one_third?: number | null
          abono_pecuniario?: number | null
          total_gross?: number | null
          inss?: number | null
          irrf?: number | null
          total_net?: number | null
          days?: number | null
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          start_date?: string
          end_date?: string
          status?: "pending" | "approved" | "rejected"
          type?: string
          days_requested?: number
          sell_one_third?: boolean | null
          gross_vacation?: number | null
          one_third?: number | null
          abono_pecuniario?: number | null
          total_gross?: number | null
          inss?: number | null
          irrf?: number | null
          total_net?: number | null
          days?: number | null
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      benefits_catalog: {
        Row: {
          id: string
          name: string
          description: string
          hasValue: boolean
          has_value: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          hasValue?: boolean
          has_value?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          hasValue?: boolean
          has_value?: boolean | null
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