'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useApp } from '@/lib/context/AppContext';
import { Candidate } from '@/lib/matching/types';
import { computeProfileCompletion } from '@/lib/context/candidate-utils';
import { 
  User, Mail, Phone, GraduationCap, Award, Briefcase, 
  Code, Plus, X, CheckCircle2, AlertCircle, Save, 
  Sparkles, RefreshCw
} from 'lucide-react';

export default function CandidateProfilePage() {
  const { user } = useAuth();
  const { candidatesList, updateCandidateProfile } = useApp();

  const candidate = candidatesList.find(c => 
    c.id === user?.candidateId || 
    (c.email && user?.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
    c.source === 'Candidate Portal'
  ) || candidatesList[0];

  const [formData, setFormData] = useState<Partial<Candidate>>({
    name: '',
    email: '',
    phone: '',
    cgpa: undefined,
    education: '',
    experience: 0,
    skills: [],
    projects: [],
    certifications: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newProject, setNewProject] = useState({ title: '', tech: '', desc: '' });
  const [showAddProject, setShowAddProject] = useState(false);
  const [newCert, setNewCert] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        email: candidate.email || user?.email || '',
        phone: candidate.phone || '',
        cgpa: candidate.cgpa,
        education: candidate.education || '',
        experience: candidate.experience ?? 0,
        skills: [...(candidate.skills || [])],
        projects: candidate.projects ? [...candidate.projects] : [],
        certifications: candidate.certifications ? [...candidate.certifications] : [],
      });
    }
  }, [candidate, user?.email]);

  const completion = candidate ? computeProfileCompletion(candidate) : 0;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !formData.skills?.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), trimmed]
      }));
      setNewSkill('');
      setIsEdited(true);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skillToRemove) || []
    }));
    setIsEdited(true);
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCert.trim();
    if (trimmed && !formData.certifications?.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), trimmed]
      }));
      setNewCert('');
      setIsEdited(true);
    }
  };

  const handleRemoveCert = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter(c => c !== cert) || []
    }));
    setIsEdited(true);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    const projectSummary = newProject.desc.trim() 
      ? `${newProject.title.trim()}: ${newProject.desc.trim()} (${newProject.tech.trim()})`
      : newProject.tech.trim() 
        ? `${newProject.title.trim()} (${newProject.tech.trim()})`
        : newProject.title.trim();
    setFormData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), projectSummary]
    }));
    setNewProject({ title: '', tech: '', desc: '' });
    setShowAddProject(false);
    setIsEdited(true);
  };

  const handleRemoveProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || []
    }));
    setIsEdited(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    updateCandidateProfile(candidate.id, {
      ...formData,
      skills: formData.skills || [],
      experience: Number(formData.experience) || 0,
      cgpa: formData.cgpa !== undefined && formData.cgpa !== null && !isNaN(Number(formData.cgpa)) 
        ? Number(formData.cgpa) 
        : undefined,
    });

    setSaveSuccess(true);
    setIsEdited(false);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              Candidate Profile
            </span>
            {candidate?.resumeFile && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Parsed from Resume
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Review & Edit Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Ensure your details, CGPA, skills, and qualifications are accurate. PRISM uses this for fair job matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/candidate/resume"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition border border-slate-700"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            Re-parse Resume
          </Link>
          <button
            onClick={handleSave}
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Profile updated successfully! All job matches and CGPA checks have been synchronized.</span>
        </div>
      )}

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-2/3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-300 font-medium">Profile Completeness</span>
            <span className="text-emerald-400 font-bold">{completion}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>Complete profiles have a higher match visibility for relevant open roles.</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-indigo-400" />
            Personal & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => { setFormData({ ...formData, name: e.target.value }); setIsEdited(true); }}
                className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. Ananya Rao"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => { setFormData({ ...formData, email: e.target.value }); setIsEdited(true); }}
                  className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="name@example.com"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={e => { setFormData({ ...formData, phone: e.target.value }); setIsEdited(true); }}
                  className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="+1 (555) 019-2834"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Years of Professional Experience
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={formData.experience ?? ''}
                  onChange={e => { setFormData({ ...formData, experience: parseFloat(e.target.value) || 0 }); setIsEdited(true); }}
                  className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. 3.5"
                />
                <Briefcase className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Education & Academic Screening
            </h2>
            <span className="text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20">
              PRISM Screening Criterion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Highest Degree / Institution
              </label>
              <input
                type="text"
                value={formData.education || ''}
                onChange={e => { setFormData({ ...formData, education: e.target.value }); setIsEdited(true); }}
                className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. B.Tech Computer Science, IIT Bombay"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Academic CGPA / GPA (10-point scale)
                </label>
                <span className="text-[11px] text-slate-400">Range: 0.0 - 10.0</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa !== undefined && formData.cgpa !== null ? formData.cgpa : ''}
                  onChange={e => {
                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    setFormData({ ...formData, cgpa: val });
                    setIsEdited(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. 8.4"
                />
                <Award className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3" />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {formData.cgpa !== undefined ? (
                  <span className="text-emerald-400 font-medium">
                    ✓ CGPA recorded: {formData.cgpa} / 10.0. Will be matched against job minimum CGPA thresholds.
                  </span>
                ) : (
                  <span className="text-amber-400">
                    ⚠ No CGPA entered. Roles with mandatory minimum CGPA may mark your profile as ineligible.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              Technical & Domain Skills
            </h2>
            <span className="text-xs text-slate-400">
              {formData.skills?.length || 0} skills added
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            These skills are matched semantically against role requirements. Add relevant technologies, frameworks, and tools.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(e); } }}
              placeholder="e.g. PyTorch, TypeScript, Docker..."
              className="flex-1 bg-slate-950 border border-slate-750 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-slate-950/60 rounded-xl border border-slate-850">
            {formData.skills && formData.skills.length > 0 ? (
              formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No skills listed yet. Add technical skills above or upload your resume.</span>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                Featured Projects
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Highlight impactful engineering or academic work extracted from your resume or added manually.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddProject(!showAddProject)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" /> {showAddProject ? 'Cancel' : 'Add Project'}
            </button>
          </div>

          {showAddProject && (
            <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl mb-4 space-y-3">
              <input
                type="text"
                placeholder="Project Title (e.g. Distributed Key-Value Store)"
                value={newProject.title}
                onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Technologies used (comma separated, e.g. Go, Raft, gRPC)"
                value={newProject.tech}
                onChange={e => setNewProject({ ...newProject, tech: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <textarea
                placeholder="Brief summary of your contributions and impact..."
                value={newProject.desc}
                onChange={e => setNewProject({ ...newProject, desc: e.target.value })}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="button"
                onClick={handleAddProject}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Confirm Project
              </button>
            </div>
          )}

          <div className="space-y-3">
            {formData.projects && formData.projects.length > 0 ? (
              formData.projects.map((proj, idx) => (
                <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-slate-100">{proj}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition"
                    title="Remove project"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No projects added yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-indigo-400" />
            Certifications & Licenses
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCert}
              onChange={e => setNewCert(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCert(e); } }}
              placeholder="e.g. AWS Certified Solutions Architect, CKA..."
              className="flex-1 bg-slate-950 border border-slate-750 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={handleAddCert}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-4 h-4" /> Add Cert
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.certifications && formData.certifications.length > 0 ? (
              formData.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-700"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {cert}
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(cert)}
                    className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No certifications added.</span>
            )}
          </div>
        </div>

        <div className="sticky bottom-6 p-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            {isEdited ? (
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Unsaved modifications
              </span>
            ) : (
              <span className="text-xs text-slate-400">All changes saved in local storage.</span>
            )}
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
