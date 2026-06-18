const assert = require('node:assert/strict');
const test = require('node:test');
const { ALLOWED_SKILLS, normalizeSkills } = require('./sync-tasks');

test('normalizeSkills only returns supported UI filter categories', () => {
  const result = normalizeSkills(
    ['Backend', 'backend', ' DevOps ', 'security', 'writing'],
    'help wanted'
  );

  assert.deepEqual(result, ['backend', 'writing']);
  assert.ok(result.every(skill => ALLOWED_SKILLS.includes(skill)));
});

test('normalizeSkills falls back to a matching label skill when LLM categories are unusable', () => {
  assert.deepEqual(normalizeSkills(['qa', 'testing'], 'documentation'), ['writing']);
  assert.deepEqual(normalizeSkills([], 'bug'), ['backend']);
});

test('normalizeSkills keeps unknown labels empty instead of inventing categories', () => {
  assert.deepEqual(normalizeSkills(['qa'], 'help wanted'), []);
});
