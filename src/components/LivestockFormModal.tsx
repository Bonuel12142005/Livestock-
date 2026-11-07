/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Add / Edit Livestock Form Modal
 * Authorized: President ONLY
 * Inputs: animal_type, quantity, tag_id, member_id (optional), distribution_date (optional), health_status
 * Note: animal_type and health_status are free plain text (no fixed enum list).
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { LivestockRecord, CreateLivestockInput, UpdateLivestockInput } from '../types/livestock';
import { livestockService } from '../services/livestockService';
import { useAuth } from '../context/AuthContext';

interface LivestockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: LivestockRecord | null;
  onSuccess: () => void;
}

export const LivestockFormModal: React.FC<LivestockFormModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const members = livestockService.getMembersPlaceholder();

  const [animalType, setAnimalType] = useState('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [tagId, setTagId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [distributionDate, setDistributionDate] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setAnimalType(recordToEdit.animal_type || '');
      setQuantity(recordToEdit.quantity || 1);
      setTagId(recordToEdit.tag_id || '');
      setMemberId(recordToEdit.member_id || '');
      setDistributionDate(recordToEdit.distribution_date || '');
      setHealthStatus(recordToEdit.health_status || '');
    } else {
      setAnimalType('');
      setQuantity(1);
      setTagId('');
      setMemberId('');
      setDistributionDate('');
      setHealthStatus('Healthy');
    }
    setError(null);
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in.');
      return;
    }

    if (!animalType.trim()) {
      setError('Please provide the animal type (e.g. Carabao, Native Cow, Boer Goat).');
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    if (!tagId.trim()) {
      setError('Tag/ID is required for livestock tracking.');
      return;
    }

    if (!healthStatus.trim()) {
      setError('Health/Status description is required.');
      return;
    }

    if (memberId && !distributionDate) {
      setError('Please provide a distribution date when assigning to a member.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (recordToEdit) {
        const updatePayload: UpdateLivestockInput = {
          animal_type: animalType.trim(),
          quantity: qty,
          tag_id: tagId.trim(),
          member_id: memberId.trim() || null,
          distribution_date: memberId.trim() ? distributionDate.trim() : null,
          health_status: healthStatus.trim(),
        };
        livestockService.updateLivestock(recordToEdit.livestock_id, updatePayload, currentUser);
      } else {
        const createPayload: CreateLivestockInput = {
          animal_type: animalType.trim(),
          quantity: qty,
          tag_id: tagId.trim(),
          member_id: memberId.trim() || null,
          distribution_date: memberId.trim() ? distributionDate.trim() : null,
          health_status: healthStatus.trim(),
        };
        livestockService.createLivestock(createPayload, currentUser);
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0E15]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1E2638]">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider">
              {recordToEdit ? `Edit Livestock ${recordToEdit.livestock_id}` : 'President Entry'}
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFC]">
              {recordToEdit ? 'Update Livestock Record' : 'Register New Livestock'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#1E2638]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-xl bg-[#0B0E15] border border-[#F59E0B]/50 flex items-start space-x-2.5 text-xs text-[#FBBF24]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#F59E0B] mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-4 py-2">
          
          {/* Animal Type (Plain text as specified) */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
              Animal Type <span className="text-[#F59E0B]">*</span>
              <span className="text-[10px] text-[#9CA3AF]/80 font-normal ml-1.5">(Plain text: e.g. Carabao, Native Cow, Boer Goat, Native Pig)</span>
            </label>
            <input
              type="text"
              required
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value)}
              placeholder="e.g. Carabao (Draft), Boer Goat, Native Cattle"
              className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#9CA3AF]/40 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
                Quantity (Headcount) <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-[#F8FAFC] outline-none transition-colors"
              />
            </div>

            {/* Tag / ID */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
                Tag / Identification ID <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="text"
                required
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                placeholder="e.g. TAG-CRB-120"
                className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-[#F8FAFC] font-mono placeholder-[#9CA3AF]/40 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Health / Status (Plain text as specified) */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
              Health / Status <span className="text-[#F59E0B]">*</span>
              <span className="text-[10px] text-[#9CA3AF]/80 font-normal ml-1.5">(Plain text: e.g. Healthy, Vaccinated, Under Observation)</span>
            </label>
            <input
              type="text"
              required
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value)}
              placeholder="e.g. Healthy & Vaccinated, Quarantined, Good Condition"
              className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#9CA3AF]/40 outline-none transition-colors"
            />
          </div>

          {/* Section Divider */}
          <div className="pt-2 border-t border-[#1E2638]">
            <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider mb-2">
              Distribution &amp; Member Assignment (Optional)
            </div>
            <p className="text-[11px] text-[#9CA3AF] mb-3">
              Leave unassigned if livestock is currently in cooperative holding.
            </p>

            <div className="space-y-3">
              {/* Member Selector (looks up from placeholder) */}
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
                  Assign to Member (member_id)
                </label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-[#F8FAFC] outline-none transition-colors"
                >
                  <option value="">-- Unassigned (Cooperative Holding) --</option>
                  {members.map((m) => (
                    <option key={m.member_id} value={m.member_id}>
                      {m.member_id} • {m.full_name} ({m.barangay || 'Carmundo'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Distribution Date */}
              {memberId && (
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
                    Distribution Date (YYYY-MM-DD) <span className="text-[#F59E0B]">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={distributionDate}
                      onChange={(e) => setDistributionDate(e.target.value)}
                      required={!!memberId}
                      className="flex-1 bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-[#F8FAFC] font-mono outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setDistributionDate(new Date().toISOString().substring(0, 10))}
                      className="px-3 py-2 bg-[#1E2638] hover:bg-[#1E2638]/80 text-[#F8FAFC] rounded-xl text-xs font-semibold transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#1E2638] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F8FAFC] bg-[#1E2638]/40 hover:bg-[#1E2638] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F59E0B] text-[#0B0E15] hover:bg-[#FBBF24] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : recordToEdit ? 'Save Changes' : 'Create Record'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
