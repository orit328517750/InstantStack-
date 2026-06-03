import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from './ui/button';
import { Users, Mail, Shield, RefreshCw, AlertCircle } from 'lucide-react';

export default function TeamManagement() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTeam = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Could not load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <div className="space-y-6 text-white p-6 bg-slate-900/40 rounded-2xl border border-slate-800 backdrop-blur-md">
      {/* כותרת המסך */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Team Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            View and manage developers assigned to your organization infrastructure.
          </p>
        </div>
        <Button 
          onClick={fetchTeam} 
          disabled={isLoading}
          variant="outline" 
          className="border-slate-700 hover:bg-slate-800 text-slate-200 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* טבלת המשתמשים */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm animate-pulse">
          Loading active corporate directory...
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
          No developers found. New registrants will appear here automatically.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">System Role</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-900/30 transition-colors group">
                  <td className="p-4 text-sm font-medium text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-xs">
                      {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {emp.name}
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                      {emp.email}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      <Shield className="w-3 h-3 text-slate-400" />
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-slate-400">Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}