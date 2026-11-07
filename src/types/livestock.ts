/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KIMS Livestock - Core Data Models & Shared Contracts
 * Kapisanan ng mga Magsasakang Benepisyaryo ng Agraryo (KAMBAC)
 * Carmundo, Bongabong, Oriental Mindoro
 */

/**
 * Roles spelled exactly as required by KAMBAC system specifications.
 */
export type UserRole =
  | 'President'
  | 'Bookkeeper'
  | 'General Manager'
  | 'Officers and Staff'
  | 'Member';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  /**
   * member_id is linked if role === 'Member' (format: KMB-YYYY-NNNN)
   */
  member_id?: string;
  avatar_url?: string;
}

/**
 * Livestock Entity: tbl_livestock
 * Note: Fields in exact snake_case as required for cross-module integration.
 * Never stores member's name; looked up by member_id.
 */
export interface LivestockRecord {
  livestock_id: string;
  animal_type: string;
  quantity: number;
  tag_id: string;
  member_id: string | null;
  distribution_date: string | null;
  health_status: string;
  is_sample?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Members Placeholder Entity
 * Small read-only reference list so livestock can be assigned to a member.
 * "Placeholder: will be replaced by the Members module"
 */
export interface MemberReference {
  member_id: string; // format: KMB-YYYY-NNNN
  full_name: string;
  contact_number?: string;
  barangay?: string;
  is_sample?: boolean;
}

/**
 * Audit Log Entity
 * Tracks create, update, and assignment actions (President only).
 */
export interface AuditLogEntry {
  id: string;
  user: string;
  role: UserRole;
  action_taken: string;
  ip_address: string;
  timestamp: string;
}

/**
 * Dashboard & Report Summary
 */
export interface LivestockSummary {
  total_headcount: number;
  total_records: number;
  assigned_count: number;
  unassigned_count: number;
  assigned_headcount: number;
  unassigned_headcount: number;
  by_animal_type: { [type: string]: { count: number; total_quantity: number } };
  by_health_status: { [status: string]: number };
  recent_distributions: LivestockRecord[];
}

/**
 * Data payloads for operations
 */
export interface CreateLivestockInput {
  animal_type: string;
  quantity: number;
  tag_id: string;
  member_id?: string | null;
  distribution_date?: string | null;
  health_status: string;
}

export interface UpdateLivestockInput {
  animal_type?: string;
  quantity?: number;
  tag_id?: string;
  member_id?: string | null;
  distribution_date?: string | null;
  health_status?: string;
}

export interface AssignLivestockInput {
  member_id: string;
  distribution_date: string;
}
