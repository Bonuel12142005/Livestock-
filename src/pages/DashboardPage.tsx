/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dashboard & Reports Page
 * KAMBAC Integrated Management System (KIMS)
 * Visible to: President, Bookkeeper, General Manager, Officers and Staff
 * Member: Denied by default
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { livestockService } from '../services/livestockService';
import { 
  BarChart3, 
  Layers, 
  CheckCircle, 
  Clock, 
  Printer, 
  FileText,
  Calendar,
  Users
} from 'lucide-react';
import { AccessDenied } from '../components/AccessDenied';

interface DashboardPageProps {
  onNavigateToRegistry: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToRegistry }) => {
  const { currentUser, canViewDashboard } = useAuth();
  const [printMode, setPrintMode] = useState(false);

  if (!currentUser || !canViewDashboard) {
    return (
      <AccessDenied 
        requiredRoleMessage="Executive summaries and distribution metrics are reserved for KAMBAC Officers, Management, and Leadership."
      />
    );
  }

  const summary = livestockService.getLivestockSummary(currentUser);
  const members = livestockService.getMembersPlaceholder();

  const handlePrint = () => {
    window.print();
  };

  const assignmentRate = summary.total_headcount > 0 
    ? Math.round((summary.assigned_headcount / summary.total_headcount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-bold text-[#F59E0B]">
            KAMBAC Cooperative Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight mt-0.5">
            Dashboard &amp; Distribution Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Aggregated headcount summaries and distribution monitoring for Bongabong agrarian beneficiaries.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0F1626] border border-[#1E2638] text-[#F8FAFC] hover:border-[#F59E0B]/50 hover:bg-[#1E2638]/40 transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4 text-[#F59E0B]" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Headcount */}
        <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="text-[11px] uppercase tracking-wider font-bold">Total Headcount</span>
            <Layers className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#FBBF24] font-mono">
              {summary.total_headcount}
            </span>
            <span className="text-xs text-[#9CA3AF]">heads total</span>
          </div>
          <div className="mt-2 text-[11px] text-[#9CA3AF] flex items-center justify-between pt-2 border-t border-[#1E2638]">
            <span>Registry Entries:</span>
            <span className="font-mono text-[#F8FAFC] font-semibold">{summary.total_records} records</span>
          </div>
        </div>

        {/* Assigned Livestock */}
        <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="text-[11px] uppercase tracking-wider font-bold">Distributed / Assigned</span>
            <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#FBBF24] font-mono">
              {summary.assigned_headcount}
            </span>
            <span className="text-xs text-[#9CA3AF]">heads ({summary.assigned_count} logs)</span>
          </div>
          <div className="mt-2 text-[11px] text-[#9CA3AF] flex items-center justify-between pt-2 border-t border-[#1E2638]">
            <span>Beneficiary Allocation:</span>
            <span className="font-mono text-[#FBBF24] font-semibold">{assignmentRate}% of stock</span>
          </div>
        </div>

        {/* Unassigned / Cooperative Holding */}
        <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="text-[11px] uppercase tracking-wider font-bold">In Holding (Available)</span>
            <Clock className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-mono">
              {summary.unassigned_headcount}
            </span>
            <span className="text-xs text-[#9CA3AF]">heads ({summary.unassigned_count} logs)</span>
          </div>
          <div className="mt-2 text-[11px] text-[#9CA3AF] flex items-center justify-between pt-2 border-t border-[#1E2638]">
            <span>Ready for Dispersal:</span>
            <span className="font-mono text-[#F8FAFC] font-semibold">{100 - assignmentRate}%</span>
          </div>
        </div>

        {/* Active Beneficiaries */}
        <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="text-[11px] uppercase tracking-wider font-bold">Member Beneficiaries</span>
            <Users className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#FBBF24] font-mono">
              {members.length}
            </span>
            <span className="text-xs text-[#9CA3AF]">registered members</span>
          </div>
          <div className="mt-2 text-[11px] text-[#9CA3AF] flex items-center justify-between pt-2 border-t border-[#1E2638]">
            <span>Source:</span>
            <span className="font-mono text-[#9CA3AF] text-[10px]">Members Placeholder</span>
          </div>
        </div>

      </div>

      {/* Breakdown Section: By Animal Type & By Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Animal Type Distribution */}
        <div className="lg:col-span-7 bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider">Species &amp; Breeds</div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Headcount by Animal Type</h3>
            </div>
            <button
              onClick={onNavigateToRegistry}
              className="text-xs text-[#9CA3AF] hover:text-[#FBBF24] font-semibold"
            >
              View in Registry →
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(summary.by_animal_type).map(([animal, stats]) => {
              const percentage = summary.total_headcount > 0 
                ? Math.round((stats.total_quantity / summary.total_headcount) * 100)
                : 0;

              return (
                <div key={animal} className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#F8FAFC]">{animal}</span>
                    <span className="font-mono text-[#FBBF24] font-bold">
                      {stats.total_quantity} {stats.total_quantity === 1 ? 'head' : 'heads'} ({stats.count} {stats.count === 1 ? 'log' : 'logs'})
                    </span>
                  </div>
                  {/* Progress bar in strict amber/gray palette */}
                  <div className="w-full h-2 rounded-full bg-[#1E2638] overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#9CA3AF] mt-1 font-mono">
                    <span>Proportion</span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health / Status Breakdown */}
        <div className="lg:col-span-5 bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-[#1E2638]">
            <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider">Veterinary Monitoring</div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Health &amp; Status Logs</h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(summary.by_health_status).map(([health, count]) => (
              <div
                key={health}
                className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2638] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-[#F8FAFC]">{health}</div>
                  <div className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">Plain text field</div>
                </div>
                <div className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-[#1E2638] text-[#FBBF24]">
                  {count} {count === 1 ? 'record' : 'records'}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0E15] border border-[#1E2638]/80 text-xs text-[#9CA3AF] leading-relaxed">
            <span className="font-bold text-[#F8FAFC] block mb-1">KAMBAC Monitoring Protocol</span>
            Health/status records are updated regularly by the President during farm monitoring visits in Carmundo.
          </div>
        </div>

      </div>

      {/* Recent Distributions Table */}
      <div className="bg-[#0F1626] border border-[#1E2638] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider">Activity History</div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Recent Livestock Distributions to Members</h3>
          </div>
          <span className="text-xs text-[#9CA3AF] font-mono">Latest logged transfers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2638] bg-[#0B0E15]/40 text-[#9CA3AF] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">Distribution Date</th>
                <th className="py-2.5 px-3">Tag / ID</th>
                <th className="py-2.5 px-3">Animal Type</th>
                <th className="py-2.5 px-3 text-center">Headcount</th>
                <th className="py-2.5 px-3">Assigned Beneficiary Member</th>
                <th className="py-2.5 px-3">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/60">
              {summary.recent_distributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#9CA3AF]">
                    No recent distributions recorded.
                  </td>
                </tr>
              ) : (
                summary.recent_distributions.map((rec) => {
                  const memberObj = rec.member_id ? members.find((m) => m.member_id === rec.member_id) : null;
                  return (
                    <tr key={rec.livestock_id} className="hover:bg-[#1E2638]/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-[#FBBF24]">
                        {rec.distribution_date}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#F8FAFC]">
                        {rec.tag_id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                        {rec.animal_type}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#1E2638] text-[#F8FAFC]">
                          {rec.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#F8FAFC]">
                          {memberObj?.full_name || 'Member'}
                        </div>
                        <div className="font-mono text-[11px] text-[#9CA3AF]">
                          {rec.member_id}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#9CA3AF]">
                        {rec.health_status}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Section for Browser Print Dialog */}
      <div className="hidden print:block bg-white text-black p-8">
        <h1 className="text-xl font-bold">KAMBAC (Kapisanan ng mga Magsasakang Benepisyaryo ng Agraryo)</h1>
        <h2 className="text-lg">Livestock Module Summary Report - Carmundo, Bongabong</h2>
        <p className="text-sm mt-2">Generated: {new Date().toLocaleDateString()}</p>
        <p className="text-sm">Total Livestock Headcount: {summary.total_headcount}</p>
        <p className="text-sm">Assigned: {summary.assigned_headcount} | In Holding: {summary.unassigned_headcount}</p>
      </div>

    </div>
  );
};
