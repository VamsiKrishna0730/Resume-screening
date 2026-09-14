import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCGPA, normalizeCGPA, evaluateCGPA } from '../lib/matching/cgpa.ts';
import { extractCGPAFromText } from '../lib/parsing/cgpaParser.ts';

test('CGPA Validation and Scale Boundaries', () => {
  assert.equal(validateCGPA(8.5, 10).isValid, true);
  assert.equal(validateCGPA(3.8, 4).isValid, true);
  assert.equal(validateCGPA(85, 100).isValid, true);
  assert.equal(validateCGPA(10.5, 10).isValid, false);
  assert.equal(validateCGPA(-1, 4).isValid, false);
});

test('CGPA Normalization across Scales', () => {
  assert.equal(normalizeCGPA(8.0, 10), 0.8);
  assert.equal(normalizeCGPA(3.2, 4), 0.8);
  assert.equal(normalizeCGPA(80, 100), 0.8);
  assert.equal(normalizeCGPA(4.0, 5), 0.8);
});

test('Admin Screening Rules (candidateCGPA >= minimumCGPA)', () => {
  // Requirement: 7.0 / 10
  // 7.0 >= 7.0 -> PASS (Exactly equal must be PASS)
  const resExact = evaluateCGPA(7.0, 10, 7.0, 10, 'HARD');
  assert.equal(resExact.screeningStatus, 'PASS');
  assert.equal(resExact.isEligible, true);

  // 7.1 >= 7.0 -> PASS
  const res71 = evaluateCGPA(7.1, 10, 7.0, 10, 'HARD');
  assert.equal(res71.screeningStatus, 'PASS');
  assert.equal(res71.isEligible, true);

  // 8.5 >= 7.0 -> PASS
  const res85 = evaluateCGPA(8.5, 10, 7.0, 10, 'HARD');
  assert.equal(res85.screeningStatus, 'PASS');
  assert.equal(res85.isEligible, true);

  // 9.2 >= 7.0 -> PASS
  const res92 = evaluateCGPA(9.2, 10, 7.0, 10, 'HARD');
  assert.equal(res92.screeningStatus, 'PASS');
  assert.equal(res92.isEligible, true);

  // 6.99 < 7.0 -> FAIL
  const res699 = evaluateCGPA(6.99, 10, 7.0, 10, 'HARD');
  assert.equal(res699.screeningStatus, 'FAIL');
  assert.equal(res699.isEligible, false);

  // 6.9 < 7.0 -> FAIL
  const res69 = evaluateCGPA(6.9, 10, 7.0, 10, 'HARD');
  assert.equal(res69.screeningStatus, 'FAIL');
  assert.equal(res69.isEligible, false);

  // 5.0 < 7.0 -> FAIL
  const res50 = evaluateCGPA(5.0, 10, 7.0, 10, 'HARD');
  assert.equal(res50.screeningStatus, 'FAIL');
  assert.equal(res50.isEligible, false);

  // Missing CGPA -> CGPA NOT FOUND
  const resMissing = evaluateCGPA(undefined, undefined, 7.0, 10, 'HARD');
  assert.equal(resMissing.screeningStatus, 'CGPA NOT FOUND');
  assert.equal(resMissing.isEligible, false);

  // Invalid CGPA -> INVALID CGPA
  const resInvalidNeg = evaluateCGPA(-2, 10, 7.0, 10, 'HARD');
  assert.equal(resInvalidNeg.screeningStatus, 'INVALID CGPA');
  assert.equal(resInvalidNeg.isEligible, false);

  const resInvalidOver = evaluateCGPA(15, 10, 7.0, 10, 'HARD');
  assert.equal(resInvalidOver.screeningStatus, 'INVALID CGPA');
  assert.equal(resInvalidOver.isEligible, false);
});

test('Scale-Normalized Screening Comparisons', () => {
  // Candidate: 3.2 / 4 (0.80) vs Requirement: 7.0 / 10 (0.70) -> PASS
  const resPass4 = evaluateCGPA(3.2, 4, 7.0, 10, 'HARD');
  assert.equal(resPass4.screeningStatus, 'PASS');
  assert.equal(resPass4.isEligible, true);

  // Candidate: 2.5 / 4 (0.625) vs Requirement: 7.0 / 10 (0.70) -> FAIL
  const resFail4 = evaluateCGPA(2.5, 4, 7.0, 10, 'HARD');
  assert.equal(resFail4.screeningStatus, 'FAIL');
  assert.equal(resFail4.isEligible, false);

  // Candidate: 85% / 100 vs Requirement: 8.0 / 10 -> PASS
  const resPass100 = evaluateCGPA(85, 100, 8.0, 10, 'HARD');
  assert.equal(resPass100.screeningStatus, 'PASS');
  assert.equal(resPass100.isEligible, true);
});

test('CGPA Evaluation - Soft Mode', () => {
  // Above minimum requirement
  const evalAbove = evaluateCGPA(8.5, 10, 7.5, 10, 'SOFT');
  assert.equal(evalAbove.isEligible, true);
  assert.equal(evalAbove.screeningStatus, 'PASS');
  assert.ok(evalAbove.score >= 0.85);

  // Below minimum requirement: proportional bounded score, still eligible
  const evalBelow = evaluateCGPA(6.0, 10, 7.5, 10, 'SOFT');
  assert.equal(evalBelow.isEligible, true);
  assert.equal(evalBelow.screeningStatus, 'FAIL');
  assert.ok(evalBelow.score < 0.85);
  assert.ok(evalBelow.score > 0.4);

  // Missing CGPA: Neutral fallback
  const evalMissing = evaluateCGPA(undefined, undefined, 7.5, 10, 'SOFT');
  assert.equal(evalMissing.isEligible, true);
  assert.equal(evalMissing.screeningStatus, 'CGPA NOT FOUND');
  assert.equal(evalMissing.score, 0.75);
});

test('Regex Parser - Extract CGPA from Unstructured Text', () => {
  const t1 = "Graduated with CGPA: 8.5/10 from NIT Trichy with honors.";
  const res1 = extractCGPAFromText(t1);
  assert.ok(res1);
  assert.equal(res1.value, 8.5);
  assert.equal(res1.scale, 10);

  const t2 = "Academic record: GPA 3.5 / 4 in Computer Science.";
  const res2 = extractCGPAFromText(t2);
  assert.ok(res2);
  assert.equal(res2.value, 3.5);
  assert.equal(res2.scale, 4);

  const t3 = "Candidate aggregate: 85 / 100 in Bachelor of Engineering.";
  const res3 = extractCGPAFromText(t3);
  assert.ok(res3);
  assert.equal(res3.value, 85);
  assert.equal(res3.scale, 100);

  const t4 = "C.G.P.A: 7.9 achieved during undergraduate curriculum.";
  const res4 = extractCGPAFromText(t4);
  assert.ok(res4);
  assert.equal(res4.value, 7.9);
  assert.equal(res4.scale, 10);

  const t5 = "CGPA 8.2 across 8 semesters.";
  const res5 = extractCGPAFromText(t5);
  assert.ok(res5);
  assert.equal(res5.value, 8.2);
  assert.equal(res5.scale, 10);

  // False positive rejection (salary / years)
  const tFalse = "Current compensation: 12 LPA with 8 years of experience.";
  const resFalse = extractCGPAFromText(tFalse);
  assert.equal(resFalse, null);
});
