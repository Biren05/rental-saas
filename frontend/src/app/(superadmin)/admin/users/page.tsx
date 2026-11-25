'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '../../../../services';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import { SearchInput } from '../../../../components/ui/SearchInput';
import { UsersTable, PlatformUser } from '../../../../components/superadmin/users/UsersTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load system users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)),
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            Platform <span className="text-indigo-600">Users & Roles</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global directory of registered accounts, administrators, fleet managers, and customers.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="btn-secondary text-xs px-3.5 py-2 self-start sm:self-auto"
          title="Refresh List"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by full name, email or phone..."
          className="flex-1 max-w-md"
        />

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {['ALL', 'ADMIN', 'FLEET_MANAGER', 'DRIVER', 'USER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === r
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table Component */}
      {loading ? (
        <div className="text-center py-16 text-sm text-slate-500">Loading platform users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel p-12 text-center bg-white border border-slate-200">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No Users Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or role filter.</p>
        </div>
      ) : (
        <UsersTable
          users={filteredUsers}
          onRoleChange={handleRoleChange}
          updatingId={updatingId}
        />
      )}
    </div>
  );
}
