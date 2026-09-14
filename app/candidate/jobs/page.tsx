'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useApp } from '@/lib/context/AppContext';
import { scoreCandidate } from '@/lib/matching/score';
import { screenCandidateCGPA } from '@/lib/matching/cgpa';
import { 
  Briefcase, Search, Filter, MapPin, Building, Clock, 
  CheckCircle2, XCircle, ArrowRight, Sparkles, Award
} from 'lucide-react';

export default function CandidateJobsPage() {
  const { user } = useAuth();
  const { jobsList, candidatesList, applicationsList } = useApp();

  const candidate = candidatesList.find(c => 
    c.id === user?.candidateId || 
    (c.email && user?.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
    c.source === 'Candidate Portal'
  ) || candidatesList[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible' | 'applied'>('all');

  const departments = useMemo(() => {
    const set = new Set<string>();
    jobsList.forEach(j => { if (j.department) set.add(j.department); });
    return ['All', ...Array.from(set)];
  }, [jobsList]);

  // Compute match score and CGPA eligibility for all jobs
  const jobMetrics = useMemo(() => {
    return jobsList.map(job => {
      let matchScore = 0;
      let cgpaResult: { pass: boolean; reason: string } = { pass: true, reason: 'No CGPA requirement' };

      if (candidate) {
        try {
          const scored = scoreCandidate(candidate, job);
          matchScore = Math.round(scored.totalScore);
        } catch {
          matchScore = 75;
        }

        cgpaResult = screenCandidateCGPA(candidate, job);
      }

      const existingApp = applicationsList.find(a => 
        a.jobId === job.id && a.candidateId === candidate?.id
      );

      return {
        job,
        matchScore,
        cgpaResult,
        applied: !!existingApp,
        applicationStatus: existingApp?.status
      };
    });
  }, [jobsList, candidate, applicationsList]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobMetrics.filter(({ job, cgpaResult, applied }) => {
      if (departmentFilter !== 'All' && job.department !== departmentFilter) {
        return false;
      }

      if (eligibilityFilter === 'eligible' && !cgpaResult.pass) {
        return false;
      }

      if (eligibilityFilter === 'applied' && !applied) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = job.title.toLowerCase().includes(q);
        const inDept = job.department?.toLowerCase().includes(q);
        const inLoc = job.location?.toLowerCase().includes(q);
        const inSkills = (job.required || []).some((s: string) => s.toLowerCase().includes(q));
        if (!inTitle && !inDept && !inLoc && !inSkills) return false;
      }

      return true;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [jobMetrics, searchQuery, departmentFilter, eligibilityFilter]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                Opportunities
              </span>
              <span className="text-xs text-slate-400">
                {jobsList.length} Active Positions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Explore Open Roles
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              PRISM compares your technical skills, experience, and academic CGPA against job requisitions using fair, transparent screening.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Your Recorded CGPA</div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                {candidate?.cgpa !== undefined ? `${candidate.cgpa} / 10.0` : 'Not Entered'}
              </div>
            </div>
            <Link
              href="/candidate/profile"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2"
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by job title, department, or required skill (e.g. PyTorch, React)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>

            <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs">
              <button
                type="button"
                onClick={() => setEligibilityFilter('all')}
                className="px-3 py-1.5 rounded-lg font-medium transition"
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setEligibilityFilter('eligible')}
                className="px-3 py-1.5 rounded-lg font-medium transition"
              >
                CGPA Eligible
              </button>
              <button
                type="button"
                onClick={() => setEligibilityFilter('applied')}
                className="px-3 py-1.5 rounded-lg font-medium transition"
              >
                Applied
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(({ job, matchScore, cgpaResult, applied, applicationStatus }) => {
            const minCGPA = job.enableCGPAScreening !== false && job.minimumCGPA !== undefined ? job.minimumCGPA : null;

            return (
              <div 
                key={job.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Job Main Information */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                        {job.title}
                      </h2>
                      {applied && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          Applied: {applicationStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      {job.department && (
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {job.location}
                        </span>
                      )}
                      {job.experience && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {job.experience}
                        </span>
                      )}
                    </div>

                    {/* Required Skills Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(job.required || []).slice(0, 6).map((skill: string) => {
                        const candidateHasSkill = candidate?.skills?.some(s => s.toLowerCase() === skill.toLowerCase());
                        return (
                          <span 
                            key={skill}
                            className="px-2.5 py-1 text-[11px] rounded-lg font-medium border"
                          >
                            {candidateHasSkill && '✓ '}{skill}
                          </span>
                        );
                      })}
                      {(job.required || []).length > 6 && (
                        <span className="text-xs text-slate-500 self-center pl-1">
                          +{(job.required || []).length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Screening & Match Evaluation */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:pl-6 lg:border-l lg:border-slate-800 flex-shrink-0">
                    {/* Minimum CGPA Requirement Badge */}
                    <div className="min-w-[140px]">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                        Academic CGPA
                      </div>
                      {minCGPA !== null ? (
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-slate-200">
                            Min Req: {minCGPA} / 10
                          </div>
                          {cgpaResult.pass ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              <XCircle className="w-3 h-3" /> Ineligible
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No CGPA Screen</span>
                      )}
                    </div>

                    {/* PRISM Hybrid Match Score */}
                    <div className="text-center min-w-[80px]">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                        Match Score
                      </div>
                      <div className="text-xl font-bold text-white flex items-center justify-center gap-1">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        {matchScore}%
                      </div>
                    </div>

                    {/* Action Link */}
                    <Link
                      href={`/candidate/jobs/${job.id}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
                    >
                      {applied ? 'View Details' : 'View & Apply'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No jobs matched your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Try changing your search keywords, clearing department filters, or resetting CGPA filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
