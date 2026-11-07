/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Initial Seed Data for KIMS Livestock Module
 * KAMBAC (Kapisanan ng mga Magsasakang Benepisyaryo ng Agraryo)
 * Carmundo, Bongabong, Oriental Mindoro
 */

import { LivestockRecord, MemberReference, User, AuditLogEntry } from '../types/livestock';

/**
 * 5 Test Users representing each of the 5 KAMBAC roles
 */
export const SAMPLE_USERS: User[] = [
  {
    id: 'usr-001',
    email: 'president@kambac.org',
    full_name: 'Mario V. Macalalad',
    role: 'President',
  },
  {
    id: 'usr-002',
    email: 'bookkeeper@kambac.org',
    full_name: 'Teresa G. Atienza',
    role: 'Bookkeeper',
  },
  {
    id: 'usr-003',
    email: 'gm@kambac.org',
    full_name: 'Danilo C. Panganiban',
    role: 'General Manager',
  },
  {
    id: 'usr-004',
    email: 'staff@kambac.org',
    full_name: 'Rogelio B. Umali',
    role: 'Officers and Staff',
  },
  {
    id: 'usr-005',
    email: 'member@kambac.org',
    full_name: 'Juan Dela Cruz',
    role: 'Member',
    member_id: 'KMB-2026-0001',
  },
];

/**
 * Members Reference Placeholder
 * Labeled: "Placeholder: will be replaced by the Members module"
 * Only provides member_id and full_name (with auxiliary location for realism)
 */
export const SAMPLE_MEMBERS: MemberReference[] = [
  {
    member_id: 'KMB-2026-0001',
    full_name: 'Juan Dela Cruz',
    contact_number: '+63 917 555 1201',
    barangay: 'Carmundo, Bongabong',
    is_sample: true,
  },
  {
    member_id: 'KMB-2026-0002',
    full_name: 'Elena Ramos Malabanan',
    contact_number: '+63 920 444 8832',
    barangay: 'Carmundo, Bongabong',
    is_sample: true,
  },
  {
    member_id: 'KMB-2026-0003',
    full_name: 'Rolando "Ka Roly" Garcia',
    contact_number: '+63 918 333 9941',
    barangay: 'Carmundo, Bongabong',
    is_sample: true,
  },
  {
    member_id: 'KMB-2026-0004',
    full_name: 'Corazon "Nanay Cora" Bautista',
    contact_number: '+63 929 111 2345',
    barangay: 'Carmundo, Bongabong',
    is_sample: true,
  },
  {
    member_id: 'KMB-2026-0005',
    full_name: 'Nestor Mendoza Jr.',
    contact_number: '+63 995 777 6512',
    barangay: 'Carmundo, Bongabong',
    is_sample: true,
  },
];

/**
 * 10 Sample Livestock Records (tbl_livestock)
 * Mix of assigned and unassigned records.
 * Uses exact snake_case fields: livestock_id, animal_type, quantity, tag_id, member_id, distribution_date, health_status.
 * Plain text for animal_type and health_status.
 */
export const SAMPLE_LIVESTOCK: LivestockRecord[] = [
  {
    livestock_id: 'LS-2026-001',
    animal_type: 'Carabao (Draft)',
    quantity: 1,
    tag_id: 'TAG-CRB-081',
    member_id: 'KMB-2026-0001',
    distribution_date: '2026-01-15',
    health_status: 'Healthy & Fully Vaccinated',
    is_sample: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-15T14:30:00Z',
  },
  {
    livestock_id: 'LS-2026-002',
    animal_type: 'Native Cattle Cow',
    quantity: 2,
    tag_id: 'TAG-COW-104',
    member_id: 'KMB-2026-0002',
    distribution_date: '2026-02-10',
    health_status: 'Healthy - Recent Deworming',
    is_sample: true,
    created_at: '2026-02-01T09:15:00Z',
    updated_at: '2026-02-10T11:00:00Z',
  },
  {
    livestock_id: 'LS-2026-003',
    animal_type: 'Boer Cross Goat',
    quantity: 5,
    tag_id: 'TAG-GT-201',
    member_id: 'KMB-2026-0003',
    distribution_date: '2026-02-28',
    health_status: 'Good Condition - Grazing Well',
    is_sample: true,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-28T16:20:00Z',
  },
  {
    livestock_id: 'LS-2026-004',
    animal_type: 'Native Breeder Sow',
    quantity: 2,
    tag_id: 'TAG-SW-032',
    member_id: null,
    distribution_date: null,
    health_status: 'Quarantined - Observation Period',
    is_sample: true,
    created_at: '2026-03-01T08:30:00Z',
    updated_at: '2026-03-01T08:30:00Z',
  },
  {
    livestock_id: 'LS-2026-005',
    animal_type: 'Brahman Bull',
    quantity: 1,
    tag_id: 'TAG-BLL-009',
    member_id: null,
    distribution_date: null,
    health_status: 'Healthy - Available for Dispersal',
    is_sample: true,
    created_at: '2026-03-02T13:45:00Z',
    updated_at: '2026-03-02T13:45:00Z',
  },
  {
    livestock_id: 'LS-2026-006',
    animal_type: 'Anglo-Nubian Dairy Goat',
    quantity: 3,
    tag_id: 'TAG-GT-214',
    member_id: 'KMB-2026-0001',
    distribution_date: '2026-03-05',
    health_status: 'Lactating - Regular Veterinary Checkup',
    is_sample: true,
    created_at: '2026-03-01T11:10:00Z',
    updated_at: '2026-03-05T09:00:00Z',
  },
  {
    livestock_id: 'LS-2026-007',
    animal_type: 'Carabao (Heifer)',
    quantity: 1,
    tag_id: 'TAG-CRB-092',
    member_id: 'KMB-2026-0004',
    distribution_date: '2026-03-12',
    health_status: 'Healthy - Hoof Trimmed',
    is_sample: true,
    created_at: '2026-03-10T14:00:00Z',
    updated_at: '2026-03-12T15:30:00Z',
  },
  {
    livestock_id: 'LS-2026-008',
    animal_type: 'Native Pig Breeder Trio',
    quantity: 4,
    tag_id: 'TAG-SW-055',
    member_id: null,
    distribution_date: null,
    health_status: 'Pending Veterinary Clearance',
    is_sample: true,
    created_at: '2026-03-14T09:20:00Z',
    updated_at: '2026-03-14T09:20:00Z',
  },
  {
    livestock_id: 'LS-2026-009',
    animal_type: 'Friesian Dairy Cow',
    quantity: 1,
    tag_id: 'TAG-COW-112',
    member_id: 'KMB-2026-0005',
    distribution_date: '2026-03-20',
    health_status: 'Under Treatment for Mild Mastitis',
    is_sample: true,
    created_at: '2026-03-15T16:00:00Z',
    updated_at: '2026-03-20T10:15:00Z',
  },
  {
    livestock_id: 'LS-2026-010',
    animal_type: 'Upgraded Boer Buck',
    quantity: 1,
    tag_id: 'TAG-GT-305',
    member_id: null,
    distribution_date: null,
    health_status: 'Active & Sound Breeder',
    is_sample: true,
    created_at: '2026-03-22T08:00:00Z',
    updated_at: '2026-03-22T08:00:00Z',
  },
];

/**
 * Initial sample audit logs
 */
export const SAMPLE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    user: 'Mario V. Macalalad (President)',
    role: 'President',
    action_taken: 'Assigned livestock LS-2026-009 (Friesian Dairy Cow) to member KMB-2026-0005',
    ip_address: '192.168.1.105',
    timestamp: '2026-03-20 10:15:22',
  },
  {
    id: 'aud-002',
    user: 'Mario V. Macalalad (President)',
    role: 'President',
    action_taken: 'Created livestock record LS-2026-010 (Upgraded Boer Buck, Tag: TAG-GT-305, Qty: 1)',
    ip_address: '192.168.1.105',
    timestamp: '2026-03-22 08:00:14',
  },
  {
    id: 'aud-003',
    user: 'Mario V. Macalalad (President)',
    role: 'President',
    action_taken: 'Assigned livestock LS-2026-007 (Carabao (Heifer)) to member KMB-2026-0004',
    ip_address: '192.168.1.105',
    timestamp: '2026-03-12 15:30:45',
  },
  {
    id: 'aud-004',
    user: 'Mario V. Macalalad (President)',
    role: 'President',
    action_taken: 'Assigned livestock LS-2026-006 (Anglo-Nubian Dairy Goat, Qty: 3) to member KMB-2026-0001',
    ip_address: '192.168.1.105',
    timestamp: '2026-03-05 09:00:11',
  },
  {
    id: 'aud-005',
    user: 'Mario V. Macalalad (President)',
    role: 'President',
    action_taken: 'Updated health_status for LS-2026-002 to "Healthy - Recent Deworming"',
    ip_address: '192.168.1.105',
    timestamp: '2026-02-10 11:00:30',
  },
];
