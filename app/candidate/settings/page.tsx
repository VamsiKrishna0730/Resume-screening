'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  User, Mail, Shield, Bell, Key, LogOut, CheckCircle2,
  Trash2, AlertTriangle, Monitor
} from 'lucide-react';

export default function CandidateSettingsPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    statusChanges: true,
    jobRecommendations: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Account & Portal Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your candidate profile credentials, communication preferences, and security.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          Account Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Candidate Name</div>
            <div className="text-sm font-semibold text-white">{user?.name || 'Applicant'}</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Email Address</div>
            <div className="text-sm font-semibold text-white">{user?.email || 'N/A'}</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Assigned Role</div>
            <div className="text-sm font-semibold text-emerald-400 font-mono">{user?.role || 'CANDIDATE'}</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">User ID</div>
            <div className="text-sm font-mono text-slate-400">{user?.id || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          Notification Preferences
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Application Status Updates</div>
              <div className="text-[11px] text-slate-400">Receive alerts when your application changes stage (e.g. Under Review, Shortlisted).</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.statusChanges}
              onChange={e => setNotifications({ ...notifications, statusChanges: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Matching Job Recommendations</div>
              <div className="text-[11px] text-slate-400">Notify me when new jobs matching my technical skills and CGPA are posted.</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.jobRecommendations}
              onChange={e => setNotifications({ ...notifications, jobRecommendations: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Security & Logout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Session & Security
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div>
            <div className="text-xs font-semibold text-white">Sign Out of Session</div>
            <div className="text-[11px] text-slate-400">End your active session on this browser device.</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}