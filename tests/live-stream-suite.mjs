import assert from 'node:assert';
import test from 'node:test';

class LiveStreamModalSimulator {
  constructor() {
    this.isOpen = false;
    this.streamTitle = '';
    this.streamTitleError = '';
    this.category = 'Research Demo';
    this.visibility = 'Public';
    this.liveSessions = [
      { id: 'stream-1', title: 'Real-Time Candidate Matching & Scoring Demo', status: 'LIVE' },
      { id: 'stream-2', title: 'Fairness & Bias Mitigation Audit Walkthrough', status: 'LIVE' }
    ];
    this.toasts = [];
    this.currentRoute = '/dashboard';
  }

  open() {
    this.isOpen = true;
    this.streamTitleError = '';
  }

  close() {
    this.isOpen = false;
    this.streamTitleError = '';
  }

  setTitle(val) {
    this.streamTitle = val;
    if (this.streamTitleError) {
      this.streamTitleError = '';
    }
  }

  notify(msg) {
    this.toasts.push(msg);
  }

  handleGoLive() {
    const trimmedTitle = this.streamTitle.trim();
    if (!trimmedTitle) {
      this.streamTitleError = 'Please enter a stream title.';
      return false;
    }

    this.streamTitleError = '';
    const newSession = {
      id: `stream-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: trimmedTitle,
      host: 'Lead Researcher',
      viewers: 1,
      status: 'LIVE',
      category: this.category
    };
    this.liveSessions.unshift(newSession);
    this.streamTitle = '';
    this.close();
    this.notify(`Live broadcast started: "${newSession.title}"`);
    return true;
  }
}

test('Case 1 — Empty title validation', () => {
  const sim = new LiveStreamModalSimulator();
  sim.open();
  assert.strictEqual(sim.isOpen, true);

  const success = sim.handleGoLive();

  assert.strictEqual(success, false, 'Go Live should fail with empty title');
  assert.strictEqual(sim.isOpen, true, 'Modal must remain open');
  assert.strictEqual(sim.streamTitleError, 'Please enter a stream title.', 'Inline error must be set');
  assert.strictEqual(sim.toasts.length, 0, 'No toast should be emitted for empty title validation');
  assert.strictEqual(sim.currentRoute, '/dashboard', 'User must remain on current dashboard route');
});

test('Case 2 — Spaces only title validation', () => {
  const sim = new LiveStreamModalSimulator();
  sim.open();

  sim.setTitle('     ');
  const success = sim.handleGoLive();

  assert.strictEqual(success, false, 'Go Live should fail with whitespace-only title');
  assert.strictEqual(sim.isOpen, true, 'Modal must remain open');
  assert.strictEqual(sim.streamTitleError, 'Please enter a stream title.', 'Inline error must be set');
  assert.strictEqual(sim.toasts.length, 0, 'No toast emitted');
});

test('Case 3 — Valid title submission', () => {
  const sim = new LiveStreamModalSimulator();
  sim.open();

  sim.setTitle('Live XAI Evaluation Walkthrough');
  const success = sim.handleGoLive();

  assert.strictEqual(success, true, 'Go Live should succeed with valid title');
  assert.strictEqual(sim.isOpen, false, 'Modal should close on success');
  assert.strictEqual(sim.streamTitleError, '', 'No error on success');
  assert.strictEqual(sim.liveSessions[0].title, 'Live XAI Evaluation Walkthrough');
  assert.strictEqual(sim.liveSessions[0].status, 'LIVE');
  assert.strictEqual(sim.currentRoute, '/dashboard', 'User stays on dashboard');
  assert.strictEqual(sim.toasts.length, 1);
  assert.ok(sim.toasts[0].includes('Live broadcast started: "Live XAI Evaluation Walkthrough"'));
});

test('Case 4 — Error recovery on typing', () => {
  const sim = new LiveStreamModalSimulator();
  sim.open();

  sim.handleGoLive();
  assert.strictEqual(sim.streamTitleError, 'Please enter a stream title.');

  sim.setTitle('PRISM Research Demo');
  assert.strictEqual(sim.streamTitleError, '', 'Error must disappear immediately on typing');

  const success = sim.handleGoLive();
  assert.strictEqual(success, true);
  assert.strictEqual(sim.liveSessions[0].title, 'PRISM Research Demo');
});

test('Case 5 — Cancel after error and clean modal reopening', () => {
  const sim = new LiveStreamModalSimulator();
  sim.open();

  sim.handleGoLive();
  assert.strictEqual(sim.streamTitleError, 'Please enter a stream title.');

  sim.close();
  assert.strictEqual(sim.isOpen, false);
  assert.strictEqual(sim.streamTitleError, '', 'Error state cleared on cancel');
  assert.strictEqual(sim.liveSessions.length, 2, 'No session started');
  assert.strictEqual(sim.toasts.length, 0, 'No toast on cancel');

  sim.open();
  assert.strictEqual(sim.isOpen, true);
  assert.strictEqual(sim.streamTitleError, '', 'Reopened modal must not display previous errors');
});
