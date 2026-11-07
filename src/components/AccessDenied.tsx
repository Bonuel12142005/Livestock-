/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Access Denied Display Component
 * Renders when a user role lacks permissions according to KAMBAC security policy.
 * Uses only strict amber and gray palette (#0B0E15, #0F1626, #1E2638, #F59E0B, #FBBF24, #F8FAFC, #9CA3AF).
 */

import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedProps {
  requiredRoleMessage?: string;
  onGoBack?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRoleMessage = 'This section is restricted by KAMBAC role-based access policy.',
  onGoBack,
}) => {
  const { currentUser, switchRoleUser } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle amber ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#F59E0B]/10 blur-2xl rounded-full pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-[#0B0E15] border border-[#1E2638] mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-8 h-8 text-[#F59E0B]" />
        </div>

        <div className="text-[11px] uppercase tracking-widest font-bold text-[#F59E0B] mt-5">
          SECURITY RESTRICTION
        </div>

        <h2 className="text-2xl font-extrabold text-[#F8FAFC] mt-1">
          Access Denied
        </h2>

        <p className="text-sm text-[#9CA3AF] mt-3 leading-relaxed">
          {requiredRoleMessage}
        </p>

        <div className="mt-6 p-4 rounded-xl bg-[#0B0E15] border border-[#1E2638] text-left">
          <div className="text-[10px] uppercase font-bold text-[#9CA3AF]">Current Session Profile</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-semibold text-[#F8FAFC]">{currentUser?.full_name}</span>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FBBF24]">
              {currentUser?.role}
            </span>
          </div>
          {currentUser?.member_id && (
            <div className="text-[11px] text-[#9CA3AF] mt-1 font-mono">
              Member ID: {currentUser.member_id}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-[#F8FAFC] bg-[#1E2638]/70 hover:bg-[#1E2638] border border-[#1E2638] flex items-center justify-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#9CA3AF]" />
              <span>Go to Allowed View</span>
            </button>
          )}

          <button
            onClick={() => switchRoleUser('President')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-[#0B0E15] bg-[#F59E0B] hover:bg-[#FBBF24] transition-colors shadow-lg shadow-[#F59E0B]/20"
          >
            Switch to President (Full Access)
          </button>
        </div>
      </div>
    </div>
  );
};
