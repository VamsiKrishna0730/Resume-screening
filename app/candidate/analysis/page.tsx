'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useApp } from '@/lib/context/AppContext';
import { computeProfileCompletion } from '@/lib/context/candidate-utils';
import { 
  Sparkles, CheckCircle2, AlertCircle, Award, 
  HelpCircle, ShieldCheck, ArrowRight, BookOpen
} from 'lucide-react';

export default function CandidateAnalysisPage() {
  const { user } = useAuth();
  const { candidatesList, jobsList } = useApp();

  const candidate = candidatesList.find(c => 
    c.id === user?.candidateId || 
    (c.email && user?.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
    c.source === 'Candidate Portal'
  ) || candidatesList[0];

  const completion = candidate ? computeProfileCompletion(candidate) : 0;

  // Compute skill frequency across current market jobs
  const skillInsights = useMemo(() => {
    const demandCount: Record<string, number> = {};
    jobsList.forEach(job => {
      (job.required || []).forEach((s: string) => {
        const key = s.trim();
        demandCount[key] = (demandCount[key] || 0) + 1;
      });
    });

    const userSkills = new Set((candidate?.skills || []).map(s => s.toLowerCase()));
    
    const matchedDemanded: { name: string; count: number }[] = [];
    const missingHighDemand: { name: string; count: number }[] = [];

    Object.entries(demandCount).forEach(([skill, count]) => {
      if (userSkills.has(skill.toLowerCase())) {
        matchedDemanded.push({ name: skill, count });
      } else {
        missingHighDemand.push({ name: skill, count });
      }
    });

    matchedDemanded.sort((a, b) => b.count - a.count);
    missingHighDemand.sort((a, b) => b.count - a.count);

    return {
      matchedDemanded: matchedDemanded.slice(0, 8),
      missingHighDemand: missingHighDemand.slice(0, 6),
      totalMarketJobs: jobsList.length,
    };
  }, [jobsList, candidate]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                Explainable AI Feedback
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Fair & Transparent
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Resume & Competency Analysis
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              PRISM explains how your profile is analyzed, which skills align with current job postings, and how you can maximize your eligibility.
            </p>
          </div>

          <Link
            href="/candidate/profile"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 self-start sm:self-center"
          >
            Update Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Profile Health & Strength Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Profile Completeness
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {completion}%
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {completion >= 80 
              ? 'Your profile contains all core screening signals needed for high-confidence matching.' 
              : 'Add more details (CGPA, certifications, or projects) to increase matching precision.'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Academic CGPA Detection
          </div>
          <div className="text-3xl font-black text-indigo-400 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            {candidate?.cgpa !== undefined ? `${candidate.cgpa}` : 'None'}
            <span className="text-sm font-normal text-slate-500">/ 10</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {candidate?.cgpa !== undefined
              ? 'Automatically checked against recruiter minimum requirements (e.g. 7.0 / 10).'
              : 'No CGPA detected on resume. You can add your CGPA manually in your profile.'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Verified Skills
          </div>
          <div className="text-3xl font-black text-white">
            {candidate?.skills?.length || 0}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Extracted from your resume or added manually. Used for semantic skill vector matching.
          </p>
        </div>
      </div>

      {/* In-Demand Skills vs Profile Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Strongest Skills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              High-Demand Skills You Have
            </h2>
            <span className="text-xs text-slate-500">{skillInsights.matchedDemanded.length} matched</span>
          </div>
          <p className="text-xs text-slate-400">
            These skills from your profile appear frequently in current open requisitions:
          </p>

          <div className="space-y-2">
            {skillInsights.matchedDemanded.length > 0 ? (
              skillInsights.matchedDemanded.map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-medium text-slate-200">{item.name}</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    In {item.count} active role{item.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 p-4 text-center border border-dashed border-slate-800 rounded-xl">
                Add more technical skills to your profile to see alignment.
              </div>
            )}
          </div>
        </div>

        {/* Recommended Skills to Learn */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Recommended Skills to Add
            </h2>
            <span className="text-xs text-slate-500">Market Opportunities</span>
          </div>
          <p className="text-xs text-slate-400">
            Adding or learning these frequently requested skills could increase your match scores:
          </p>

          <div className="space-y-2">
            {skillInsights.missingHighDemand.length > 0 ? (
              skillInsights.missingHighDemand.map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-medium text-slate-300">{item.name}</span>
                  <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    Required by {item.count} role{item.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-emerald-400 p-4 text-center border border-dashed border-emerald-500/20 bg-emerald-500/5 rounded-xl">
                Great match! Your skills cover the current open positions.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How PRISM AI Evaluates Candidates Transparently */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">How PRISM Evaluates Candidates Fairly</h2>
            <p className="text-xs text-slate-400">Research Framework Principles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs font-bold text-slate-200">1. Decoupled CGPA Screen</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              CGPA is screened via strict equality (<code className="text-indigo-300">CGPA ≥ Min</code>) and is never combined with match score to mask deficiencies or inflate ranking artificially.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs font-bold text-slate-200">2. Demographic Blindness</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              PRISM removes names, photos, gender, ethnicity, and other non-job-related attributes before neural scoring to guarantee equal opportunity.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs font-bold text-slate-200">3. Deterministic Feedback</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidate match scores are derived from transparent skill overlap, years of experience, and verifiable credentials without arbitrary black-box penalties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}