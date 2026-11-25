import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '../../ui/Badge';

export interface PlatformUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'USER' | 'DRIVER' | 'FLEET_MANAGER' | 'ADMIN';
  createdAt: string;
  _count?: {
    vehicles: number;
    customerBookings: number;
    tenantMemberships: number;
  };
}

interface UsersTableProps {
  users: PlatformUser[];
  onRoleChange: (userId: string, newRole: string) => void;
  updatingId: string | null;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onRoleChange,
  updatingId,
}) => {
  return (
    <div className="glass-panel overflow-hidden bg-white border border-slate-200/80 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
              <th className="py-4 px-6">User / Contact</th>
              <th className="py-4 px-6">Global Role</th>
              <th className="py-4 px-6">Activity (Vehicles / Bookings)</th>
              <th className="py-4 px-6">Registered On</th>
              <th className="py-4 px-6 text-right">Assign Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {users.map((u) => {
              const isAdmin = u.role === 'ADMIN';

              return (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                          isAdmin
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {u.fullName.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {u.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.email} &bull; {u.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <Badge status={u.role} />
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">
                        Vehicles: <strong className="text-slate-900 font-semibold">{u._count?.vehicles ?? 0}</strong>
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-500">
                        Bookings: <strong className="text-slate-900 font-semibold">{u._count?.customerBookings ?? 0}</strong>
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => onRoleChange(u.id, e.target.value)}
                      className="bg-white border border-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 shadow-xs"
                    >
                      <option value="USER">USER</option>
                      <option value="DRIVER">DRIVER</option>
                      <option value="FLEET_MANAGER">FLEET_MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
