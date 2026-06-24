// Badges & Gamification Module
import { badgeServices } from './firebase.js';
import { badges } from './config.js';

export async function checkBadges(userId, stats) {
  const earnedBadges = [];
  for (const badge of badges) {
    if (badge.condition(stats)) {
      earnedBadges.push(badge.id);
    }
  }
  return earnedBadges;
}

export function renderBadges(badgeIds) {
  return badgeIds.map(id => {
    const badge = badges.find(b => b.id === id);
    if (!badge) return '';
    return `
      <div style="text-align: center; padding: var(--spacing-lg); border-radius: var(--radius-lg); background: var(--surface-light); flex: 1;">
        <div style="font-size: 32px; margin-bottom: var(--spacing-sm);">${badge.emoji}</div>
        <div style="font-weight: 600;">${badge.title}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${badge.description}</div>
      </div>
    `;
  }).join('');
}
