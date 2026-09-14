'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useApp } from '@/lib/context/AppContext';
import { 
  FileText, Clock, Building, MapPin, 
  ArrowRight, Award, ExternalLink
} from 'lucide-react';

export default function CandidateApplicationsPage() {
  const { user } = useAuth();
  const { applicationsList, candidatesList, jobsList } = useApp();

  const candidate = candidatesList.find(c => 
    c.id === user?.candidateId || 
    (c.email && user?.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
    c.source === 'Candidate Portal'
  ) || candidatesList[0];

  const userApplications = useMemo(() => {
    if (!candidate) return [];
    return applicationsList.filter(a => a.candidateId === candidate.id);
  }, [applicationsList, candidate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Under Review':
        return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      case 'Rejected':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'Withdrawn':
        return 'bg-slate-800 border-slate-700 text-slate-400';
      default:
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              Application Tracker
            </span>
            <span className="text-xs text-slate-400">
              {userApplications.length} active submissions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Applications
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track status updates, eligibility checks, and timeline of your role applications.
          </p>
        </div>

        <Link
          href="/candidate/jobs"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          Browse More Jobs
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {userApplications.length > 0 ? (
          userApplications.map(app => {
            const job = jobsList.find(j => j.id === app.jobId);
            return (
              <div 
                key={app.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl p-6 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-white">
                        {job?.title || app.jobTitle}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      {job?.department && (
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          {job.department}
                        </span>
                      )}
                      {job?.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Applied on {new Date(app.appliedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:border-l sm:border-slate-800 sm:pl-6">
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Match Score</div>
                      <div className="text-lg font-bold text-indigo-400">
                        {app.matchScore ?? 80}%
                      </div>
                    </div>

                    {app.cgpaScreeningStatus && (
                      <div className="text-center sm:text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">CGPA Screen</div>
                        <span className={`text-xs font-bold ${app.cgpaEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {app.cgpaScreeningStatus}
                        </span>
                      </div>
                    )}

                    <Link
                      href={`/candidate/applications/${app.id}`}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
                      title="View Timeline & Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No applications submitted yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Browse available job openings and submit your profile in one click.
            </p>
            <div className="pt-2">
              <Link
                href="/candidate/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition"
              >
                Browse Open Roles
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}