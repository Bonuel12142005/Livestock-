/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Livestock List & Registry Page
 * KAMBAC Integrated Management System (KIMS)
 * President: Add, Edit, Assign, Update health status
 * Bookkeeper, General Manager, Officers and Staff: View only
 * Member: Denied by default (redirected or shows Access Denied)
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { livestockService } from '../services/livestockService';
import { LivestockRecord } from '../types/livestock';
import { 
  Search, 
  Plus, 
  UserCheck, 
  Edit3, 
  Filter, 
  Tag, 
  CheckCircle,
  Eye,
  Calendar,
  X
} from 'lucide-react';
import { AccessDenied } from '../components/AccessDenied';
import { LivestockFormModal } from '../components/LivestockFormModal';
import { AssignModal } from '../components/AssignModal';

interface LivestockListPageProps {
  onRefresh: () => void;
  onNavigateToMyLivestock?: () => void;
}

export const LivestockListPage: React.FC<LivestockListPageProps> = ({ onRefresh, onNavigateToMyLivestock }) => {
  const { currentUser, canViewLivestockList, canManageLivestock, isMember } = useAuth();

  // Search & Filters as specifically required:
  // "filters (animal type, assigned member, health/status)"
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimalType, setSelectedAnimalType] = useState<string>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all'); // 'all', 'unassigned', or member_id
  const [selectedHealthStatus, setSelectedHealthStatus] = useState<string>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<LivestockRecord | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [recordToAssign, setRecordToAssign] = useState<LivestockRecord | null>(null);
  const [viewDetailsRecord, setViewDetailsRecord] = useState<LivestockRecord | null>(null);

  // Security gate: Deny by default
  if (!currentUser || !canViewLivestockList) {
    return (
      <AccessDenied 
        requiredRoleMessage="Only KAMBAC Leadership (President) and Administrative Officers (Bookkeeper, General Manager, Officers and Staff) have clearance to view the central livestock registry."
        onGoBack={isMember ? onNavigateToMyLivestock : undefined}
      />
    );
  }

  // Fetch from service layer
  const allRecords = livestockService.listLivestock(currentUser);
  const members = livestockService.getMembersPlaceholder();

  // Extract distinct animal types for filter dropdown
  const animalTypes = useMemo(() => {
    const types = new Set<string>();
    allRecords.forEach((r) => {
      if (r.animal_type?.trim()) types.add(r.animal_type.trim());
    });
    return Array.from(types);
  }, [allRecords]);

  // Extract distinct health statuses for filter dropdown
  const healthStatuses = useMemo(() => {
    const statuses = new Set<string>();
    allRecords.forEach((r) => {
      if (r.health_status?.trim()) statuses.add(r.health_status.trim());
    });
    return Array.from(statuses);
  }, [allRecords]);

  // Filtered records based on animal type, assigned member, and health/status
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      // 1. Filter by Animal Type
      if (selectedAnimalType !== 'all' && record.animal_type.trim() !== selectedAnimalType) {
        return false;
      }

      // 2. Filter by Assigned Member
      if (selectedMemberFilter === 'unassigned') {
        if (record.member_id) return false;
      } else if (selectedMemberFilter !== 'all') {
        if (record.member_id !== selectedMemberFilter) return false;
      }

      // 3. Filter by Health/Status
      if (selectedHealthStatus !== 'all' && record.health_status.trim() !== selectedHealthStatus) {
        return false;
      }

      // 4. Search term (tag_id, animal_type, member_id, health_status, or looked up member name)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const tagMatch = record.tag_id.toLowerCase().includes(query);
        const typeMatch = record.animal_type.toLowerCase().includes(query);
        const healthMatch = record.health_status.toLowerCase().includes(query);
        const memberIdMatch = record.member_id?.toLowerCase().includes(query) ?? false;
        
        let memberNameMatch = false;
        if (record.member_id) {
          const memberObj = members.find((m) => m.member_id === record.member_id);
          if (memberObj?.full_name.toLowerCase().includes(query)) {
            memberNameMatch = true;
          }
        }

        return tagMatch || typeMatch || healthMatch || memberIdMatch || memberNameMatch;
      }

      return true;
    });
  }, [allRecords, selectedAnimalType, selectedMemberFilter, selectedHealthStatus, searchTerm, members]);

  const hasActiveFilters = searchTerm !== '' || selectedAnimalType !== 'all' || selectedMemberFilter !== 'all' || selectedHealthStatus !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedAnimalType('all');
    setSelectedMemberFilter('all');
    setSelectedHealthStatus('all');
  };

  const handleOpenCreate = () => {
    setRecordToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (rec: LivestockRecord) => {
    setRecordToEdit(rec);
    setIsFormModalOpen(true);
  };

  const handleOpenAssign = (rec: LivestockRecord) => {
    setRecordToAssign(rec);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-bold text-[#F59E0B]">
            KAMBAC Livestock Database
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight mt-0.5">
            Livestock Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Official distribution logs and monitoring records for Carmundo, Bongabong.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {canManageLivestock ? (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F59E0B] text-[#0B0E15] hover:bg-[#FBBF24] transition-all flex items-center space-x-2 shadow-lg shadow-[#F59E0B]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Register Livestock</span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-[#0F1626] border border-[#1E2638] text-[11px] text-[#9CA3AF] flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
              <span>View-Only Mode ({currentUser.role})</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Search &amp; Monitoring Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-[#9CA3AF] hover:text-[#FBBF24] flex items-center space-x-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* 1. Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Tag, Animal, Member, Status..."
              className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder-[#9CA3AF]/50 outline-none transition-colors"
            />
          </div>

          {/* 2. Filter by Animal Type */}
          <div>
            <select
              value={selectedAnimalType}
              onChange={(e) => setSelectedAnimalType(e.target.value)}
              className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] outline-none"
            >
              <option value="all">Animal Type: All Species</option>
              {animalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Filter by Assigned Member */}
          <div>
            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] outline-none"
            >
              <option value="all">Assigned Member: All Records</option>
              <option value="unassigned">In Holding (Unassigned)</option>
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.member_id} • {m.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Filter by Health/Status */}
          <div>
            <select
              value={selectedHealthStatus}
              onChange={(e) => setSelectedHealthStatus(e.target.value)}
              className="w-full bg-[#0B0E15] border border-[#1E2638] focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] outline-none"
            >
              <option value="all">Health / Status: All Conditions</option>
              {healthStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Results Summary */}
        <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] pt-1">
          <span>
            Showing <strong className="text-[#FBBF24] font-mono">{filteredRecords.length}</strong> of <span className="font-mono">{allRecords.length}</span> livestock records
          </span>
          {hasActiveFilters && (
            <span className="text-[#FBBF24]">Filters active</span>
          )}
        </div>
      </div>

      {/* Main Table for Desktop */}
      <div className="hidden md:block bg-[#0F1626] border border-[#1E2638] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2638] bg-[#0B0E15]/60 text-[#9CA3AF] uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Tag / Identification</th>
              <th className="py-3.5 px-4">Animal Type</th>
              <th className="py-3.5 px-3 text-center">Headcount</th>
              <th className="py-3.5 px-4">Assigned Member (Lookup)</th>
              <th className="py-3.5 px-4">Distribution Date</th>
              <th className="py-3.5 px-4">Health / Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]/70">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#9CA3AF]">
                  <p className="font-semibold text-sm text-[#F8FAFC]">No livestock records found</p>
                  <p className="text-xs mt-1">Try adjusting your search criteria or filters.</p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const assignedMember = record.member_id
                  ? members.find((m) => m.member_id === record.member_id)
                  : null;

                return (
                  <tr key={record.livestock_id} className="hover:bg-[#1E2638]/20 transition-colors">
                    
                    {/* Tag ID & Record ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#FBBF24] flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{record.tag_id}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#9CA3AF] mt-0.5">
                        {record.livestock_id}
                      </div>
                    </td>

                    {/* Animal Type */}
                    <td className="py-3.5 px-4 font-semibold text-[#F8FAFC]">
                      {record.animal_type}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#1E2638] text-[#F8FAFC]">
                        {record.quantity}
                      </span>
                    </td>

                    {/* Assigned Member */}
                    <td className="py-3.5 px-4">
                      {record.member_id ? (
                        <div>
                          <div className="font-semibold text-[#F8FAFC]">
                            {assignedMember?.full_name || 'Member Found'}
                          </div>
                          <div className="font-mono text-[11px] text-[#FBBF24]">
                            {record.member_id}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-[#1E2638] bg-[#1E2638]/50 text-[#9CA3AF]">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Distribution Date */}
                    <td className="py-3.5 px-4 font-mono text-[#9CA3AF]">
                      {record.distribution_date ? (
                        <span className="text-[#F8FAFC]">{record.distribution_date}</span>
                      ) : (
                        <span className="text-[#9CA3AF]/60 italic">In Holding</span>
                      )}
                    </td>

                    {/* Health Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium border border-[#1E2638] bg-[#0B0E15] text-[#F8FAFC]">
                        {record.health_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {canManageLivestock ? (
                        <>
                          <button
                            onClick={() => handleOpenAssign(record)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#1E2638] hover:border-[#F59E0B] text-[#FBBF24] hover:bg-[#1E2638]/40 transition-colors inline-flex items-center space-x-1"
                            title="Assign to Member"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span>{record.member_id ? 'Reassign' : 'Assign'}</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(record)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#1E2638]/50 transition-colors inline-flex items-center space-x-1"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setViewDetailsRecord(record)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#1E2638]/50 transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-8 text-center text-[#9CA3AF]">
            No livestock records match your filter.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const assignedMember = record.member_id
              ? members.find((m) => m.member_id === record.member_id)
              : null;

            return (
              <div
                key={record.livestock_id}
                className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono font-bold text-sm text-[#FBBF24] flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{record.tag_id}</span>
                    </div>
                    <div className="text-base font-extrabold text-[#F8FAFC] mt-0.5">
                      {record.animal_type}
                    </div>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#1E2638] text-[#F8FAFC] font-bold">
                    Qty: {record.quantity}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Beneficiary:</span>
                    <span className="font-semibold text-[#F8FAFC] text-right">
                      {assignedMember ? assignedMember.full_name : 'Unassigned (In Holding)'}
                    </span>
                  </div>
                  {record.member_id && (
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-[#9CA3AF]">Member ID:</span>
                      <span className="text-[#FBBF24]">{record.member_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Distribution:</span>
                    <span className="text-[#F8FAFC] font-mono">{record.distribution_date || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#1E2638]">
                    <span className="text-[#9CA3AF]">Health / Status:</span>
                    <span className="text-[#F8FAFC]">{record.health_status}</span>
                  </div>
                </div>

                {canManageLivestock ? (
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleOpenAssign(record)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#F59E0B] text-[#0B0E15] flex items-center justify-center space-x-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{record.member_id ? 'Reassign' : 'Assign Member'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(record)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1E2638] text-[#F8FAFC] hover:bg-[#1E2638]/80"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setViewDetailsRecord(record)}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-[#1E2638] text-[#F8FAFC] flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Record Details</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Record Details Modal (for view-only roles or inspection) */}
      {viewDetailsRecord && (
        <div className="fixed inset-0 z-50 bg-[#0B0E15]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-start justify-between pb-3 border-b border-[#1E2638]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider font-mono">
                  {viewDetailsRecord.livestock_id}
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC]">
                  {viewDetailsRecord.animal_type}
                </h3>
              </div>
              <button
                onClick={() => setViewDetailsRecord(null)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638]">
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold">Tag / Identifier</span>
                  <div className="font-mono text-sm font-bold text-[#FBBF24] mt-0.5">
                    {viewDetailsRecord.tag_id}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638]">
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold">Quantity (Headcount)</span>
                  <div className="font-mono text-sm font-bold text-[#F8FAFC] mt-0.5">
                    {viewDetailsRecord.quantity}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638]">
                <span className="text-[10px] text-[#9CA3AF] uppercase font-bold">Health / Status Description</span>
                <div className="text-sm font-semibold text-[#F8FAFC] mt-0.5">
                  {viewDetailsRecord.health_status}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638]">
                <span className="text-[10px] text-[#9CA3AF] uppercase font-bold">Beneficiary Member Lookup</span>
                {viewDetailsRecord.member_id ? (
                  <div className="mt-1">
                    <div className="text-sm font-bold text-[#F8FAFC]">
                      {members.find((m) => m.member_id === viewDetailsRecord.member_id)?.full_name || 'Member'}
                    </div>
                    <div className="font-mono text-xs text-[#FBBF24]">
                      ID: {viewDetailsRecord.member_id}
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-1">
                      Distributed on: {viewDetailsRecord.distribution_date || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#9CA3AF] mt-1 italic">
                    Unassigned (Currently in KAMBAC holding facility)
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2638] flex justify-end">
              <button
                onClick={() => setViewDetailsRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E2638] text-[#F8FAFC]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <LivestockFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        recordToEdit={recordToEdit}
        onSuccess={onRefresh}
      />

      {/* Assign Modal */}
      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        record={recordToAssign}
        onSuccess={onRefresh}
      />

    </div>
  );
};
