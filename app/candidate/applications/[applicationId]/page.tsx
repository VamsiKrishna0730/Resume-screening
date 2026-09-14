'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useApp } from '@/lib/context/AppContext';
import { 
  CheckCircle2, Clock, 
  ArrowLeft, Building, MapPin, AlertCircle, Trash2, 
  Sparkles, Check, HelpCircle
} from 'lucide-react';

export default function CandidateApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { applicationsList, candidatesList, jobsList, withdrawApplication } = useApp();

  const appId = params?.applicationId as string;
  const application = applicationsList.find(a => a.id === appId);

  const candidate = candidatesList.find(c => 
    c.id === user?.candidateId || 
    (c.email && user?.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
    c.source === 'Candidate Portal'
  ) || candidatesList[0];

  const job = jobsList.find(j => j.id === application?.jobId);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Application Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">This application reference does not exist or has been removed.</p>
        <Link
          href="/candidate/applications"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Applications
        </Link>
      </div>
    );
  }

  const handleWithdraw = () => {
    withdrawApplication(application.id);
    setShowWithdrawConfirm(false);
    router.push('/candidate/applications');
  };

  const steps = [
    { title: 'Application Submitted', date: application.appliedAt, active: true, done: true },
    { 
      title: 'Academic & CGPA Screening', 
      date: application.cgpaScreeningStatus ? 'Automated Check' : 'Pending', 
      active: true, 
      done: true,
      badge: application.cgpaEligible ? 'Passed' : 'Screened'
    },
    { 
      title: 'Under Recruiter Review', 
      date: application.status === 'Under Review' || application.status === 'Shortlisted' ? 'In Progress' : 'Pending', 
      active: application.status === 'Under Review' || application.status === 'Shortlisted', 
      done: application.status === 'Shortlisted' 
    },
    { 
      title: 'Shortlisted / Interview Scheduled', 
      date: application.status === 'Shortlisted' ? 'Current Stage' : 'Pending', 
      active: application.status === 'Shortlisted', 
      done: application.status === 'Shortlisted' 
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div>
        <Link
          href="/candidate/applications"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Applications
        </Link>
      </div>

      {/* Main Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                Application #{application.id.slice(-6)}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                application.status === 'Shortlisted' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                application.status === 'Rejected' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                application.status === 'Withdrawn' ? 'bg-slate-800 border-slate-700 text-slate-400' :
                'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {application.status}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {job?.title || application.jobTitle}
            </h1>

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
                Submitted on {new Date(application.appliedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {application.status !== 'Withdrawn' && application.status !== 'Rejected' && (
            <button
              type="button"
              onClick={() => setShowWithdrawConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/50 rounded-xl text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Withdraw
            </button>
          )}
        </div>
      </div>

      {/* Application Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Application Timeline & Progress
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start justify-between gap-4">
              <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                step.done 
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                  : step.active 
                    ? 'bg-indigo-500 border-indigo-400 animate-pulse' 
                    : 'bg-slate-900 border-slate-700'
              }`}>
                {step.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>

              <div>
                <div className="text-sm font-semibold text-white">{step.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{step.date}</div>
              </div>

              {step.badge && (
                <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {step.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Screening & Compatibility Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CGPA Eligibility Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Academic Screening Verdict
          </span>

          {application.cgpaScreeningStatus ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">CGPA Requirement Status:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  application.cgpaEligible 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {application.cgpaScreeningStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {application.cgpaScreeningReason}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No mandatory academic cutoff was enforced for this job requisition.
            </p>
          )}
        </div>

        {/* Explainable Match Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center justify-between">
            <span>Overall Profile Match</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </span>

          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-white">
              {application.matchScore ?? 80}%
            </div>
            <div className="text-xs text-slate-400">
              Evaluated across your technical skills, work experience, and profile completeness.
            </div>
          </div>
        </div>
      </div>

      {/* Fairness & Privacy Guarantee */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">PRISM Fair Recruitment Guarantee:</span>
          <p className="mt-0.5">
            Your application is evaluated with debiased AI models that do not use demographic identifiers or protected attributes during scoring.
          </p>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Withdraw Application?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to withdraw your application for <strong className="text-white">{job?.title || application.jobTitle}</strong>? The recruiter will be notified and your submission will be archived.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWithdrawConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Yes, Withdraw Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}