/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Integration Notes Modal for KAMBAC Teammates
 * Full technical specification, endpoints, entity contracts, role matrix.
 */

import React, { useState } from 'react';
import { X, Code, Copy, Check, Database, KeyRound, Layers, Link2 } from 'lucide-react';

interface IntegrationNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationNotesModal: React.FC<IntegrationNotesModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const entityJson = `{
  "entity": "tbl_livestock",
  "fields": {
    "livestock_id": "string (Primary Key, e.g. LS-2026-001)",
    "animal_type": "string (plain text, e.g. Carabao (Draft), Native Cow)",
    "quantity": "integer (headcount, positive integer)",
    "tag_id": "string (unique ear tag / identifier, e.g. TAG-CRB-081)",
    "member_id": "string | null (Foreign Key to tbl_members, format: KMB-YYYY-NNNN)",
    "distribution_date": "string | null (format: YYYY-MM-DD)",
    "health_status": "string (plain text, e.g. Healthy & Vaccinated)"
  }
}`;

  const endpointsSpec = `// KAMBAC Livestock Module Service & REST API Contracts

1. listLivestock(userContext)
   Method: GET /api/livestock
   Authorized: President, Bookkeeper, General Manager, Officers and Staff
   Output: LivestockRecord[]
   Error: 403 Forbidden if role === 'Member'

2. getLivestockById(id, userContext)
   Method: GET /api/livestock/:id
   Authorized: All internal roles (full access); Member only if record.member_id === user.member_id
   Output: LivestockRecord
   Error: 403 Forbidden or 404 Not Found

3. createLivestock(payload, userContext)
   Method: POST /api/livestock
   Authorized: President ONLY
   Input: { animal_type: string, quantity: number, tag_id: string, member_id?: string|null, distribution_date?: string|null, health_status: string }
   Output: LivestockRecord (201 Created)
   Audit: Automatically writes to tbl_audit_logs

4. updateLivestock(id, payload, userContext)
   Method: PUT /api/livestock/:id
   Authorized: President ONLY
   Input: Partial<LivestockRecord>
   Output: LivestockRecord (200 OK)
   Audit: Writes field diffs to tbl_audit_logs

5. assignLivestock(id, { member_id, distribution_date }, userContext)
   Method: POST /api/livestock/:id/assign
   Authorized: President ONLY
   Input: { member_id: "KMB-YYYY-NNNN", distribution_date: "YYYY-MM-DD" }
   Output: LivestockRecord (200 OK)
   Audit: Logs member assignment event

6. unassignLivestock(id, userContext)
   Method: POST /api/livestock/:id/unassign
   Authorized: President ONLY
   Output: LivestockRecord (200 OK)
   Audit: Logs unassignment event

7. listLivestockByMemberId(member_id, userContext)
   Method: GET /api/livestock/member/:member_id
   Authorized: Member (own member_id ONLY); Officers/President/GM/Bookkeeper (any)
   Output: LivestockRecord[]

8. getLivestockSummary(userContext)
   Method: GET /api/livestock/summary
   Authorized: President, Bookkeeper, General Manager, Officers and Staff
   Output: { total_headcount, total_records, assigned_count, unassigned_count, by_animal_type, by_health_status }

9. getAuditLogs(userContext)
   Method: GET /api/audit-logs
   Authorized: President ONLY
   Output: AuditLogEntry[] (sorted newest first)`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0E15]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1E2638]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center">
              <Code className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider">
                Cross-Module Specification
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">
                KIMS Livestock Module Integration Notes
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#1E2638]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Scrollable Area */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-6 py-4">
          
          {/* Section 1: Entity & Field Names */}
          <div className="bg-[#0B0E15] border border-[#1E2638] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#F59E0B]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                  1. Entity & Field Names (<code className="text-[#FBBF24]">tbl_livestock</code>)
                </h4>
              </div>
              <button
                onClick={() => copyToClipboard(entityJson, 'entity')}
                className="text-[11px] text-[#9CA3AF] hover:text-[#FBBF24] flex items-center space-x-1"
              >
                {copiedSection === 'entity' ? <Check className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'entity' ? 'Copied' : 'Copy Schema'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-[#9CA3AF] bg-[#0F1626] p-3 rounded-lg overflow-x-auto border border-[#1E2638]">
              {entityJson}
            </pre>
          </div>

          {/* Section 2: Member ID Linking Rule */}
          <div className="bg-[#0B0E15] border border-[#1E2638] rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Link2 className="w-4 h-4 text-[#F59E0B]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                2. Member Linkage Rule (<code className="text-[#FBBF24]">member_id</code>)
              </h4>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              • <strong className="text-[#F8FAFC]">Format:</strong> <code className="text-[#FBBF24] font-mono font-bold">KMB-YYYY-NNNN</code> (e.g. <code className="text-[#FBBF24] font-mono">KMB-2026-0001</code>).<br />
              • <strong className="text-[#F8FAFC]">Rule:</strong> Never store the member&apos;s name inside the livestock record; look it up by <code className="text-[#FBBF24] font-mono">member_id</code>.<br />
              • <strong className="text-[#F8FAFC]">Placeholder:</strong> Current prototype references <code className="text-[#F8FAFC] font-mono">SAMPLE_MEMBERS</code> in a standalone provider, ready to swap with the centralized Members module REST endpoint.
            </p>
          </div>

          {/* Section 3: Exact Role Names */}
          <div className="bg-[#0B0E15] border border-[#1E2638] rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <KeyRound className="w-4 h-4 text-[#F59E0B]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                3. Exact Role Names (Spelled Exactly)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0F1626] border border-[#1E2638]">
                <div className="font-mono font-bold text-[#FBBF24]">President</div>
                <div className="text-[11px] text-[#9CA3AF]">Full CRUD, distribution logs, and audit trail.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1626] border border-[#1E2638]">
                <div className="font-mono font-bold text-[#F8FAFC]">Bookkeeper</div>
                <div className="text-[11px] text-[#9CA3AF]">View-only livestock list and dashboard summaries.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1626] border border-[#1E2638]">
                <div className="font-mono font-bold text-[#F8FAFC]">General Manager</div>
                <div className="text-[11px] text-[#9CA3AF]">View-only livestock list and dashboard summaries.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1626] border border-[#1E2638]">
                <div className="font-mono font-bold text-[#F8FAFC]">Officers and Staff</div>
                <div className="text-[11px] text-[#9CA3AF]">View-only livestock list and dashboard summaries.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1626] border border-[#1E2638] sm:col-span-2">
                <div className="font-mono font-bold text-[#FBBF24]">Member</div>
                <div className="text-[11px] text-[#9CA3AF]">View assigned livestock ONLY (where livestock.member_id === user.member_id). All other views return Access Denied.</div>
              </div>
            </div>
          </div>

          {/* Section 4: Endpoints & Functions */}
          <div className="bg-[#0B0E15] border border-[#1E2638] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#F59E0B]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                  4. API Endpoints &amp; Service Functions
                </h4>
              </div>
              <button
                onClick={() => copyToClipboard(endpointsSpec, 'endpoints')}
                className="text-[11px] text-[#9CA3AF] hover:text-[#FBBF24] flex items-center space-x-1"
              >
                {copiedSection === 'endpoints' ? <Check className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'endpoints' ? 'Copied' : 'Copy Specs'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-[#9CA3AF] bg-[#0F1626] p-3 rounded-lg overflow-x-auto border border-[#1E2638] whitespace-pre-wrap">
              {endpointsSpec}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#1E2638] flex items-center justify-between">
          <p className="text-[11px] text-[#9CA3AF]">
            Standardized for KAMBAC Integrated Management System (Carmundo, Bongabong).
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F59E0B] text-[#0B0E15] hover:bg-[#FBBF24] transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
