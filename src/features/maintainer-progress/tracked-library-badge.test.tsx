import { describe, expect, it } from 'vitest';

import {
  BADGE_CONTRIBUTED_CLASSES,
  BADGE_MUTED_CLASSES,
  COUNT_CHIP_CLASSES,
} from './tracked-library-badge';

describe('TrackedLibraryBadge readability classes', () => {
  describe('contributed-library badge container', () => {
    it('pairs the dark-theme emerald text with an explicit light-theme variant so the badge stays readable in both themes', () => {
      expect(BADGE_CONTRIBUTED_CLASSES).toContain('text-emerald-700');
      expect(BADGE_CONTRIBUTED_CLASSES).toContain('dark:text-emerald-200');
    });

    it('does not fall back to the muted foreground color used for libraries without contributions', () => {
      expect(BADGE_CONTRIBUTED_CLASSES).not.toContain('text-foreground/50');
    });
  });

  describe('library-without-contributions badge container', () => {
    it('uses the muted foreground color', () => {
      expect(BADGE_MUTED_CLASSES).toContain('text-foreground/50');
    });

    it('does not use the contributed-library emerald text colors', () => {
      expect(BADGE_MUTED_CLASSES).not.toContain('text-emerald-700');
      expect(BADGE_MUTED_CLASSES).not.toContain('dark:text-emerald-200');
    });
  });

  describe('contribution-count chip', () => {
    it('pairs the dark-theme emerald text with an explicit light-theme variant so the count stays readable in both themes', () => {
      expect(COUNT_CHIP_CLASSES).toContain('text-emerald-800');
      expect(COUNT_CHIP_CLASSES).toContain('dark:text-emerald-100');
    });
  });
});
