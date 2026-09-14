'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useApp } from '@/lib/context/AppContext';
import { scoreCandidate } from '@/lib/matching/score';
import { screenCandidateCGPA } from '@/lib/matching/cgpa';
import { 
  Building, MapPin, Clock, CheckCircle2, 
  ArrowLeft, Send, Sparkles, Award, HelpCircle, Check
} from 'lucide-react';

export default function CandidateJobDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const { jobsList, candidatesList, applicationsList, applyForJob } = useApp();

  const jobId = params?.jobId as string;
  const job = jobsList.find(j => j.id === jobId);

  const candidate = candidatesList.find(c => 
    c.id === user?.candidateId || 
    (c.email && user?.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
    c.source === 'Candidate Portal'
  ) || candidatesList[0];

  const existingApp = applicationsList.find(a => 
    a.jobId === jobId && a.candidateId === candidate?.id
  );

  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const { matchScore, cgpaResult, matchedSkills, missingSkills } = useMemo(() => {
    if (!job || !candidate) {
      return { matchScore: 0, cgpaResult: { pass: true, reason: '' }, matchedSkills: [], missingSkills: [] };
    }

    let score = 0;
    try {
      const res = scoreCandidate(candidate, job);
      score = Math.round(res.totalScore);
    } catch {
      score = 75;
    }

    const cScreen = screenCandidateCGPA(candidate, job);
    const candSkills = (candidate.skills || []).map(s => s.toLowerCase());
    const matched = (job.required || []).filter((s: string) => candSkills.includes(s.toLowerCase()));
    const missing = (job.required || []).filter((s: string) => !candSkills.includes(s.toLowerCase()));

    return {
      matchScore: score,
      cgpaResult: cScreen,
      matchedSkills: matched,
      missingSkills: missing
    };
  }, [job, candidate]);

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Job Requisition Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested position is either closed or does not exist.</p>
        <Link
          href="/candidate/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>
    );
  }

  const minCGPA = job.enableCGPAScreening !== false && job.minimumCGPA !== undefined ? job.minimumCGPA : null;

  const handleApply = () => {
    if (!candidate || existingApp || isApplying) return;
    setIsApplying(true);
    try {
      applyForJob(job.id, candidate.id);
      setAppliedSuccess(true);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div>
        <Link
          href="/candidate/jobs"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Listings
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                {job.department || 'Engineering'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              {job.department && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-500" />
                  {job.department}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {job.location}
                </span>
              )}
              {job.experience && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {job.experience}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {existingApp || appliedSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-emerald-400">Application Submitted</div>
                  <div className="text-[11px] text-slate-300">
                    Status: {existingApp?.status || 'Applied'}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isApplying ? 'Submitting Application...' : 'Apply for this Job'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              PRISM AI Match & Eligibility Assessment
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated screening evaluated against your candidate profile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Match Score</div>
              <div className="text-lg font-bold text-white">{matchScore}%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className={`p-5 rounded-xl border ${
            minCGPA === null 
              ? 'bg-slate-950/60 border-slate-800' 
              : cgpaResult.pass 
                ? 'bg-emerald-500/5 border-emerald-500/25' 
                : 'bg-rose-500/5 border-rose-500/25'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Academic CGPA Screen
              </span>
              {minCGPA !== null && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  cgpaResult.pass 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {cgpaResult.pass ? 'PASS (Eligible)' : 'FAIL (Below Cutoff)'}
                </span>
              )}
            </div>

            {minCGPA !== null ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Recruiter Minimum Requirement:</span>
                  <span className="font-semibold text-white">{minCGPA} / 10.0</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Your Recorded CGPA:</span>
                  <span className="font-semibold text-white">
                    {candidate?.cgpa !== undefined ? `${candidate.cgpa} / 10.0` : 'Not Detected'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  {cgpaResult.reason}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                This position does not enforce a minimum CGPA requirement.
              </p>
            )}
          </div>

          <div className="p-5 rounded-xl border bg-slate-950/60 border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Skill Alignment
            </span>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Matching Required Skills:</span>
              <span className="font-semibold text-emerald-400">
                {matchedSkills.length} / {(job.required || []).length}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] rounded flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> {s}
                  </span>
                ))}
                {missingSkills.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-slate-800/80 text-slate-400 border border-slate-750 text-[11px] rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-indigo-500/20 rounded-xl text-xs text-slate-400 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-300">Explainable AI & Fair Matching:</span>
            <p>
              Match score is calculated by comparing your verified technical competencies and experience with the job description. CGPA is evaluated strictly independently as an eligibility criterion.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-3">About the Role</h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {job.description || 'No detailed description provided for this job requisition.'}
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white mb-3">Required Technical Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(job.required || []).map((skill: string) => (
              <span key={skill} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {job.preferred && job.preferred.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-white mb-3">Preferred Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.preferred.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 text-xs font-medium rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <Link
            href="/candidate/jobs"
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Back to all jobs
          </Link>

          {!existingApp && !appliedSuccess && (
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Apply for this Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}