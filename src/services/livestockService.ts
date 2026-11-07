/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KIMS Livestock - Integration Ready Service Layer
 * Encapsulates all data access for tbl_livestock and audit logs.
 * Enforces role-based permissions at the data level ("deny by default").
 */

import {
  LivestockRecord,
  MemberReference,
  User,
  UserRole,
  AuditLogEntry,
  LivestockSummary,
  CreateLivestockInput,
  UpdateLivestockInput,
  AssignLivestockInput,
} from '../types/livestock';
import {
  SAMPLE_LIVESTOCK,
  SAMPLE_MEMBERS,
  SAMPLE_AUDIT_LOGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  LIVESTOCK: 'kims_tbl_livestock_v1',
  AUDIT_LOGS: 'kims_tbl_audit_logs_v1',
  MEMBERS_CACHE: 'kims_tbl_members_placeholder_v1',
};

/**
 * In-memory / LocalStorage Repository Implementation
 */
class LivestockRepository {
  private livestock: LivestockRecord[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private membersPlaceholder: MemberReference[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.livestock = [...SAMPLE_LIVESTOCK];
      this.auditLogs = [...SAMPLE_AUDIT_LOGS];
      this.membersPlaceholder = [...SAMPLE_MEMBERS];
      return;
    }

    try {
      const storedLivestock = localStorage.getItem(STORAGE_KEYS.LIVESTOCK);
      if (storedLivestock) {
        this.livestock = JSON.parse(storedLivestock);
      } else {
        this.livestock = [...SAMPLE_LIVESTOCK];
        this.saveLivestock();
      }

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      } else {
        this.auditLogs = [...SAMPLE_AUDIT_LOGS];
        this.saveAuditLogs();
      }

      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS_CACHE);
      if (storedMembers) {
        this.membersPlaceholder = JSON.parse(storedMembers);
      } else {
        this.membersPlaceholder = [...SAMPLE_MEMBERS];
        this.saveMembers();
      }
    } catch {
      this.livestock = [...SAMPLE_LIVESTOCK];
      this.auditLogs = [...SAMPLE_AUDIT_LOGS];
      this.membersPlaceholder = [...SAMPLE_MEMBERS];
    }
    this.isInitialized = true;
  }

  private saveLivestock() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.LIVESTOCK, JSON.stringify(this.livestock));
      } catch (e) {
        console.error('Failed to save livestock records to localStorage', e);
      }
    }
  }

  private saveAuditLogs() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      } catch (e) {
        console.error('Failed to save audit logs to localStorage', e);
      }
    }
  }

  private saveMembers() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.MEMBERS_CACHE, JSON.stringify(this.membersPlaceholder));
      } catch (e) {
        console.error('Failed to save members cache', e);
      }
    }
  }

  public resetToSampleData(): void {
    this.livestock = [...SAMPLE_LIVESTOCK];
    this.auditLogs = [...SAMPLE_AUDIT_LOGS];
    this.membersPlaceholder = [...SAMPLE_MEMBERS];
    this.saveLivestock();
    this.saveAuditLogs();
    this.saveMembers();
  }

  private recordAudit(user: User, action: string, ip = '127.0.0.1') {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: `${user.full_name} (${user.role})`,
      role: user.role,
      action_taken: action,
      ip_address: ip,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.auditLogs.unshift(entry);
    this.saveAuditLogs();
  }

  // --- ACCESS CONTROL VALIDATORS ---
  private checkRole(user: User, allowedRoles: UserRole[], actionName: string) {
    if (!user || !allowedRoles.includes(user.role)) {
      throw new Error(`Access denied: Role "${user?.role ?? 'Unknown'}" is not authorized to ${actionName}.`);
    }
  }

  // --- EXPOSED SERVICE METHODS ---

  /**
   * 1. List all livestock records
   * Allowed: President, Bookkeeper, General Manager, Officers and Staff
   * Denied: Member
   */
  public listLivestock(user: User): LivestockRecord[] {
    this.checkRole(
      user,
      ['President', 'Bookkeeper', 'General Manager', 'Officers and Staff'],
      'view full livestock records'
    );
    return [...this.livestock];
  }

  /**
   * 2. Get livestock by ID
   * Allowed: President, Bookkeeper, General Manager, Officers and Staff (all)
   * Member: only if assigned to member_id
   */
  public getLivestockById(id: string, user: User): LivestockRecord {
    const record = this.livestock.find((l) => l.livestock_id === id);
    if (!record) {
      throw new Error(`Livestock record with ID ${id} not found.`);
    }

    if (user.role === 'Member') {
      if (!user.member_id || record.member_id !== user.member_id) {
        throw new Error('Access denied: You can only view livestock assigned to your member ID.');
      }
    }

    return { ...record };
  }

  /**
   * 3. Create new livestock record
   * Allowed: President only
   */
  public createLivestock(input: CreateLivestockInput, user: User, clientIp = '127.0.0.1'): LivestockRecord {
    this.checkRole(user, ['President'], 'create livestock records');

    if (!input.animal_type || input.animal_type.trim() === '') {
      throw new Error('Animal type is required.');
    }
    if (!input.quantity || input.quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }
    if (!input.tag_id || input.tag_id.trim() === '') {
      throw new Error('Tag/ID is required.');
    }
    if (!input.health_status || input.health_status.trim() === '') {
      throw new Error('Health status is required.');
    }

    // Generate unique livestock_id
    const count = this.livestock.length + 1;
    const livestock_id = `LS-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const newRecord: LivestockRecord = {
      livestock_id,
      animal_type: input.animal_type.trim(),
      quantity: Number(input.quantity),
      tag_id: input.tag_id.trim(),
      member_id: input.member_id ? input.member_id.trim() : null,
      distribution_date: input.distribution_date ? input.distribution_date.trim() : null,
      health_status: input.health_status.trim(),
      is_sample: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.livestock.unshift(newRecord);
    this.saveLivestock();

    const actionText = newRecord.member_id
      ? `Created livestock ${newRecord.livestock_id} (${newRecord.animal_type}, Tag: ${newRecord.tag_id}) and assigned to ${newRecord.member_id}`
      : `Created livestock record ${newRecord.livestock_id} (${newRecord.animal_type}, Tag: ${newRecord.tag_id}, Qty: ${newRecord.quantity})`;
    
    this.recordAudit(user, actionText, clientIp);

    return { ...newRecord };
  }

  /**
   * 4. Update livestock record
   * Allowed: President only
   */
  public updateLivestock(
    id: string,
    input: UpdateLivestockInput,
    user: User,
    clientIp = '127.0.0.1'
  ): LivestockRecord {
    this.checkRole(user, ['President'], 'update livestock records');

    const index = this.livestock.findIndex((l) => l.livestock_id === id);
    if (index === -1) {
      throw new Error(`Livestock record ${id} not found.`);
    }

    const current = this.livestock[index];
    const changes: string[] = [];

    if (input.animal_type && input.animal_type !== current.animal_type) {
      changes.push(`animal_type to "${input.animal_type}"`);
    }
    if (input.quantity && input.quantity !== current.quantity) {
      changes.push(`quantity to ${input.quantity}`);
    }
    if (input.tag_id && input.tag_id !== current.tag_id) {
      changes.push(`tag_id to "${input.tag_id}"`);
    }
    if (input.health_status && input.health_status !== current.health_status) {
      changes.push(`health_status to "${input.health_status}"`);
    }
    if (input.member_id !== undefined && input.member_id !== current.member_id) {
      changes.push(`member_id to ${input.member_id || 'unassigned'}`);
    }
    if (input.distribution_date !== undefined && input.distribution_date !== current.distribution_date) {
      changes.push(`distribution_date to ${input.distribution_date || 'cleared'}`);
    }

    const updated: LivestockRecord = {
      ...current,
      ...(input.animal_type ? { animal_type: input.animal_type.trim() } : {}),
      ...(input.quantity !== undefined ? { quantity: Number(input.quantity) } : {}),
      ...(input.tag_id ? { tag_id: input.tag_id.trim() } : {}),
      ...(input.health_status ? { health_status: input.health_status.trim() } : {}),
      ...(input.member_id !== undefined ? { member_id: input.member_id ? input.member_id.trim() : null } : {}),
      ...(input.distribution_date !== undefined ? { distribution_date: input.distribution_date ? input.distribution_date.trim() : null } : {}),
      updated_at: new Date().toISOString(),
    };

    this.livestock[index] = updated;
    this.saveLivestock();

    const changeSummary = changes.length > 0 ? changes.join(', ') : 'details';
    this.recordAudit(user, `Updated livestock ${id}: ${changeSummary}`, clientIp);

    return { ...updated };
  }

  /**
   * 5. Assign livestock to member
   * Allowed: President only
   */
  public assignLivestock(
    id: string,
    input: AssignLivestockInput,
    user: User,
    clientIp = '127.0.0.1'
  ): LivestockRecord {
    this.checkRole(user, ['President'], 'assign livestock to members');

    const index = this.livestock.findIndex((l) => l.livestock_id === id);
    if (index === -1) {
      throw new Error(`Livestock record ${id} not found.`);
    }

    if (!input.member_id || !input.member_id.trim()) {
      throw new Error('Member ID is required for distribution assignment.');
    }
    if (!input.distribution_date || !input.distribution_date.trim()) {
      throw new Error('Distribution date (YYYY-MM-DD) is required.');
    }

    // Verify member exists in placeholder
    const member = this.getMemberById(input.member_id.trim());
    if (!member) {
      throw new Error(`Member ID ${input.member_id} not found in Members directory.`);
    }

    const current = this.livestock[index];
    const updated: LivestockRecord = {
      ...current,
      member_id: input.member_id.trim(),
      distribution_date: input.distribution_date.trim(),
      updated_at: new Date().toISOString(),
    };

    this.livestock[index] = updated;
    this.saveLivestock();

    this.recordAudit(
      user,
      `Assigned livestock ${id} (${updated.animal_type}, Tag: ${updated.tag_id}) to ${member.full_name} (${member.member_id}) on ${input.distribution_date}`,
      clientIp
    );

    return { ...updated };
  }

  /**
   * 5b. Unassign livestock
   * Allowed: President only
   */
  public unassignLivestock(id: string, user: User, clientIp = '127.0.0.1'): LivestockRecord {
    this.checkRole(user, ['President'], 'unassign livestock');

    const index = this.livestock.findIndex((l) => l.livestock_id === id);
    if (index === -1) {
      throw new Error(`Livestock record ${id} not found.`);
    }

    const current = this.livestock[index];
    const previousMemberId = current.member_id;

    const updated: LivestockRecord = {
      ...current,
      member_id: null,
      distribution_date: null,
      updated_at: new Date().toISOString(),
    };

    this.livestock[index] = updated;
    this.saveLivestock();

    this.recordAudit(
      user,
      `Revoked assignment of livestock ${id} (previously assigned to ${previousMemberId || 'N/A'})`,
      clientIp
    );

    return { ...updated };
  }

  /**
   * 6. List livestock by member_id
   * Allowed: Member (can ONLY query their own member_id)
   * Allowed: President, Bookkeeper, General Manager, Officers and Staff (can query any)
   */
  public listLivestockByMemberId(memberId: string, user: User): LivestockRecord[] {
    if (user.role === 'Member') {
      if (user.member_id !== memberId) {
        throw new Error('Access denied: Members can only view their own assigned livestock.');
      }
    }

    return this.livestock.filter((l) => l.member_id === memberId);
  }

  /**
   * 7. Summary counts and dashboard metrics
   * Allowed: President, Bookkeeper, General Manager, Officers and Staff
   * Denied: Member
   */
  public getLivestockSummary(user: User): LivestockSummary {
    this.checkRole(
      user,
      ['President', 'Bookkeeper', 'General Manager', 'Officers and Staff'],
      'view dashboard and summary reports'
    );

    const total_records = this.livestock.length;
    let total_headcount = 0;
    let assigned_count = 0;
    let unassigned_count = 0;
    let assigned_headcount = 0;
    let unassigned_headcount = 0;

    const by_animal_type: { [key: string]: { count: number; total_quantity: number } } = {};
    const by_health_status: { [key: string]: number } = {};

    this.livestock.forEach((l) => {
      const qty = Number(l.quantity) || 1;
      total_headcount += qty;

      if (l.member_id) {
        assigned_count += 1;
        assigned_headcount += qty;
      } else {
        unassigned_count += 1;
        unassigned_headcount += qty;
      }

      // Animal type grouping
      const normalizedType = l.animal_type.trim();
      if (!by_animal_type[normalizedType]) {
        by_animal_type[normalizedType] = { count: 0, total_quantity: 0 };
      }
      by_animal_type[normalizedType].count += 1;
      by_animal_type[normalizedType].total_quantity += qty;

      // Health status grouping
      const normalizedHealth = l.health_status.trim();
      by_health_status[normalizedHealth] = (by_health_status[normalizedHealth] || 0) + 1;
    });

    const recent_distributions = this.livestock
      .filter((l) => l.member_id && l.distribution_date)
      .sort((a, b) => (b.distribution_date || '').localeCompare(a.distribution_date || ''))
      .slice(0, 5);

    return {
      total_headcount,
      total_records,
      assigned_count,
      unassigned_count,
      assigned_headcount,
      unassigned_headcount,
      by_animal_type,
      by_health_status,
      recent_distributions,
    };
  }

  /**
   * 8. Audit Log
   * Allowed: President only
   * Returns entries newest first
   */
  public getAuditLogs(user: User): AuditLogEntry[] {
    this.checkRole(user, ['President'], 'view audit logs');
    return [...this.auditLogs];
  }

  /**
   * Members Placeholder Reference List
   * "Placeholder: will be replaced by the Members module"
   */
  public getMembersPlaceholder(): MemberReference[] {
    return [...this.membersPlaceholder];
  }

  public getMemberById(memberId: string): MemberReference | undefined {
    return this.membersPlaceholder.find((m) => m.member_id === memberId);
  }
}

// Singleton export
export const livestockService = new LivestockRepository();
