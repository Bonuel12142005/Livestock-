/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KIMS Livestock - Root Application
 * Kapisanan ng mga Magsasakang Benepisyaryo ng Agraryo (KAMBAC)
 * Carmundo, Bongabong, Oriental Mindoro
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LivestockListPage } from './pages/LivestockListPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyLivestockPage } from './pages/MyLivestockPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { MembersPlaceholderModal } from './components/MembersPlaceholderModal';
import { IntegrationNotesModal } from './components/IntegrationNotesModal';
import { 
  Building2, 
  MapPin, 
  Layers, 
  KeyRound, 
  CheckCircle2, 
  Code2, 
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { SAMPLE_USERS } from './data/initialData';
import { UserRole } from './types/livestock';

function MainLayout() {
  const { 
    currentUser, 
    switchRoleUser, 
    isPresident, 
    isMember, 
    canViewLivestockList, 
    canViewDashboard, 
    canViewAuditLog 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(() => {
    // If starting as member, default to my-livestock
    return currentUser?.role === 'Member' ? 'my-livestock' : 'livestock-list';
  });

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const handleDataRefresh = () => {
    setDataVersion((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-[#0B0E15] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#0B0E15]">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMembersPlaceholder={() => setIsMembersModalOpen(true)}
        onOpenIntegrationNotes={() => setIsIntegrationModalOpen(true)}
        onDataReset={handleDataRefresh}
      />

      {/* Role Testing Quick Bar */}
      <section className="bg-[#0F1626]/80 border-b border-[#1E2638] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Active KAMBAC Session:</span>
            </span>
            <span className="font-bold text-[#F8FAFC]">{currentUser?.full_name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#FBBF24]">
              {currentUser?.role}
            </span>
            {currentUser?.member_id && (
              <span className="font-mono text-[#9CA3AF] text-[11px]">
                [{currentUser.member_id}]
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[10px] text-[#9CA3AF] mr-1 hidden sm:inline">1-Click Role Switcher:</span>
            {SAMPLE_USERS.map((u) => {
              const active = currentUser?.role === u.role;
              return (
                <button
                  key={u.role}
                  onClick={() => {
                    switchRoleUser(u.role);
                    if (u.role === 'Member') {
                      setActiveTab('my-livestock');
                    } else if (activeTab === 'my-livestock') {
                      setActiveTab('livestock-list');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex items-center space-x-1 ${
                    active
                      ? 'bg-[#F59E0B] text-[#0B0E15] font-bold shadow-sm'
                      : 'bg-[#1E2638]/60 text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#1E2638]'
                  }`}
                  title={`Switch to ${u.full_name} (${u.role})`}
                >
                  <span>{u.role.replace('Officers and Staff', 'Staff')}</span>
                  {active && <CheckCircle2 className="w-3 h-3 text-[#0B0E15]" />}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Render Tab Views with Enforced Role Boundaries */}
        {activeTab === 'livestock-list' && (
          <LivestockListPage 
            key={`list-${dataVersion}`} 
            onRefresh={handleDataRefresh}
            onNavigateToMyLivestock={() => setActiveTab('my-livestock')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            key={`dash-${dataVersion}`}
            onNavigateToRegistry={() => setActiveTab('livestock-list')}
          />
        )}

        {activeTab === 'my-livestock' && (
          <MyLivestockPage
            key={`my-${dataVersion}`}
            onNavigateToRegistry={() => setActiveTab('livestock-list')}
          />
        )}

        {activeTab === 'audit-log' && (
          <AuditLogPage
            key={`audit-${dataVersion}`}
            onNavigateToRegistry={() => setActiveTab('livestock-list')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0B0E15] border-t border-[#1E2638] py-8 text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B] flex items-center justify-center text-[#0B0E15] font-extrabold font-mono text-lg shadow-sm">
                K
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-[#F8FAFC] font-extrabold tracking-wider">KAMBAC</span>
                  <span className="text-[#F59E0B] font-bold">.</span>
                  <span className="text-[#9CA3AF] font-normal text-[11px] ml-1">Integrated Management System</span>
                </div>
                <div className="text-[11px] text-[#9CA3AF] flex items-center space-x-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#F59E0B]" />
                  <span>Carmundo, Bongabong, Oriental Mindoro</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMembersModalOpen(true)}
                className="hover:text-[#FBBF24] transition-colors"
              >
                Members Placeholder
              </button>
              <span>•</span>
              <button
                onClick={() => setIsIntegrationModalOpen(true)}
                className="hover:text-[#FBBF24] transition-colors flex items-center space-x-1"
              >
                <Code2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Integration Notes</span>
              </button>
            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-[#1E2638] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#9CA3AF]/70 gap-2">
            <div>
              Entity: <code className="text-[#FBBF24] font-mono">tbl_livestock</code> • Standardized REST API &amp; Shared Database Architecture
            </div>
            <div>
              Replaces paper records • Built strictly for the Livestock module
            </div>
          </div>
        </div>
      </footer>

      {/* Shared Modals */}
      <MembersPlaceholderModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />

      <IntegrationNotesModal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
