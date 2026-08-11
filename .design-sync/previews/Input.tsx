// Input is a full-width h-10 control; on its own it reads as an empty box, so
// show it the way forms use it: Label + control + helper/validation text.
import { Input, Label } from 'storefront';

export const LabelledField = () => (
  <div className="flex flex-col gap-4 max-w-sm">
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-handle" required>
        GitHub username
      </Label>
      <Input id="in-handle" name="githubUsername" placeholder="sebmarkbage" />
      <p className="text-xs text-muted-foreground">
        Used to match your contributions across 54 ecosystem repositories.
      </p>
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-email">Maintainer email</Label>
      <Input
        id="in-email"
        name="email"
        type="email"
        defaultValue="maintainers@tanstack.com"
      />
    </div>
  </div>
);

export const Variants = () => (
  <div className="flex flex-col gap-4 max-w-sm">
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-v-default">Library name</Label>
      <Input id="in-v-default" variant="default" defaultValue="react-router" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-v-error" required>
        Repository URL
      </Label>
      <Input id="in-v-error" variant="error" defaultValue="github.com/remix-run" />
      <p className="text-xs text-destructive">
        Must be a full https:// URL to a public repository.
      </p>
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-v-success">Sponsorship amount (USD)</Label>
      <Input id="in-v-success" variant="success" type="text" defaultValue="25,000" />
      <p className="text-xs text-success">Tier confirmed: Founding Member.</p>
    </div>
  </div>
);

export const States = () => (
  <div className="flex flex-col gap-4 max-w-sm">
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-s-empty">Empty with placeholder</Label>
      <Input id="in-s-empty" placeholder="RFC title, e.g. View Transitions" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-s-filled">Filled</Label>
      <Input id="in-s-filled" defaultValue="RFC 0042: Streaming Server Components" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-s-readonly">Read only</Label>
      <Input id="in-s-readonly" readOnly defaultValue="rfc-0042-streaming" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="in-s-disabled">Disabled</Label>
      <Input id="in-s-disabled" disabled defaultValue="Locked after submission" />
    </div>
  </div>
);
