/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Members Placeholder Modal
 * Explicitly labeled: "Placeholder: will be replaced by the Members module"
 * Read-only reference table of member_id and full_name.
 */

import React from 'react';
import { X, Users, AlertTriangle, ExternalLink } from 'lucide-react';
import { livestockService } from '../services/livestockService';

interface MembersPlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembersPlaceholderModal: React.FC<MembersPlaceholderModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const members = livestockService.getMembersPlaceholder();

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0E15]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1E2638]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider">
                External Module Integration
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">
                Members Reference List
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

        {/* Notice Banner */}
        <div className="my-4 p-3.5 rounded-xl bg-[#0B0E15] border border-[#F59E0B]/30 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#FBBF24] uppercase tracking-wide block">
              Placeholder: will be replaced by the Members module
            </span>
            <p className="text-[#9CA3AF] mt-1">
              Per KIMS architectural design, livestock records store only the <code className="font-mono text-[#F8FAFC] bg-[#1E2638] px-1 py-0.5 rounded">member_id</code> string (format <code className="font-mono text-[#FBBF24]">KMB-YYYY-NNNN</code>). Member details are looked up by ID and never stored within livestock tables.
            </p>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2638] text-[#9CA3AF] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">Member ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Barangay / Location</th>
                <th className="py-2.5 px-3 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/60">
              {members.map((m) => (
                <tr key={m.member_id} className="hover:bg-[#1E2638]/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#FBBF24]">
                    {m.member_id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                    {m.full_name}
                  </td>
                  <td className="py-3 px-3 text-[#9CA3AF]">
                    {m.barangay || 'Carmundo, Bongabong'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#9CA3AF]">
                    {m.contact_number || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[#1E2638] flex items-center justify-between text-xs text-[#9CA3AF]">
          <span className="flex items-center space-x-1">
            <ExternalLink className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Read-only reference: 5 active members loaded</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E2638] text-[#F8FAFC] hover:bg-[#1E2638]/80 transition-colors"
          >
            Close Reference
          </button>
        </div>

      </div>
    </div>
  );
};
