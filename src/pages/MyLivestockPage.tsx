/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * My Livestock Page (Member Portal)
 * KAMBAC Integrated Management System (KIMS)
 * Shows ONLY the livestock assigned to the logged-in member.
 * Denies access if not a Member (or allows President preview).
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { livestockService } from '../services/livestockService';
import { 
  HeartHandshake, 
  Tag, 
  Calendar, 
  Activity, 
  Layers, 
  ShieldCheck, 
  FileCheck2,
  Info
} from 'lucide-react';
import { AccessDenied } from '../components/AccessDenied';

interface MyLivestockPageProps {
  onNavigateToRegistry?: () => void;
}

export const MyLivestockPage: React.FC<MyLivestockPageProps> = ({ onNavigateToRegistry }) => {
  const { currentUser, isMember, isPresident } = useAuth();

  // If user is not Member and not President previewing: Access Denied
  if (!currentUser || (!isMember && !isPresident)) {
    return (
      <AccessDenied 
        requiredRoleMessage="The 'My Livestock' portal is exclusively intended for registered KAMBAC Agrarian Beneficiary Members to review their personal livestock allocations."
        onGoBack={onNavigateToRegistry}
      />
    );
  }

  // Determine active member_id: if user is Member, must be currentUser.member_id;
  // if President is previewing, default to Juan Dela Cruz 'KMB-2026-0001'
  const activeMemberId = currentUser.member_id || 'KMB-2026-0001';
  const memberObj = livestockService.getMemberById(activeMemberId);
  const myLivestock = livestockService.listLivestockByMemberId(activeMemberId, currentUser);

  const totalHeadcount = myLivestock.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <div className="text-[11px] uppercase tracking-widest font-bold text-[#F59E0B]">
          Agrarian Beneficiary Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight mt-0.5">
          My Assigned Livestock
        </h1>
        <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
          Official KAMBAC livestock distributed to your stewardship in Carmundo, Bongabong.
        </p>
      </div>

      {/* Member Identity Card */}
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0B0E15] border border-[#F59E0B]/30 flex items-center justify-center">
              <HeartHandshake className="w-7 h-7 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-[#F8FAFC]">
                  {memberObj?.full_name || currentUser.full_name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#FBBF24]">
                  {activeMemberId}
                </span>
              </div>
              <div className="text-xs text-[#9CA3AF] mt-0.5 flex items-center space-x-2">
                <span>Location: {memberObj?.barangay || 'Carmundo, Bongabong'}</span>
                <span>•</span>
                <span className="text-[#FBBF24] font-medium">Status: Active Agrarian Beneficiary</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#0B0E15] border border-[#1E2638] px-4 py-2.5 rounded-xl">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-[#9CA3AF]">Allocated Stock</div>
              <div className="font-mono text-base font-extrabold text-[#FBBF24]">
                {totalHeadcount} {totalHeadcount === 1 ? 'Head' : 'Heads'} ({myLivestock.length} records)
              </div>
            </div>
          </div>
        </div>

        {isPresident && !isMember && (
          <div className="mt-4 pt-3 border-t border-[#1E2638] flex items-center space-x-2 text-xs text-[#FBBF24]">
            <Info className="w-4 h-4 shrink-0 text-[#F59E0B]" />
            <span>
              President Preview: Viewing assigned records for beneficiary <strong>{memberObj?.full_name}</strong> ({activeMemberId}).
            </span>
          </div>
        )}
      </div>

      {/* Livestock Cards List */}
      {myLivestock.length === 0 ? (
        <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-10 text-center space-y-3">
          <Layers className="w-10 h-10 text-[#9CA3AF] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#F8FAFC]">No Livestock Currently Assigned</h3>
          <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
            You currently have no livestock registered to your member ID ({activeMemberId}). If you were recently awarded livestock, please consult the KAMBAC President or Bookkeeper.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myLivestock.map((item) => (
            <div
              key={item.livestock_id}
              className="bg-[#0F1626] border border-[#1E2638] hover:border-[#F59E0B]/40 rounded-2xl p-5 shadow-sm space-y-4 transition-all"
            >
              {/* Item Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#FBBF24] flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{item.tag_id}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#9CA3AF]">
                      ({item.livestock_id})
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#F8FAFC] mt-1">
                    {item.animal_type}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-lg bg-[#0B0E15] border border-[#1E2638] text-sm font-mono font-bold text-[#F8FAFC]">
                    {item.quantity} {item.quantity === 1 ? 'Head' : 'Heads'}
                  </span>
                </div>
              </div>

              {/* Data Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638]">
                  <div className="text-[10px] uppercase font-bold text-[#9CA3AF] flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#F59E0B]" />
                    <span>Distribution Date</span>
                  </div>
                  <div className="font-mono font-semibold text-[#F8FAFC] mt-1">
                    {item.distribution_date || 'N/A'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638]">
                  <div className="text-[10px] uppercase font-bold text-[#9CA3AF] flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-[#F59E0B]" />
                    <span>Health / Status</span>
                  </div>
                  <div className="font-semibold text-[#FBBF24] mt-1 truncate" title={item.health_status}>
                    {item.health_status}
                  </div>
                </div>
              </div>

              {/* Cooperative Stewardship Contract Note */}
              <div className="p-3 rounded-xl bg-[#0B0E15]/60 border border-[#1E2638] text-[11px] text-[#9CA3AF] flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>
                  Under KAMBAC agrarian reform beneficiary guidelines, member is responsible for daily pasture, shelter, and mandatory veterinary check-ins.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Beneficiary Assistance Notice */}
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm flex items-start space-x-3.5">
        <FileCheck2 className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-[#F8FAFC]">Veterinary &amp; Support Requests</div>
          <p className="text-[#9CA3AF] leading-relaxed">
            Need deworming, vaccination, or health assessment for your assigned animals? Contact the KAMBAC Cooperative Office in Carmundo or coordinate directly with President Mario V. Macalalad.
          </p>
        </div>
      </div>

    </div>
  );
};
