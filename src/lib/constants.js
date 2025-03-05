export const CHALLENGE_CATEGORIES = [
  'Web',
  'Cryptography',
  'Forensics',
  'Reverse Engineering',
  'Misc',
  'PWN',
];

export const CHALLENGE_CATEGORIES_COLORS = {
  Web: 'primary',
  Cryptography: 'secondary',
  Forensics: 'success',
  'Reverse Engineering': 'danger',
  Misc: 'default',
  PWN: 'danger',
};

export const CHALLENGE_DIFFICULTIES = [
  'Fundamentals',
  'Easy',
  'Medium',
  'Hard',
];

export const CHALLENGE_DIFFICULTIES_COLORS = {
  Fundamentals: 'secondary',
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

export const EVENT_END_TIME = new Date('2025-03-05T13:30:00Z');

export function isEventEnded() {
  const now = new Date();
  return now >= EVENT_END_TIME;
}
