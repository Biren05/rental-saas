'use client';

import React, { useState } from 'react';
import { Trash2, Search, Mail, Phone } from 'lucide-react';
import { TenantRole } from '../../../types';

interface StaffMember {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantRole;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string | null;
  };
}

interface StaffTableProps {
  members: StaffMember[];
  currentUserId?: string;
  loading: boolean;
  onRemove: (member: StaffMember) => void;
}

const roleStyles: Record<string, { label: string; style: string }> = {
  OWNER: {
    label: 'Tenant Owner',
    style: 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
  },
  ADMIN: {
    label: 'Administrator',
    style: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  },
  MANAGER: {
    label: 'Manager',
    style: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  },
  STAFF: {
    label: 'Frontdesk Staff',
    style: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  DRIVER: {
    label: 'Fleet Driver',
    style: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  },
  CUSTOMER: {
    label: 'Customer / Driver',
    style: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  },
};

export const StaffTable: React.FC<StaffTableProps> = ({
  members,
  currentUserId,
  loading,
  onRemove,
}) => {
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter((m) => {
    const text = `${m.user?.fullName || ''} ${m.user?.email || ''} ${m.role}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
          placeholder="Search team member by name, email..."
        />
      </div>

      {/* Clean Table Container */}
      <div
        className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111827] overflow-hidden shadow-xs"
        style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border-b border-slate-200/90 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Name</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Joined</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading team members...</p>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-xs font-medium">No team members found.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different term or invite someone new.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const roleConfig = roleStyles[member.role] || {
                    label: member.role,
                    style: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                  };
                  const isSelf = member.userId === currentUserId;
                  const isOwner = member.role === 'OWNER';

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white text-xs">
                            {member.user?.fullName || 'Staff Member'}
                          </span>
                          {isSelf && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-500/25">
                              (You)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">{member.user?.email}</div>
                          {member.user?.phone && (
                            <div className="text-slate-400 dark:text-slate-500">{member.user.phone}</div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${roleConfig.style}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        {!isOwner && !isSelf && (
                          <button
                            type="button"
                            onClick={() => onRemove(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
};
