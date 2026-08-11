// Select renders nothing meaningful without <option> children, so every story
// supplies a real option list plus its Label.
import { Label, Select } from 'storefront';

export const SponsorshipTier = () => (
  <div className="flex flex-col gap-2 max-w-sm">
    <Label htmlFor="sel-tier" required>
      Sponsorship tier
    </Label>
    <Select id="sel-tier" name="tier" defaultValue="gold">
      <option value="">Select a tier…</option>
      <option value="founding">Founding Member — $250,000/yr</option>
      <option value="platinum">Platinum — $100,000/yr</option>
      <option value="gold">Gold — $25,000/yr</option>
      <option value="silver">Silver — $10,000/yr</option>
    </Select>
    <p className="text-xs text-muted-foreground">
      Tier determines logo placement and committee eligibility.
    </p>
  </div>
);

export const Variants = () => (
  <div className="flex flex-col gap-4 max-w-sm">
    <div className="flex flex-col gap-2">
      <Label htmlFor="sel-default">Ecosystem library</Label>
      <Select id="sel-default" variant="default" defaultValue="tanstack-query">
        <option value="react-router">React Router</option>
        <option value="tanstack-query">TanStack Query</option>
        <option value="redux">Redux Toolkit</option>
        <option value="next">Next.js</option>
      </Select>
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="sel-error" required>
        RFC stage
      </Label>
      <Select id="sel-error" variant="error" defaultValue="">
        <option value="">Select a stage…</option>
        <option value="draft">Draft</option>
        <option value="review">In review</option>
        <option value="accepted">Accepted</option>
      </Select>
      <p className="text-xs text-destructive">Pick a stage before submitting.</p>
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="sel-success">Maintainer role</Label>
      <Select id="sel-success" variant="success" defaultValue="core">
        <option value="core">Core maintainer</option>
        <option value="triage">Triage</option>
        <option value="docs">Docs</option>
      </Select>
      <p className="text-xs text-success">Verified against the GitHub org.</p>
    </div>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-col gap-2 max-w-sm">
    <Label htmlFor="sel-disabled">Grant cycle (locked)</Label>
    <Select id="sel-disabled" disabled defaultValue="2026-q3">
      <option value="2026-q3">2026 Q3 — closed</option>
      <option value="2026-q4">2026 Q4</option>
    </Select>
    <p className="text-xs text-muted-foreground">
      Cycle is fixed once an application is opened.
    </p>
  </div>
);
