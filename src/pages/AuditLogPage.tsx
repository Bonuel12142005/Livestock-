/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Audit Log Page
 * KAMBAC Integrated Management System (KIMS)
 * Authorized: President ONLY
 * Records create, update, and assignment actions with user, action taken, IP address, timestamp (newest first).
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { livestockService } from '../services/livestockService';
import { ShieldAlert, Search, Filter, History, Globe, Clock, User, CheckCircle2 } from 'lucide-react';
import { AccessDenied } from '../components/AccessDenied';

interface AuditLogPageProps {
  onNavigateToRegistry: () => void;
}

export const AuditLogPage: React.FC<AuditLogPageProps> = ({ onNavigateToRegistry }) => {
  const { currentUser, canViewAuditLog } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Access check: President only
  if (!currentUser || !canViewAuditLog) {
    return (
      <AccessDenied 
        requiredRoleMessage="The Audit Log records sensitive operational transactions and is strictly restricted to the KAMBAC President."
        onGoBack={onNavigateToRegistry}
      />
    );
  }

  const logs = livestockService.getAuditLogs(currentUser);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.action_taken.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.ip_address.toLowerCase().includes(q) ||
      log.timestamp.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-bold text-[#F59E0B]">
            System Governance &amp; Security
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight mt-0.5">
            Livestock Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Immutable log of livestock registrations, updates, and member distribution assignments.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0F1626] border border-[#1E2638] text-xs font-mono text-[#FBBF24] flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>{logs.length} logged events</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by action, officer, livestock ID, or IP..."
            className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#9CA3AF]/50 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Audit Log Table / Feed */}
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1E2638] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
            <History className="w-4 h-4 text-[#F59E0B]" />
            <span>Transaction History (Newest First)</span>
          </div>
          <span className="text-[11px] text-[#9CA3AF] font-mono">
            Sorted descending by timestamp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2638] bg-[#0B0E15]/50 text-[#9CA3AF] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Officer / User</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[#9CA3AF]">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#1E2638]/20 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[#FBBF24] whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{entry.timestamp}</span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-[#F8FAFC] flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>{entry.user}</span>
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E2638] text-[#9CA3AF]">
                        {entry.role}
                      </span>
                    </td>

                    {/* Action Taken */}
                    <td className="py-3.5 px-4 text-[#F8FAFC]">
                      <div className="font-medium leading-relaxed max-w-xl">
                        {entry.action_taken}
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="py-3.5 px-4 text-right font-mono text-[#9CA3AF] whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <Globe className="w-3 h-3 text-[#9CA3AF]" />
                        <span>{entry.ip_address}</span>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
