/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Top Navigation Bar for KIMS Livestock Module
 * Exact KAMBAC design:
 * - Rounded amber square logo containing 'K'
 * - Word 'KAMBAC' in bold uppercase with an amber dot at the end
 * - Amber accent (#F59E0B) for active items
 * - Responsive navigation
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, 
  BarChart3, 
  HeartHandshake, 
  ShieldAlert, 
  Users, 
  Code, 
  Menu, 
  X,
  RotateCcw,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { livestockService } from '../services/livestockService';
import { UserRole } from '../types/livestock';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMembersPlaceholder: () => void;
  onOpenIntegrationNotes: () => void;
  onDataReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMembersPlaceholder,
  onOpenIntegrationNotes,
  onDataReset,
}) => {
  const { 
    currentUser, 
    switchRoleUser, 
    canViewLivestockList, 
    canViewDashboard, 
    canViewAuditLog, 
    canViewMyLivestock 
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'President', label: 'President', desc: 'Full livestock access & audit logs' },
    { role: 'Bookkeeper', label: 'Bookkeeper', desc: 'View-only access & summaries' },
    { role: 'General Manager', label: 'General Manager', desc: 'View-only access & summaries' },
    { role: 'Officers and Staff', label: 'Officers and Staff', desc: 'View-only operations' },
    { role: 'Member', label: 'Member', desc: 'Own assigned livestock only' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    switchRoleUser(role);
    setRoleDropdownOpen(false);
    // Adjust active tab if new role lacks access to current tab
    if (role === 'Member' && activeTab !== 'my-livestock') {
      setActiveTab('my-livestock');
    } else if (role !== 'Member' && activeTab === 'my-livestock') {
      setActiveTab('livestock-list');
    }
  };

  const handleResetData = () => {
    livestockService.resetToSampleData();
    setResetConfirmOpen(false);
    onDataReset();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E15] border-b border-[#1E2638] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand matching KAMBAC spec */}
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-[#F59E0B] flex items-center justify-center shadow-lg shadow-[#F59E0B]/20">
              <span className="text-[#0B0E15] font-extrabold text-2xl tracking-tighter font-mono">K</span>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-[#F8FAFC] font-extrabold tracking-wider text-xl">KAMBAC</span>
                <span className="text-[#F59E0B] text-2xl font-black leading-none">.</span>
              </div>
              <div className="text-[10px] tracking-widest uppercase font-semibold text-[#FBBF24]">
                KIMS Livestock Module
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {canViewLivestockList && (
              <button
                onClick={() => setActiveTab('livestock-list')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  activeTab === 'livestock-list'
                    ? 'bg-[#0F1626] text-[#F59E0B] border border-[#1E2638] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#0F1626]/60'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Livestock Registry</span>
              </button>
            )}

            {canViewDashboard && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0F1626] text-[#F59E0B] border border-[#1E2638] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#0F1626]/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard & Reports</span>
              </button>
            )}

            {canViewMyLivestock && (
              <button
                onClick={() => setActiveTab('my-livestock')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  activeTab === 'my-livestock'
                    ? 'bg-[#0F1626] text-[#F59E0B] border border-[#1E2638] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#0F1626]/60'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>My Livestock</span>
              </button>
            )}

            {canViewAuditLog && (
              <button
                onClick={() => setActiveTab('audit-log')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  activeTab === 'audit-log'
                    ? 'bg-[#0F1626] text-[#F59E0B] border border-[#1E2638] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#0F1626]/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Audit Log</span>
              </button>
            )}

            {/* Placeholder Reference Button */}
            <button
              onClick={onOpenMembersPlaceholder}
              className="px-3 py-2 rounded-xl text-xs font-medium text-[#9CA3AF] hover:text-[#FBBF24] hover:bg-[#0F1626] border border-transparent hover:border-[#1E2638] transition-all flex items-center space-x-1.5 ml-1"
              title="View read-only Members placeholder list"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members Ref</span>
            </button>

            {/* Integration Notes Button */}
            <button
              onClick={onOpenIntegrationNotes}
              className="px-3 py-2 rounded-xl text-xs font-medium text-[#9CA3AF] hover:text-[#FBBF24] hover:bg-[#0F1626] border border-transparent hover:border-[#1E2638] transition-all flex items-center space-x-1.5"
              title="Integration notes for teammates"
            >
              <Code className="w-3.5 h-3.5" />
              <span>API Specs</span>
            </button>
          </nav>

          {/* User Role Switcher & Controls */}
          <div className="flex items-center space-x-3">
            {/* Quick Test Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2.5 bg-[#0F1626] border border-[#1E2638] hover:border-[#F59E0B]/50 px-3.5 py-2 rounded-xl text-left transition-colors"
                aria-label="Switch active role"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9CA3AF] leading-none">Role Testing</div>
                  <div className="text-xs font-semibold text-[#F8FAFC] flex items-center space-x-1 mt-0.5">
                    <span>{currentUser?.role || 'No User'}</span>
                    <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
                  </div>
                </div>
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0F1626] border border-[#1E2638] rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#1E2638]">
                    <p className="text-[10px] uppercase font-bold text-[#FBBF24] tracking-wider">Test KAMBAC User Role</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Switch role to test access permissions:</p>
                  </div>
                  <div className="py-1">
                    {rolesList.map(({ role, label, desc }) => {
                      const isActive = currentUser?.role === role;
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleSelect(role)}
                          className={`w-full px-4 py-2.5 text-left text-xs transition-colors flex items-start justify-between ${
                            isActive
                              ? 'bg-[#1E2638]/70 text-[#FBBF24]'
                              : 'text-[#F8FAFC] hover:bg-[#1E2638]/40'
                          }`}
                        >
                          <div>
                            <div className="font-bold flex items-center space-x-1.5">
                              <span>{label}</span>
                              {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B]" />}
                            </div>
                            <div className="text-[11px] text-[#9CA3AF] mt-0.5">{desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-3 pt-2 border-t border-[#1E2638]">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        setResetConfirmOpen(true);
                      }}
                      className="w-full text-center py-1.5 text-xs text-[#9CA3AF] hover:text-[#F8FAFC] rounded-lg hover:bg-[#1E2638]/40 flex items-center justify-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3 text-[#F59E0B]" />
                      <span>Reset Sample Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#0F1626] border border-[#1E2638] text-[#9CA3AF] hover:text-[#F8FAFC]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1E2638] space-y-2">
            {canViewLivestockList && (
              <button
                onClick={() => {
                  setActiveTab('livestock-list');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-semibold flex items-center space-x-2.5 ${
                  activeTab === 'livestock-list'
                    ? 'bg-[#0F1626] text-[#F59E0B] border border-[#1E2638]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Livestock Registry</span>
              </button>
            )}

            {canViewDashboard && (
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-semibold flex items-center space-x-2.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0F1626] text-[#F59E0B] border border-[#1E2638]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard & Reports</span>
              </button>
            )}

            {canViewMyLivestock && (
              <button
                onClick={() => {
                  setActiveTab('my-livestock');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-semibold flex items-center space-x-2.5 ${
                  activeTab === 'my-livestock'
                    ? 'bg-[#0F1626] text-[#F59E0B] border border-[#1E2638]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>My Livestock</span>
              </button>
            )}

            {canViewAuditLog && (
              <button
                onClick={() => {
                  setActiveTab('audit-log');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-semibold flex items-center space-x-2.5 ${
                  activeTab === 'audit-log'
                    ? 'bg-[#0F1626] text-[#F59E0B] border border-[#1E2638]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Audit Log</span>
              </button>
            )}

            <div className="pt-2 border-t border-[#1E2638] flex space-x-2">
              <button
                onClick={() => {
                  onOpenMembersPlaceholder();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#0F1626] border border-[#1E2638] text-[#9CA3AF] text-center"
              >
                Members Ref
              </button>
              <button
                onClick={() => {
                  onOpenIntegrationNotes();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#0F1626] border border-[#1E2638] text-[#FBBF24] text-center"
              >
                API Notes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0E15]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFC]">Reset Sample Data?</h3>
            <p className="text-sm text-[#9CA3AF] mt-2">
              This will restore the 10 original livestock sample records, 5 member placeholders, and initial audit logs. Any newly created records will be refreshed.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#F8FAFC] bg-[#1E2638]/50 hover:bg-[#1E2638]"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F59E0B] text-[#0B0E15] hover:bg-[#FBBF24] transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
