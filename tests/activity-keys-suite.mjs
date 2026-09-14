import assert from 'node:assert/strict';
import test from 'node:test';
import { createActivityId, findDuplicateActivityIds, normalizeActivities } from '../lib/context/activity-utils.ts';

test('Test 1 — Activities created rapidly receive guaranteed unique IDs', () => {
  const ids = new Set();
  const count = 1000;
  for (let i = 0; i < count; i++) {
    const id = createActivityId();
    assert.equal(typeof id, 'string');
    assert.ok(id.length > 10);
    ids.add(id);
  }
  // All 1000 IDs must be distinct even if generated in the same millisecond
  assert.equal(ids.size, count);
});

test('Test 2 — Duplicate activity ID detection helper', () => {
  const uniqueList = [
    { id: 'act-1', time: '10:00', event: 'Event 1', subject: 'Cand A', status: 'Complete' },
    { id: 'act-2', time: '10:01', event: 'Event 2', subject: 'Cand B', status: 'Complete' },
  ];
  assert.deepEqual(findDuplicateActivityIds(uniqueList), []);

  const duplicateList = [
    { id: '1789415119176', time: '10:00', event: 'Event A', subject: 'Cand 1', status: 'Complete' },
    { id: '1789415119176', time: '10:00', event: 'Event B', subject: 'Cand 2', status: 'Complete' },
    { id: 'act-3', time: '10:01', event: 'Event C', subject: 'Cand 3', status: 'Complete' },
  ];
  assert.deepEqual(findDuplicateActivityIds(duplicateList), ['1789415119176']);
});

test('Test 3 — Normalization of persisted activities with duplicate 1789415119176', () => {
  const persistedActivities = [
    { id: 1789415119176, time: '10:00', event: 'Candidate scored', subject: 'C-1001', status: 'Complete' },
    { id: '1789415119176', time: '10:00', event: 'Recruiter decision: Recommended', subject: 'C-1001', status: 'Complete' },
    { id: 'act-distinct', time: '10:05', event: 'Job updated', subject: 'JOB-001', status: 'Complete' },
  ];

  const normalized = normalizeActivities(persistedActivities);

  // Both activities must be preserved
  assert.equal(normalized.length, 3);
  assert.equal(normalized[0].subject, 'C-1001');
  assert.equal(normalized[1].subject, 'C-1001');
  assert.equal(normalized[2].id, 'act-distinct');

  // IDs must now be unique strings
  const ids = normalized.map(a => a.id);
  assert.equal(new Set(ids).size, 3);
  assert.notEqual(normalized[0].id, normalized[1].id);
  assert.equal(findDuplicateActivityIds(normalized).length, 0);
});

test('Test 4 — Legitimate separate activities with identical text/time are preserved with distinct IDs', () => {
  const a1 = {
    id: createActivityId(),
    time: '12:00',
    event: 'Screening run completed',
    subject: 'JOB-001',
    status: 'Complete'
  };
  const a2 = {
    id: createActivityId(),
    time: '12:00',
    event: 'Screening run completed',
    subject: 'JOB-001',
    status: 'Complete'
  };

  assert.notEqual(a1.id, a2.id);
  assert.equal(a1.event, a2.event);
  assert.equal(a1.time, a2.time);

  const activities = [a1, a2];
  const normalized = normalizeActivities(activities);
  assert.equal(normalized.length, 2);
  assert.notEqual(normalized[0].id, normalized[1].id);
  assert.equal(findDuplicateActivityIds(normalized).length, 0);
});

test('Test 5 — Defensive screening slice rendering uniqueness', () => {
  const activities = [
    { id: createActivityId(), time: '09:00', event: 'Ev 1', subject: 'Sub 1', status: 'Complete' },
    { id: createActivityId(), time: '09:01', event: 'Ev 2', subject: 'Sub 2', status: 'Complete' },
    { id: createActivityId(), time: '09:02', event: 'Ev 3', subject: 'Sub 3', status: 'Complete' },
    { id: createActivityId(), time: '09:03', event: 'Ev 4', subject: 'Sub 4', status: 'Complete' },
  ];

  const renderedSlice = activities.slice(-4).reverse();
  const renderedKeys = renderedSlice.map(a => a.id);
  assert.equal(new Set(renderedKeys).size, renderedSlice.length);
});
