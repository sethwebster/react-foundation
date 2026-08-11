// Label is a text-only primitive; alone it is one line of grey text. Show it
// doing its real job — bound with htmlFor to a control, with `required` marking
// the field as mandatory (renders a destructive-coloured asterisk).
import { Input, Label, Select, Textarea } from 'storefront';

export const RequiredVsOptional = () => (
  <div className="flex flex-col gap-4 max-w-sm">
    <div className="flex flex-col gap-2">
      <Label htmlFor="lb-handle" required>
        GitHub username
      </Label>
      <Input id="lb-handle" placeholder="acdlite" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="lb-company">Employer (optional)</Label>
      <Input id="lb-company" placeholder="Vercel" />
    </div>
  </div>
);

export const BoundToControls = () => (
  <div className="flex flex-col gap-4 max-w-sm">
    <div className="flex flex-col gap-2">
      <Label htmlFor="lb-rfc" required>
        RFC title
      </Label>
      <Input id="lb-rfc" defaultValue="RFC 0042: Streaming Server Components" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="lb-tier" required>
        Sponsorship tier
      </Label>
      <Select id="lb-tier" defaultValue="gold">
        <option value="gold">Gold — $25,000/yr</option>
        <option value="silver">Silver — $10,000/yr</option>
      </Select>
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="lb-notes">Reviewer notes</Label>
      <Textarea
        id="lb-notes"
        rows={2}
        defaultValue="Scope looks right; wants a migration path for legacy routers."
      />
    </div>
  </div>
);

export const RequiredMarker = () => (
  <div className="flex flex-col gap-6 max-w-sm">
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        default
      </span>
      <Label htmlFor="lb-m-default">Maintainer email</Label>
      <Input id="lb-m-default" defaultValue="maintainers@reactjs.org" />
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        required — appends a destructive asterisk
      </span>
      <Label htmlFor="lb-m-required" required>
        Maintainer email
      </Label>
      <Input id="lb-m-required" variant="error" placeholder="you@example.com" />
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        className override
      </span>
      <Label htmlFor="lb-m-muted" className="text-muted-foreground">
        Internal reviewer ID
      </Label>
      <Input id="lb-m-muted" readOnly defaultValue="rev-2026-0117" />
    </div>
  </div>
);
