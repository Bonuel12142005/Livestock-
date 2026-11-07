/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Assign Livestock to Member Modal
 * Authorized: President ONLY
 * Assigns member_id and distribution_date to tbl_livestock
 * Never stores member name; looks up by member_id.
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { LivestockRecord } from '../types/livestock';
import { livestockService } from '../services/livestockService';
import { useAuth } from '../context/AuthContext';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LivestockRecord | null;
  onSuccess: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  record,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const members = livestockService.getMembersPlaceholder();

  const [memberId, setMemberId] = useState('');
  const [distributionDate, setDistributionDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setMemberId(record.member_id || (members[0]?.member_id || ''));
      setDistributionDate(record.distribution_date || new Date().toISOString().substring(0, 10));
    }
    setError(null);
  }, [record, isOpen, members]);

  if (!isOpen || !record) return null;

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!memberId) {
      setError('Please select a member.');
      return;
    }
    if (!distributionDate) {
      setError('Please provide a distribution date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      livestockService.assignLivestock(
        record.livestock_id,
        {
          member_id: memberId,
          distribution_date: distributionDate,
        },
        currentUser
      );
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to assign livestock.');
    }
  };

  const handleUnassign = () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setError(null);

    try {
      livestockService.unassignLivestock(record.livestock_id, currentUser);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to revoke assignment.');
    }
  };

  const selectedMemberObj = members.find((m) => m.member_id === memberId);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0E15]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1E2638]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider">
                Distribution Assignment
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">
                Assign Livestock to Member
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

        {error && (
          <div className="my-3 p-3 rounded-xl bg-[#0B0E15] border border-[#F59E0B]/50 flex items-start space-x-2 text-xs text-[#FBBF24]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#F59E0B] mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Selected Livestock Summary Card */}
        <div className="my-4 p-4 rounded-xl bg-[#0B0E15] border border-[#1E2638]">
          <div className="text-[10px] uppercase font-bold text-[#9CA3AF]">Target Livestock Item</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-[#F8FAFC]">{record.animal_type}</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#1E2638] text-[#FBBF24]">
              {record.tag_id}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] mt-2 pt-2 border-t border-[#1E2638]/60 font-mono">
            <span>ID: {record.livestock_id}</span>
            <span>Headcount: {record.quantity}</span>
            <span>Status: {record.health_status}</span>
          </div>
        </div>

        <form onSubmit={handleAssign} className="space-y-4">
          
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
              Select Beneficiary Member <span className="text-[#F59E0B]">*</span>
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-[#F8FAFC] outline-none"
            >
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.member_id} — {m.full_name} ({m.barangay || 'Carmundo'})
                </option>
              ))}
            </select>
            {selectedMemberObj && (
              <p className="text-[11px] text-[#9CA3AF] mt-1.5 flex items-center justify-between">
                <span>Assignee: <strong className="text-[#F8FAFC]">{selectedMemberObj.full_name}</strong></span>
                <span className="font-mono text-[#FBBF24]">{selectedMemberObj.member_id}</span>
              </p>
            )}
          </div>

          {/* Distribution Date */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
              Distribution Date (YYYY-MM-DD) <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                required
                value={distributionDate}
                onChange={(e) => setDistributionDate(e.target.value)}
                className="flex-1 bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-[#F8FAFC] font-mono outline-none"
              />
              <button
                type="button"
                onClick={() => setDistributionDate(new Date().toISOString().substring(0, 10))}
                className="px-3.5 py-2 bg-[#1E2638] hover:bg-[#1E2638]/80 text-[#F8FAFC] rounded-xl text-xs font-semibold transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#1E2638] flex items-center justify-between">
            {record.member_id ? (
              <button
                type="button"
                onClick={handleUnassign}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F8FAFC] border border-[#1E2638] hover:bg-[#1E2638]/40 transition-colors"
              >
                Unassign (Return to Holding)
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F8FAFC] bg-[#1E2638]/40 hover:bg-[#1E2638]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F59E0B] text-[#0B0E15] hover:bg-[#FBBF24] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Logging...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
