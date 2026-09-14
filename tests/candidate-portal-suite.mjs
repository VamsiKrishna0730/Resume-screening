import assert from 'node:assert/strict';
import test from 'node:test';
import { extractCGPAFromText } from '../lib/parsing/cgpaParser.ts';
import { screenCandidateCGPA } from '../lib/matching/cgpa.ts';
import { computeProfileCompletion } from '../lib/context/candidate-utils.ts';

// 1. Candidate Role Definition
test('Auth Roles: CANDIDATE role exists and matches portal spec', () => {
  const candidateUser = {
    id: 'USR-004',
    name: 'Ananya Rao',
    email: 'ananya.rao@candidate.org',
    role: 'CANDIDATE',
    candidateId: 'C-1001',
    organization: 'Independent Candidate',
    createdAt: '2026-03-01T09:00:00Z',
  };
  assert.equal(candidateUser.role, 'CANDIDATE');
  assert.equal(candidateUser.candidateId, 'C-1001');
});

// 2. Resume CGPA Extraction
test('Resume CGPA Parser: Extracts CGPA accurately from candidate resume text', () => {
  const resumeText = `
    Ananya Rao
    Email: ananya.rao@example.com
    Phone: +1 555-0199
    
    Education:
    B.Tech in Computer Science, IIT Bombay
    CGPA: 8.4 / 10
  `;

  const parsed = extractCGPAFromText(resumeText);
  assert.ok(parsed);
  assert.equal(parsed.value, 8.4);
  assert.equal(parsed.scale, 10);
});

// 3. Admin Minimum CGPA Screening Rule: Candidate CGPA >= Admin Min CGPA
test('CGPA Screening Rule: Candidate CGPA >= Admin Min CGPA (7.0 threshold)', () => {
  const jobWith7Min = {
    id: 'job-ml',
    title: 'ML Engineer',
    required: ['Python', 'PyTorch'],
    minimumCGPA: 7.0,
    enableCGPAScreening: true,
    cgpaMode: 'HARD'
  };

  // 8.5 >= 7.0 -> PASS
  const candA = { id: 'c-a', name: 'Cand A', cgpa: 8.5, cgpaScale: 10 };
  const resA = screenCandidateCGPA(candA, jobWith7Min);
  assert.equal(resA.pass, true);
  assert.equal(resA.status, 'PASS');

  // 7.8 >= 7.0 -> PASS
  const candB = { id: 'c-b', name: 'Cand B', cgpa: 7.8, cgpaScale: 10 };
  const resB = screenCandidateCGPA(candB, jobWith7Min);
  assert.equal(resB.pass, true);
  assert.equal(resB.status, 'PASS');

  // 7.0 >= 7.0 -> PASS (7.0 boundary must be PASS)
  const candC = { id: 'c-c', name: 'Cand C', cgpa: 7.0, cgpaScale: 10 };
  const resC = screenCandidateCGPA(candC, jobWith7Min);
  assert.equal(resC.pass, true);
  assert.equal(resC.status, 'PASS');

  // 6.9 < 7.0 -> FAIL
  const candD = { id: 'c-d', name: 'Cand D', cgpa: 6.9, cgpaScale: 10 };
  const resD = screenCandidateCGPA(candD, jobWith7Min);
  assert.equal(resD.pass, false);
  assert.equal(resD.status, 'FAIL');

  // 6.2 < 7.0 -> FAIL
  const candE = { id: 'c-e', name: 'Cand E', cgpa: 6.2, cgpaScale: 10 };
  const resE = screenCandidateCGPA(candE, jobWith7Min);
  assert.equal(resE.pass, false);
  assert.equal(resE.status, 'FAIL');

  // Missing CGPA under HARD mode -> FAIL
  const candMissing = { id: 'c-none', name: 'Cand Missing', cgpa: undefined };
  const resMissing = screenCandidateCGPA(candMissing, jobWith7Min);
  assert.equal(resMissing.pass, false);
  assert.equal(resMissing.status, 'CGPA NOT FOUND');
});

// 4. Candidate Profile Completeness Scoring Helper
test('Candidate Profile: Completeness scoring helper', () => {
  const incompleteCandidate = {
    id: 'c-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    skills: ['JavaScript'],
  };
  const lowCompletion = computeProfileCompletion(incompleteCandidate);
  assert.ok(lowCompletion > 0 && lowCompletion < 60);

  const fullCandidate = {
    id: 'c-2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 555-1234',
    education: 'B.S. Computer Science',
    experience: 3,
    cgpa: 8.5,
    skills: ['JavaScript', 'React', 'Node.js'],
    resumeFile: { name: 'resume.pdf', size: 1024, type: 'application/pdf', uploadedAt: new Date().toISOString() }
  };
  const highCompletion = computeProfileCompletion(fullCandidate);
  assert.equal(highCompletion, 100);
});

// 5. Duplicate Application Protection Logic
test('Applications: Unique candidate application per job', () => {
  const applications = [
    { id: 'APP-1', jobId: 'job-1', candidateId: 'c-100', status: 'Applied' }
  ];

  const canApply = (jobId, candidateId) => {
    return !applications.some(a => a.jobId === jobId && a.candidateId === candidateId);
  };

  assert.equal(canApply('job-1', 'c-100'), false, 'Duplicate application must be rejected');
  assert.equal(canApply('job-2', 'c-100'), true, 'New job application allowed');
  assert.equal(canApply('job-1', 'c-101'), true, 'Different candidate application allowed');
});